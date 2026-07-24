import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const GameModel = {
  findAll() {
    return prisma.game.findMany({
      where: { active: true },
      include: { genre: true, platform: true, publisher: true, developer: true },
      orderBy: { createdAt: 'desc' },
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

  getFilterData() {
    return Promise.all([
      prisma.genre.findMany({ orderBy: { name: 'asc' } }),
      prisma.platform.findMany({ orderBy: { name: 'asc' } }),
      prisma.publisher.findMany({ orderBy: { name: 'asc' } }),
      prisma.developer.findMany({ orderBy: { name: 'asc' } }),
    ]);
  },
};
