import { Request, Response } from 'express';
import { CollectionModel } from '../models/collection.model';

export const CollectionController = {
  async index(req: Request, res: Response) {
    try {
      const userId = req.session.userId!;
      const userGames = await CollectionModel.getUserGames(userId);
      const games = userGames.map((ug) => ug.game);

      res.render('collection/index', {
        title: 'Mi Colección',
        isCollection: true,
        games,
      });
    } catch (error) {
      console.error(error);
      res.status(500).render('500');
    }
  },

  async add(req: Request, res: Response) {
    try {
      const userId = req.session.userId!;
      const gameId = Number(req.params.id);

      const isInCollection = await CollectionModel.isInCollection(userId, gameId);
      if (!isInCollection) {
        await CollectionModel.addToCollection(userId, gameId);
      }

      const referer = req.get('Referer') || '/games';
      res.redirect(referer);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al añadir el juego a la colección' });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const userId = req.session.userId!;
      const gameId = Number(req.params.id);

      await CollectionModel.removeFromCollection(userId, gameId);
      const referer = req.get('Referer') || '/collection';
      res.redirect(referer);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar el juego de la colección' });
    }
  },

  async sync(req: Request, res: Response) {
    try {
      const userId = req.session.userId!;
      const { add, remove } = req.body;

      const addedIds = Array.isArray(add) ? add.map(Number) : [];
      const removedIds = Array.isArray(remove) ? remove.map(Number) : [];

      for (const gameId of addedIds) {
        const isInCollection = await CollectionModel.isInCollection(userId, gameId);
        if (!isInCollection) {
          await CollectionModel.addToCollection(userId, gameId);
        }
      }

      for (const gameId of removedIds) {
        await CollectionModel.removeFromCollection(userId, gameId);
      }

      res.json({ success: true, added: addedIds.length, removed: removedIds.length });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al sincronizar la colección' });
    }
  },
};
