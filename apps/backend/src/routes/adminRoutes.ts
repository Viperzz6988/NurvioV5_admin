import { Router } from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  bulkDelete,
  bulkRoleChange,
  bulkBan,
  featureFlag,
  maintenance,
  clearServerCache,
  getMetrics,
  getAuditLogs,
  exportAll,
  importAll,
  leaderboard,
} from '../controllers/adminController';
import { requireAuth, requireRoles } from '../middlewares/auth';

const router = Router();

router.use(requireAuth, requireRoles(['ADMIN', 'SUPERADMIN']));

router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.post('/users/bulk/delete', bulkDelete);
router.post('/users/bulk/role', bulkRoleChange);
router.post('/users/bulk/ban', bulkBan);

router.post('/feature-flags', featureFlag);
router.post('/maintenance', maintenance);
router.post('/cache/clear', clearServerCache);
router.get('/metrics', getMetrics);
router.get('/audit-logs', getAuditLogs);
router.get('/export', exportAll);
router.post('/import', importAll);
router.get('/leaderboard', leaderboard);

export default router;