import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const GameModel = {
  findAll(
    filters?: { platformId?: number; genreId?: number; maxPrice?: number },
    sortBy?: string,
    sortOrder?: string,
  ) {
    const where: Record<string, unknown> = { active: true };
    if (filters?.platformId) where.platformId = Number(filters.platformId);
    if (filters?.genreId) where.genreId = Number(filters.genreId);
    if (filters?.maxPrice) where.price = { lte: Number(filters.maxPrice) };

    const orderBy: Record<string, string> =
      sortBy === 'title' || sortBy === 'price'
        ? { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' }
        : { createdAt: 'desc' };

    return prisma.game.findMany({
      where,
      include: { genre: true, platform: true, publisher: true, developer: true },
      orderBy,
    });
  },

  findById(id: number) {
    return prisma.game.findUnique({
      where: { id },
      include: { genre: true, platform: true, publisher: true, developer: true },
    });
  },

  findByTitle(title: string) {
    return prisma.game.findUnique({ where: { title } });
  },

  create(data: any) {
    return prisma.game.create({ data });
  },

  update(id: number, data: any) {
    return prisma.game.update({ where: { id }, data });
  },

  softDelete(id: number) {
    return prisma.game.update({ where: { id }, data: { active: false } });
  },

  findInactive() {
    return prisma.game.findMany({
      where: { active: false },
      orderBy: { title: 'asc' },
      select: { id: true, title: true },
    });
  },

  reactivateMany(ids: number[]) {
    return prisma.game.updateMany({
      where: { id: { in: ids } },
      data: { active: true },
    });
  },

  getFilterData() {
    return Promise.all([
      prisma.genre.findMany({ orderBy: { name: 'asc' } }),
      prisma.platform.findMany({ orderBy: { name: 'asc' } }),
      prisma.publisher.findMany({ orderBy: { name: 'asc' } }),
      prisma.developer.findMany({ orderBy: { name: 'asc' } }),
    ]);
  },

  async getMaxPrice() {
    const result = await prisma.game.aggregate({
      where: { active: true },
      _max: { price: true },
    });
    return result._max.price ?? 100;
  },
};
