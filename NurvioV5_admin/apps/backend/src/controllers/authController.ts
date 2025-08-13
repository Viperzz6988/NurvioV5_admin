import { Request, Response } from 'express';
import { authenticate, refresh as refreshSvc, logout as logoutSvc, guestLogin } from '../services/authService';
import { prisma } from '../db/prisma';
import { verifyAccessToken } from '../utils/jwt';
import { audit } from '../middlewares/audit';

export async function login(req: Request, res: Response) {
  const { identifier, password } = req.body as { identifier: string; password: string };
  try {
    const { accessToken, refreshToken, user } = await authenticate(identifier, password);
    await audit('auth.login', { userId: user.id });
    return res.json({ accessToken, refreshToken, user: sanitizeUser(user) });
  } catch (err: any) {
    await audit('auth.login.failed', { identifier });
    return res.status(401).json({ message: err.message || 'Invalid credentials' });
  }
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body as { refreshToken: string };
  try {
    const tokens = await refreshSvc(refreshToken);
    await audit('auth.refresh');
    return res.json(tokens);
  } catch (err: any) {
    await audit('auth.refresh.failed');
    return res.status(401).json({ message: err.message || 'Invalid refresh token' });
  }
}

export async function logout(req: Request, res: Response) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
  const token = auth.slice(7);
  try {
    const payload = verifyAccessToken(token);
    await logoutSvc(payload.userId);
    await audit('auth.logout', { userId: payload.userId });
    return res.json({ success: true });
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

export async function me(req: Request, res: Response) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
  const token = auth.slice(7);
  try {
    const payload = verifyAccessToken(token);
    if (payload.userId === 'guest') return res.json({ user: { id: 'guest', username: 'Guest', roles: ['GUEST'] } });
    const user = await prisma.user.findUnique({ where: { id: payload.userId }, include: { roles: true } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user: sanitizeUser(user) });
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

export async function guest(req: Request, res: Response) {
  const tokens = await guestLogin();
  return res.json(tokens);
}

function sanitizeUser(user: any) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    roles: user.roles?.map((r: any) => r.name) || [],
    isBanned: user.isBanned,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}