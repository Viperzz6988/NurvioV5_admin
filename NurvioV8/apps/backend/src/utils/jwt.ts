import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export type JwtPayload = { userId: string; roles: string[] };

export function signAccessToken(payload: JwtPayload): string {
  const secret: Secret = env.jwt.accessSecret;
  const options: SignOptions = { expiresIn: env.jwt.accessExpiresIn as any };
  return jwt.sign(payload as any, secret, options);
}

export function signRefreshToken(payload: JwtPayload): string {
  const secret: Secret = env.jwt.refreshSecret;
  const options: SignOptions = { expiresIn: env.jwt.refreshExpiresIn as any };
  return jwt.sign(payload as any, secret, options);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwt.accessSecret as Secret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwt.refreshSecret as Secret) as JwtPayload;
}