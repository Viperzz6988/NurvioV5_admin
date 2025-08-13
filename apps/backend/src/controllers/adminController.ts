import { Request, Response } from 'express';
import * as admin from '../services/adminService';
import bcrypt from 'bcryptjs';
import { audit } from '../middlewares/audit';

export async function getUsers(req: Request, res: Response) {
  const data = await admin.listUsers({
    search: req.query.search as string | undefined,
    role: req.query.role as string | undefined,
    banned: req.query.banned as string | undefined,
    skip: req.query.skip ? Number(req.query.skip) : undefined,
    take: req.query.take ? Number(req.query.take) : undefined,
  });
  res.json(data);
}

export async function createUser(req: Request, res: Response) {
  const { email, username, password, roles } = req.body as { email: string; username: string; password: string; roles: string[] };
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await admin.createUser({ email, username, passwordHash, roles: roles || ['USER'] });
  await audit('admin.createUser', { id: user.id, email: user.email });
  res.json(user);
}

export async function updateUser(req: Request, res: Response) {
  const id = req.params.id;
  const { email, username, password, roles, isBanned } = req.body as Partial<{ email: string; username: string; password: string; roles: string[]; isBanned: boolean }>;
  const data: any = { email, username, roles, isBanned };
  if (password) data.passwordHash = await bcrypt.hash(password, 12);
  const user = await admin.updateUser(id, data);
  res.json(user);
}

export async function deleteUser(req: Request, res: Response) {
  const id = req.params.id;
  await admin.deleteUser(id);
  await audit('admin.deleteUser', { id });
  res.json({ success: true });
}

export async function bulkDelete(req: Request, res: Response) {
  const { ids } = req.body as { ids: string[] };
  await admin.bulkDelete(ids);
  await audit('admin.bulkDelete', { ids });
  res.json({ success: true });
}

export async function bulkRoleChange(req: Request, res: Response) {
  const { ids, role } = req.body as { ids: string[]; role: string };
  await admin.bulkRoleChange(ids, role);
  await audit('admin.bulkRoleChange', { ids, role });
  res.json({ success: true });
}

export async function bulkBan(req: Request, res: Response) {
  const { ids, isBanned } = req.body as { ids: string[]; isBanned: boolean };
  await admin.bulkBan(ids, isBanned);
  await audit('admin.bulkBan', { ids, isBanned });
  res.json({ success: true });
}

export async function featureFlag(req: Request, res: Response) {
  const { key, enabled } = req.body as { key: string; enabled: boolean };
  const flag = await admin.toggleFeatureFlag(key, enabled);
  await audit('admin.featureFlag', { key, enabled });
  res.json(flag);
}

export async function maintenance(req: Request, res: Response) {
  const { enabled } = req.body as { enabled: boolean };
  const out = await admin.toggleMaintenanceMode(enabled);
  await audit('admin.maintenance', { enabled });
  res.json(out);
}

export async function clearServerCache(req: Request, res: Response) {
  const out = await admin.clearCache();
  await audit('admin.clearCache');
  res.json(out);
}

export async function getMetrics(req: Request, res: Response) {
  const out = await admin.metrics();
  res.json(out);
}

export async function getAuditLogs(req: Request, res: Response) {
  const data = await admin.auditLogs({
    from: req.query.from as string | undefined,
    to: req.query.to as string | undefined,
    userId: req.query.userId as string | undefined,
    action: req.query.action as string | undefined,
    skip: req.query.skip ? Number(req.query.skip) : undefined,
    take: req.query.take ? Number(req.query.take) : undefined,
  });
  res.json(data);
}

export async function exportAll(req: Request, res: Response) {
  const data = await admin.exportData();
  res.json(data);
}

export async function importAll(req: Request, res: Response) {
  const payload = req.body;
  const data = await admin.importData(payload);
  res.json(data);
}

export async function leaderboard(req: Request, res: Response) {
  const data = await admin.leaderboardPublic();
  res.json(data);
}