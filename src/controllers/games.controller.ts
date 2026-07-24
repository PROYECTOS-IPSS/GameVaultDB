import { Request, Response } from "express";
import { GameModel } from "../models/games.model";

export const GameController = {
  async getAll(_req: Request, res: Response) {
    try {
      const games = await GameModel.findAll();
      res.json(games);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener los juegos" });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const game = await GameModel.findById(id);
      if (!game) return res.status(404).json({ error: "Juego no encontrado" });
      res.json(game);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener el juego" });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { title, description, releaseYear, price, genreId, platformId, publisherId, developerId } = req.body;

      if (!title || !releaseYear || !price || !genreId || !platformId || !publisherId || !developerId) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
      }

      const existing = await GameModel.findByTitle(title);
      if (existing) return res.status(409).json({ error: "El título del juego ya existe" });

      const game = await GameModel.create({
        title,
        description,
        releaseYear: Number(releaseYear),
        price: Number(price),
        genreId: Number(genreId),
        platformId: Number(platformId),
        publisherId: Number(publisherId),
        developerId: Number(developerId),
      });

      res.status(201).json(game);
    } catch (error) {
      res.status(500).json({ error: "Error al crear el juego" });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { title, description, releaseYear, price, genreId, platformId, publisherId, developerId } = req.body;

      const existing = await GameModel.findById(id);
      if (!existing) return res.status(404).json({ error: "Juego no encontrado" });

      if (title && title !== existing.title) {
        const duplicate = await GameModel.findByTitle(title);
        if (duplicate) return res.status(409).json({ error: "El título del juego ya existe" });
      }

      const data: Record<string, unknown> = {};
      if (title !== undefined) data.title = title;
      if (description !== undefined) data.description = description;
      if (releaseYear !== undefined) data.releaseYear = Number(releaseYear);
      if (price !== undefined) data.price = Number(price);
      if (genreId !== undefined) data.genreId = Number(genreId);
      if (platformId !== undefined) data.platformId = Number(platformId);
      if (publisherId !== undefined) data.publisherId = Number(publisherId);
      if (developerId !== undefined) data.developerId = Number(developerId);

      const updated = await GameModel.update(id, data);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar el juego" });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      const existing = await GameModel.findById(id);
      if (!existing) return res.status(404).json({ error: "Juego no encontrado" });

      await GameModel.softDelete(id);
      res.json({ message: "Juego eliminado correctamente" });
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar el juego" });
    }
  },
};
