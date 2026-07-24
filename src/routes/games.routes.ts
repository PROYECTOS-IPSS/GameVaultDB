import { Router } from 'express';
import { GameController } from '../controllers/games.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', GameController.index);
router.get('/new', requireAuth, GameController.new);
router.get('/:id', GameController.show);
router.get('/:id/edit', requireAuth, GameController.edit);
router.post('/', requireAuth, GameController.create);
router.put('/:id', requireAuth, GameController.update);
router.delete('/:id', requireAuth, GameController.delete);

export default router;
