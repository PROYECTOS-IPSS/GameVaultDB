import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { guestOnly, requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/login', guestOnly, AuthController.showLogin);
router.post('/login', guestOnly, AuthController.login);
router.get('/register', guestOnly, AuthController.showRegister);
router.post('/register', guestOnly, AuthController.register);
router.post('/logout', requireAuth, AuthController.logout);

export default router;
