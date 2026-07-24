import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { createReadStream } from 'node:fs';
import { resolve } from 'node:path';
import csvParser from 'csv-parser';

const prisma = new PrismaClient();
const dataDir = resolve(__dirname, 'data');

function parseCSV(filename: string): Promise<Record<string, string>[]> {
  const { promise, resolve: fulfill, reject } = Promise.withResolvers<Record<string, string>[]>();
  const results: Record<string, string>[] = [];
  createReadStream(resolve(dataDir, filename), 'utf-8')
    .pipe(csvParser())
    .on('data', (row) => results.push(row))
    .on('end', () => fulfill(results))
    .on('error', reject);
  return promise;
}

async function main() {
  // Seed genres
  const genresData = await parseCSV('genres.csv');
  for (const g of genresData) {
    await prisma.genre.upsert({ where: { name: g.name }, update: {}, create: { name: g.name } });
  }

  // Seed platforms
  const platformsData = await parseCSV('platforms.csv');
  for (const p of platformsData) {
    await prisma.platform.upsert({ where: { name: p.name }, update: {}, create: { name: p.name } });
  }

  // Load games early to extract missing publishers/developers
  const gamesData = await parseCSV('games.csv');

  // Seed publishers (from CSV + games.csv)
  const publishersData = await parseCSV('publishers.csv');
  const publisherNames = new Set([
    ...publishersData.map((p) => p.name),
    ...gamesData.map((g) => g.publisher).filter(Boolean),
  ]);
  for (const name of publisherNames) {
    await prisma.publisher.upsert({ where: { name }, update: {}, create: { name } });
  }

  // Seed developers (from CSV + games.csv)
  const developersData = await parseCSV('developers.csv');
  const developerNames = new Set([
    ...developersData.map((d) => d.name),
    ...gamesData.map((g) => g.developer).filter(Boolean),
  ]);
  for (const name of developerNames) {
    await prisma.developer.upsert({ where: { name }, update: {}, create: { name } });
  }

  // Seed users (hash password from CSV per user)
  const usersData = await parseCSV('users.csv');
  for (const u of usersData) {
    const hashedPassword = await hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        nombre: u.nombre,
        apellido: u.apellido,
        segundoApellido: u.segundoApellido,
        email: u.email,
        password: hashedPassword,
        active: u.active === 'true',
        createdAt: new Date(u.createdAt),
      },
    });
  }

  // Seed games (upsert with validation)
  const [genres, platforms, publishers, developers] = await Promise.all([
    prisma.genre.findMany(),
    prisma.platform.findMany(),
    prisma.publisher.findMany(),
    prisma.developer.findMany(),
  ]);
  const byName = <T extends { name: string }>(arr: T[]) =>
    Object.fromEntries(arr.map((x) => [x.name, x]));
  const genresMap = byName(genres);
  const platformsMap = byName(platforms);
  const publishersMap = byName(publishers);
  const developersMap = byName(developers);

  for (const g of gamesData) {
    const genre = genresMap[g.genre];
    const platform = platformsMap[g.platform];
    const publisher = publishersMap[g.publisher];
    const developer = developersMap[g.developer];

    if (!genre || !platform || !publisher || !developer) {
      console.warn(`Skipping "${g.title}": missing relation`, {
        genre,
        platform,
        publisher,
        developer,
      });
      continue;
    }

    const releaseYear = Number(g.releaseYear);
    const price = Number(g.price);
    if (!Number.isFinite(releaseYear) || !Number.isFinite(price)) {
      console.warn(`Skipping "${g.title}": invalid numeric data`, {
        releaseYear: g.releaseYear,
        price: g.price,
      });
      continue;
    }

    await prisma.game.upsert({
      where: { title: g.title },
      update: {},
      create: {
        title: g.title,
        description: g.description || null,
        releaseYear,
        price,
        active: g.active === 'true',
        genreId: genre.id,
        platformId: platform.id,
        publisherId: publisher.id,
        developerId: developer.id,
      },
    });
  }

  // Seed user-game relations (relacionar usuarios con juegos)
  const users = await prisma.user.findMany({ take: 5, orderBy: { id: 'asc' } });
  const games = await prisma.game.findMany({ orderBy: { id: 'asc' } });
  const rels: { userId: number; gameId: number }[] = [];
  // primeiros 3 usuarios → juegos 1-4
  for (let i = 0; i < 3 && i < users.length; i++) {
    for (let j = 0; j < 4 && j < games.length; j++) {
      rels.push({ userId: users[i].id, gameId: games[j].id });
    }
  }
  // usuario 4 → juegos 3-7
  if (users[3]) {
    for (let j = 2; j < 7 && j < games.length; j++) {
      rels.push({ userId: users[3].id, gameId: games[j].id });
    }
  }
  // usuario 5 → juegos 5, 6, 10
  if (users[4]) {
    for (const idx of [4, 5, 9]) {
      if (idx < games.length) rels.push({ userId: users[4].id, gameId: games[idx].id });
    }
  }
  for (const r of rels) {
    await prisma.userGame.upsert({
      where: { userId_gameId: { userId: r.userId, gameId: r.gameId } },
      update: {},
      create: r,
    });
  }

  const [usersCount, gamesCount, relsCount] = await Promise.all([
    prisma.user.count(),
    prisma.game.count(),
    prisma.userGame.count(),
  ]);
  console.log(
    `Seed complete: ${usersCount} users, ${gamesCount} games, ${relsCount} user-game relations`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
