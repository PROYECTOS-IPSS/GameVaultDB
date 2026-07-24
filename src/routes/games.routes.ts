import { Router } from 'express';
import { GameController } from '../controllers/games.controller';

const router = Router();

router.get('/', GameController.index);
router.get('/new', GameController.new);
router.get('/:id', GameController.show);
router.get('/:id/edit', GameController.edit);
router.post('/', GameController.create);
router.put('/:id', GameController.update);
router.delete('/:id', GameController.delete);

export default router;
