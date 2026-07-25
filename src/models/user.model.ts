import { PrismaClient } from '@prisma/client';
import { hash, compare } from 'bcrypt';

const prisma = new PrismaClient();

export type CreateUserInput = {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
};

export const UserModel = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  },

  async create(data: CreateUserInput) {
    const password = await hash(data.password, 10);
    return prisma.user.create({
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        password,
      },
    });
  },

  async verifyPassword(plain: string, hashed: string) {
    return compare(plain, hashed);
  },
};
