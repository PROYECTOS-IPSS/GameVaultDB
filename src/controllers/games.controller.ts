import { Request, Response } from 'express';
import { GameModel } from '../models/games.model';
import { gameSchema } from '../schemas/game.schema';

export const GameController = {
  async index(req: Request, res: Response) {
    try {
      const { platformId, genreId, maxPrice, sort } = req.query;
      const filters = {
        platformId: platformId ? Number(platformId) : undefined,
        genreId: genreId ? Number(genreId) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      };

      const sortValue = sort ? String(sort) : '';
      const [sortField, sortDir] = sortValue.includes('-') ? sortValue.split('-') : ['', ''];

      const [games, [genres, platforms, publishers, developers], catalogMaxPrice, inactiveGames] =
        await Promise.all([
          GameModel.findAll(filters, sortField, sortDir),
          GameModel.getFilterData(),
          GameModel.getMaxPrice(),
          GameModel.findInactive(),
        ]);
      
      const selectedMaxPrice = filters.maxPrice || catalogMaxPrice;
      
      res.render('games/index', {
        isGames: true,
        games,
        genres,
        platforms,
        publishers,
        developers,
        catalogMaxPrice,
        inactiveGames,
        filters: {
          platformId: filters.platformId || '',
          genreId: filters.genreId || '',
          maxPrice: selectedMaxPrice,
          sort: sortValue,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).render('500');
    }
  },

  async show(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const game = await GameModel.findById(id);
      if (!game) return res.status(404).render('404');
      res.render('games/show', { game });
    } catch (error) {
      console.error(error);
      res.status(500).render('500');
    }
  },
  async new(_req: Request, res: Response) {
    try {
      const [[genres, platforms, publishers, developers], maxPrice] = await Promise.all([
        GameModel.getFilterData(),
        GameModel.getMaxPrice(),
      ]);
      res.render('games/form', { 
        genres, 
        platforms, 
        publishers, 
        developers,
        maxPrice 
      });
    } catch (error) {
      console.error(error);
      res.status(500).render('500');
    }
  },

  async create(req: Request, res: Response) {
    try {
      const data = {
        ...req.body,
        releaseYear: Number(req.body.releaseYear),
        price: Number(req.body.price),
        genreId: Number(req.body.genreId),
        platformId: Number(req.body.platformId),
        publisherId: Number(req.body.publisherId),
        developerId: Number(req.body.developerId),
      };

      const validation = gameSchema.safeParse(data);
      if (!validation.success) {
        const errors = validation.error.issues.map((e: { message: string }) => e.message);
        const [[genres, platforms, publishers, developers], maxPrice] = await Promise.all([
          GameModel.getFilterData(),
          GameModel.getMaxPrice(),
        ]);
        return res.status(400).render('games/form', { 
          errors, 
          formData: data,
          genres, 
          platforms, 
          publishers, 
          developers,
          maxPrice 
        });
      }

      const existing = await GameModel.findByTitle(validation.data.title);
      if (existing) {
        const [[genres, platforms, publishers, developers], maxPrice] = await Promise.all([
          GameModel.getFilterData(),
          GameModel.getMaxPrice(),
        ]);
        return res.status(400).render('games/form', {
          errors: ['El título del juego ya existe'],
          formData: validation.data,
          genres, platforms, publishers, developers, maxPrice,
        });
      }

      await GameModel.create(validation.data);
      res.redirect('/games');
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear el juego' });
    }
  },

  async edit(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const game = await GameModel.findById(id);
      if (!game) return res.status(404).render('404');

      const [[genres, platforms, publishers, developers], maxPrice] = await Promise.all([
        GameModel.getFilterData(),
        GameModel.getMaxPrice(),
      ]);
      res.render('games/form', { game, genres, platforms, publishers, developers, maxPrice });
    } catch (error) {
      console.error(error);
      res.status(500).render('500');
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const existing = await GameModel.findById(id);
      if (!existing) return res.status(404).render('404');

      const data = {
        ...req.body,
        releaseYear: Number(req.body.releaseYear),
        price: Number(req.body.price),
        genreId: Number(req.body.genreId),
        platformId: Number(req.body.platformId),
        publisherId: Number(req.body.publisherId),
        developerId: Number(req.body.developerId),
      };

      const validation = gameSchema.safeParse(data);
      if (!validation.success) {
        const errors = validation.error.issues.map((e: { message: string }) => e.message);
        const [[genres, platforms, publishers, developers], maxPrice] = await Promise.all([
          GameModel.getFilterData(),
          GameModel.getMaxPrice(),
        ]);
        return res.status(400).render('games/form', { 
          errors, 
          game: { id, ...data },
          formData: data,
          genres, 
          platforms, 
          publishers, 
          developers,
          maxPrice 
        });
      }

      if (validation.data.title !== existing.title) {
        const duplicate = await GameModel.findByTitle(validation.data.title);
        if (duplicate) {
          const [[genres, platforms, publishers, developers], maxPrice] = await Promise.all([
            GameModel.getFilterData(),
            GameModel.getMaxPrice(),
          ]);
          return res.status(400).render('games/form', {
            errors: ['El título del juego ya existe'],
            game: { id, ...validation.data },
            formData: validation.data,
            genres, platforms, publishers, developers, maxPrice,
          });
        }
      }

      await GameModel.update(id, validation.data);
      res.redirect(`/games/${id}`);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar el juego' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await GameModel.softDelete(id);
      res.redirect('/games');
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar el juego' });
    }
  },

  async reactivate(req: Request, res: Response) {
    try {
      const ids = Array.isArray(req.body.gameIds)
        ? req.body.gameIds.map(Number)
        : req.body.gameIds
          ? [Number(req.body.gameIds)]
          : [];

      if (ids.length === 0) {
        return res.redirect('/games');
      }

      await GameModel.reactivateMany(ids);
      res.redirect('/games');
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al reactivar los juegos' });
    }
  },
};
