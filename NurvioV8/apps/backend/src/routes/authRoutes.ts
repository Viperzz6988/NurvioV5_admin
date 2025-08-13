import { Router } from 'express';
import { login, refresh, logout, me, guest } from '../controllers/authController';
import { apiLimiter } from '../middlewares/rateLimit';

const router = Router();
router.post('/login', apiLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', me);
router.post('/guest', guest);

export default router;