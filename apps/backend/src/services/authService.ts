import bcrypt from 'bcryptjs';
import { prisma } from '../db/prisma';
import { signAccessToken, signRefreshToken, JwtPayload } from '../utils/jwt';
import { env } from '../config/env';
import jwt from 'jsonwebtoken';

export async function authenticate(emailOrUsername: string, password: string) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
    },
    include: { roles: true },
  });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new Error('Invalid credentials');
  }
  if (user.isBanned) throw new Error('User is banned');

  const payload: JwtPayload = {
    userId: user.id,
    roles: user.roles.map((r) => r.name),
  } as any;

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const tokenHash = await bcrypt.hash(refreshToken, env.refreshTokenSaltRounds);
  const expiresAt = new Date(jwt.decode(refreshToken, { json: true })?.exp! * 1000);

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt,
    },
  });

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  return { accessToken, refreshToken, user };
}

export async function refresh(refreshToken: string) {
  const payload = jwt.verify(refreshToken, env.jwt.refreshSecret) as JwtPayload & { exp: number };
  const userId = payload.userId;

  const tokens = await prisma.refreshToken.findMany({ where: { userId, revokedAt: null } });
  let valid = false;
  for (const t of tokens) {
    const ok = await bcrypt.compare(refreshToken, t.tokenHash);
    if (ok && new Date() < t.expiresAt) {
      valid = true;
      break;
    }
  }
  if (!valid) throw new Error('Invalid refresh token');

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { roles: true } });
  if (!user) throw new Error('User not found');

  const newPayload: JwtPayload = { userId: user.id, roles: user.roles.map((r) => r.name) } as any;
  const accessToken = signAccessToken(newPayload);
  const newRefreshToken = signRefreshToken(newPayload);
  const tokenHash = await bcrypt.hash(newRefreshToken, env.refreshTokenSaltRounds);
  const expiresAt = new Date(jwt.decode(newRefreshToken, { json: true })?.exp! * 1000);

  await prisma.refreshToken.create({ data: { tokenHash, userId: user.id, expiresAt } });
  return { accessToken, refreshToken: newRefreshToken };
}

export async function logout(userId: string) {
  await prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
}

export async function guestLogin() {
  // Return tokens with GUEST role and no user entity
  const payload: JwtPayload = { userId: 'guest', roles: ['GUEST'] } as any;
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  return { accessToken, refreshToken };
}