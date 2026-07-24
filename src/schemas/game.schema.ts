import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const gameSchema = z.object({
  title: z.string().min(1, 'El título no puede estar vacío'),
  description: z.string().min(1, 'La descripción no puede estar vacía'),
  releaseYear: z
    .number({ error: 'El año debe ser un número' })
    .int('El año debe ser un número entero')
    .min(1900, 'El año debe ser mayor que 1900')
    .max(currentYear, `El año no puede ser mayor que ${currentYear}`),
  price: z
    .number({ error: 'El precio debe ser un número' })
    .min(0, 'El precio no puede ser negativo'),
  genreId: z.number({ error: 'Debe seleccionar un género' }),
  platformId: z.number({ error: 'Debe seleccionar una plataforma' }),
  publisherId: z.number({ error: 'Debe seleccionar una editorial' }),
  developerId: z.number({ error: 'Debe seleccionar un desarrollador' }),
});

export type GameInput = z.infer<typeof gameSchema>;
