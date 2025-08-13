import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma';

export async function audit(action: string, details?: any, userId?: string) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        details,
        userId,
      },
    });
  } catch (err) {
    // ignore
  }
}

export function auditMiddleware(action: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prisma.auditLog.create({
        data: {
          action,
          ip: req.ip,
          userAgent: req.headers['user-agent'] || undefined,
          userId: (req as any).user?.userId,
          details: {
            method: req.method,
            path: req.path,
            body: req.body ? '[redacted]' : undefined,
          },
        },
      });
    } catch {}
    next();
  };
}