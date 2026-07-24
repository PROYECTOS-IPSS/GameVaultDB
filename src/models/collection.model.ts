import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const CollectionModel = {
  async getUserGames(userId: number) {
    return prisma.userGame.findMany({
      where: { userId },
      include: {
        game: {
          include: {
            genre: true,
            platform: true,
            publisher: true,
            developer: true,
          },
        },
      },
      orderBy: { game: { title: 'asc' } },
    });
  },

  async addToCollection(userId: number, gameId: number) {
    return prisma.userGame.create({
      data: { userId, gameId },
    });
  },

  async removeFromCollection(userId: number, gameId: number) {
    return prisma.userGame.delete({
      where: { userId_gameId: { userId, gameId } },
    });
  },

  async isInCollection(userId: number, gameId: number) {
    const userGame = await prisma.userGame.findUnique({
      where: { userId_gameId: { userId, gameId } },
    });
    return userGame !== null;
  },

  async getUserGameIds(userId: number) {
    const userGames = await prisma.userGame.findMany({
      where: { userId },
      select: { gameId: true },
    });
    return userGames.map((ug) => ug.gameId);
  },
};
