import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface CreateGameInput {
  title: string;
  description?: string;
  releaseYear: number;
  price: number;
  active?: boolean;
  genreId: number;
  platformId: number;
  publisherId: number;
  developerId: number;
}

export interface UpdateGameInput extends Partial<CreateGameInput> {}

export const GameModel = {
  findAll() {
    return prisma.game.findMany({
      where: { active: true },
      include: { genre: true, platform: true, publisher: true, developer: true },
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

  create(data: CreateGameInput) {
    return prisma.game.create({ data });
  },

  update(id: number, data: UpdateGameInput) {
    return prisma.game.update({ where: { id }, data });
  },

  softDelete(id: number) {
    return prisma.game.update({ where: { id }, data: { active: false } });
  },
};
