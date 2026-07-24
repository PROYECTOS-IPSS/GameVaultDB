import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const HomeModel = {
  async getFeatured(limit: number = 6) {
    return prisma.game.findMany({
      where: { active: true },
      include: { genre: true, platform: true },
      orderBy: { releaseYear: "desc" },
      take: limit,
    });
  },

  async getStats() {
    const [games, platforms, genres] = await Promise.all([
      prisma.game.count({ where: { active: true } }),
      prisma.platform.count(),
      prisma.genre.count(),
    ]);
    return { games, platforms, genres };
  },
};
