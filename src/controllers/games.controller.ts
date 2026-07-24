import { Request, Response } from "express";
import { GameModel } from "../models/games.model";

export const GameController = {
  async index(_req: Request, res: Response) {
    try {
      const [games, [genres, platforms, publishers, developers]] = await Promise.all([
        GameModel.findAll(),
        GameModel.getFilterData(),
      ]);
      res.render("games/index", { 
        isGames: true, 
        games, 
        genres, 
        platforms, 
        publishers, 
        developers,
      });
    } catch (error) {
      console.error(error);
      res.status(500).render("500");
    }
  },

  async show(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const game = await GameModel.findById(id);
      if (!game) return res.status(404).render("404");
      res.render("games/show", { game });
    } catch (error) {
      console.error(error);
      res.status(500).render("500");
    }
  },

  async new(_req: Request, res: Response) {
    try {
      const [genres, platforms, publishers, developers] = await GameModel.getFilterData();
      res.render("games/form", { genres, platforms, publishers, developers });
    } catch (error) {
      console.error(error);
      res.status(500).render("500");
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

      await GameModel.create({
        title,
        description,
        releaseYear: Number(releaseYear),
        price: Number(price),
        genreId: Number(genreId),
        platformId: Number(platformId),
        publisherId: Number(publisherId),
        developerId: Number(developerId),
      });

      res.redirect("/games");
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al crear el juego" });
    }
  },

  async edit(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const game = await GameModel.findById(id);
      if (!game) return res.status(404).render("404");
      
      const [genres, platforms, publishers, developers] = await GameModel.getFilterData();
      res.render("games/form", { game, genres, platforms, publishers, developers });
    } catch (error) {
      console.error(error);
      res.status(500).render("500");
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { title, description, releaseYear, price, genreId, platformId, publisherId, developerId } = req.body;

      const existing = await GameModel.findById(id);
      if (!existing) return res.status(404).render("404");

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

      await GameModel.update(id, data);
      res.redirect(`/games/${id}`);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al actualizar el juego" });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await GameModel.softDelete(id);
      res.redirect("/games");
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al eliminar el juego" });
    }
  },
};
