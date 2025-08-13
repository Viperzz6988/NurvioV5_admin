import { Router } from 'express';
import { publicLeaderboard, contact } from '../controllers/publicController';

const router = Router();
router.get('/leaderboard', publicLeaderboard);
router.post('/contact', contact);
export default router;