import { Router } from 'express';
import { CollectionController } from '../controllers/collection.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, CollectionController.index);
router.post('/sync', requireAuth, CollectionController.sync);
router.post('/:id/remove', requireAuth, CollectionController.remove);

export default router;
