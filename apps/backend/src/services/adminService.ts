import { prisma } from '../db/prisma';
import os from 'os';
import process from 'process';

export async function listUsers(query: { search?: string; role?: string; banned?: string; skip?: number; take?: number }) {
  const where: any = {};
  if (query.search) {
    where.OR = [
      { email: { contains: query.search, mode: 'insensitive' } },
      { username: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  if (query.role) {
    where.roles = { some: { name: query.role as any } };
  }
  if (query.banned !== undefined) {
    where.isBanned = query.banned === 'true';
  }
  const [items, total] = await Promise.all([
    prisma.user.findMany({ where, skip: query.skip || 0, take: query.take || 50, include: { roles: true } }),
    prisma.user.count({ where }),
  ]);
  return { items, total };
}

export async function createUser(data: { email: string; username: string; passwordHash: string; roles: string[] }) {
  return prisma.user.create({
    data: {
      email: data.email,
      username: data.username,
      passwordHash: data.passwordHash,
      roles: { connect: data.roles.map((r) => ({ name: r as any })) },
    },
    include: { roles: true },
  });
}

export async function updateUser(id: string, data: Partial<{ email: string; username: string; passwordHash: string; roles: string[]; isBanned: boolean }>) {
  const rolesConnect = data.roles ? data.roles.map((r) => ({ name: r as any })) : [];
  return prisma.user.update({
    where: { id },
    data: {
      email: data.email,
      username: data.username,
      passwordHash: data.passwordHash,
      isBanned: data.isBanned,
      ...(data.roles ? { roles: { set: [], connect: rolesConnect } } : {}),
    },
    include: { roles: true },
  });
}

export async function deleteUser(id: string) {
  await prisma.refreshToken.deleteMany({ where: { userId: id } });
  await prisma.leaderboardEntry.deleteMany({ where: { userId: id } });
  return prisma.user.delete({ where: { id } });
}

export async function bulkDelete(ids: string[]) {
  await prisma.refreshToken.deleteMany({ where: { userId: { in: ids } } });
  await prisma.leaderboardEntry.deleteMany({ where: { userId: { in: ids } } });
  return prisma.user.deleteMany({ where: { id: { in: ids } } });
}

export async function bulkRoleChange(ids: string[], role: string) {
  for (const id of ids) {
    await prisma.user.update({ where: { id }, data: { roles: { set: [{ name: role as any }] } } });
  }
}

export async function bulkBan(ids: string[], isBanned: boolean) {
  return prisma.user.updateMany({ where: { id: { in: ids } }, data: { isBanned } });
}

export async function toggleFeatureFlag(key: string, enabled: boolean) {
  return prisma.featureFlag.upsert({ where: { key }, update: { enabled }, create: { key, enabled } });
}

export async function toggleMaintenanceMode(enabled: boolean) {
  return prisma.setting.upsert({ where: { key: 'maintenance' }, update: { value: { enabled } }, create: { key: 'maintenance', value: { enabled } } });
}

export async function clearCache() {
  // Placeholder for server-side cache clear; if Redis exists, we would flush it
  return { cleared: true };
}

export async function metrics() {
  const memoryUsage = process.memoryUsage();
  const cpuCount = os.cpus().length;
  let dbConnections: number | null = null;
  try {
    const rows = (await prisma.$queryRawUnsafe<any[]>(
      'SELECT count(*)::int as count FROM pg_stat_activity'
    )) as any[];
    dbConnections = Array.isArray(rows) && rows.length ? Number(rows[0].count) : null;
  } catch {
    dbConnections = null;
  }
  return {
    cpuCores: cpuCount,
    memory: {
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
      external: memoryUsage.external,
    },
    dbConnections,
  };
}

export async function auditLogs(params: { from?: string; to?: string; userId?: string; action?: string; skip?: number; take?: number }) {
  const where: any = {};
  if (params.userId) where.userId = params.userId;
  if (params.action) where.action = { contains: params.action, mode: 'insensitive' };
  if (params.from || params.to) {
    where.createdAt = {};
    if (params.from) (where.createdAt as any).gte = new Date(params.from);
    if (params.to) (where.createdAt as any).lte = new Date(params.to);
  }
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip: params.skip || 0, take: params.take || 50 }),
    prisma.auditLog.count({ where }),
  ]);
  return { items, total };
}

export async function exportData() {
  const [users, roles, flags, settings, leaderboard, logs] = await Promise.all([
    prisma.user.findMany({ include: { roles: true } }),
    prisma.role.findMany(),
    prisma.featureFlag.findMany(),
    prisma.setting.findMany(),
    prisma.leaderboardEntry.findMany(),
    prisma.auditLog.findMany(),
  ]);
  return { users, roles, flags, settings, leaderboard, logs };
}

export async function importData(payload: any) {
  // naive import, assuming trusted input
  await prisma.$transaction(async (tx) => {
    await tx.refreshToken.deleteMany({});
    await tx.auditLog.deleteMany({});
    await tx.leaderboardEntry.deleteMany({});
    await tx.user.deleteMany({});
    await tx.role.deleteMany({});

    await tx.role.createMany({ data: payload.roles.map((r: any) => ({ id: r.id, name: r.name })) });
    for (const u of payload.users) {
      await tx.user.create({ data: { id: u.id, email: u.email, username: u.username, passwordHash: u.passwordHash, isBanned: u.isBanned, createdAt: u.createdAt, updatedAt: u.updatedAt, roles: { connect: u.roles.map((r: any) => ({ id: r.id })) } } });
    }
    if (payload.flags?.length) await tx.featureFlag.createMany({ data: payload.flags });
    if (payload.settings?.length) await tx.setting.createMany({ data: payload.settings });
    if (payload.leaderboard?.length) await tx.leaderboardEntry.createMany({ data: payload.leaderboard });
  });
  return { ok: true };
}

export async function leaderboardPublic() {
  const entries = await prisma.leaderboardEntry.findMany({ include: { user: { include: { roles: true } } }, orderBy: { score: 'desc' } });
  return entries.filter((e) => !e.user.roles.some((r) => r.name === 'GUEST') && !e.hidden);
}