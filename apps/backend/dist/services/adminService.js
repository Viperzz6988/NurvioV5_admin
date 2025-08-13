"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = listUsers;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.bulkDelete = bulkDelete;
exports.bulkRoleChange = bulkRoleChange;
exports.bulkBan = bulkBan;
exports.toggleFeatureFlag = toggleFeatureFlag;
exports.toggleMaintenanceMode = toggleMaintenanceMode;
exports.clearCache = clearCache;
exports.metrics = metrics;
exports.auditLogs = auditLogs;
exports.exportData = exportData;
exports.importData = importData;
exports.leaderboardPublic = leaderboardPublic;
const prisma_1 = require("../db/prisma");
const os_1 = __importDefault(require("os"));
const process_1 = __importDefault(require("process"));
async function listUsers(query) {
    const where = {};
    if (query.search) {
        where.OR = [
            { email: { contains: query.search, mode: 'insensitive' } },
            { username: { contains: query.search, mode: 'insensitive' } },
        ];
    }
    if (query.role) {
        where.roles = { some: { name: query.role } };
    }
    if (query.banned !== undefined) {
        where.isBanned = query.banned === 'true';
    }
    const [items, total] = await Promise.all([
        prisma_1.prisma.user.findMany({ where, skip: query.skip || 0, take: query.take || 50, include: { roles: true } }),
        prisma_1.prisma.user.count({ where }),
    ]);
    return { items, total };
}
async function createUser(data) {
    return prisma_1.prisma.user.create({
        data: {
            email: data.email,
            username: data.username,
            passwordHash: data.passwordHash,
            roles: { connect: data.roles.map((r) => ({ name: r })) },
        },
        include: { roles: true },
    });
}
async function updateUser(id, data) {
    const rolesConnect = data.roles ? data.roles.map((r) => ({ name: r })) : [];
    return prisma_1.prisma.user.update({
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
async function deleteUser(id) {
    await prisma_1.prisma.refreshToken.deleteMany({ where: { userId: id } });
    await prisma_1.prisma.leaderboardEntry.deleteMany({ where: { userId: id } });
    return prisma_1.prisma.user.delete({ where: { id } });
}
async function bulkDelete(ids) {
    await prisma_1.prisma.refreshToken.deleteMany({ where: { userId: { in: ids } } });
    await prisma_1.prisma.leaderboardEntry.deleteMany({ where: { userId: { in: ids } } });
    return prisma_1.prisma.user.deleteMany({ where: { id: { in: ids } } });
}
async function bulkRoleChange(ids, role) {
    for (const id of ids) {
        await prisma_1.prisma.user.update({ where: { id }, data: { roles: { set: [{ name: role }] } } });
    }
}
async function bulkBan(ids, isBanned) {
    return prisma_1.prisma.user.updateMany({ where: { id: { in: ids } }, data: { isBanned } });
}
async function toggleFeatureFlag(key, enabled) {
    return prisma_1.prisma.featureFlag.upsert({ where: { key }, update: { enabled }, create: { key, enabled } });
}
async function toggleMaintenanceMode(enabled) {
    return prisma_1.prisma.setting.upsert({ where: { key: 'maintenance' }, update: { value: { enabled } }, create: { key: 'maintenance', value: { enabled } } });
}
async function clearCache() {
    // Placeholder for server-side cache clear; if Redis exists, we would flush it
    return { cleared: true };
}
async function metrics() {
    const memoryUsage = process_1.default.memoryUsage();
    const cpuCount = os_1.default.cpus().length;
    let dbConnections = null;
    try {
        const rows = (await prisma_1.prisma.$queryRawUnsafe('SELECT count(*)::int as count FROM pg_stat_activity'));
        dbConnections = Array.isArray(rows) && rows.length ? Number(rows[0].count) : null;
    }
    catch {
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
async function auditLogs(params) {
    const where = {};
    if (params.userId)
        where.userId = params.userId;
    if (params.action)
        where.action = { contains: params.action, mode: 'insensitive' };
    if (params.from || params.to) {
        where.createdAt = {};
        if (params.from)
            where.createdAt.gte = new Date(params.from);
        if (params.to)
            where.createdAt.lte = new Date(params.to);
    }
    const [items, total] = await Promise.all([
        prisma_1.prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip: params.skip || 0, take: params.take || 50 }),
        prisma_1.prisma.auditLog.count({ where }),
    ]);
    return { items, total };
}
async function exportData() {
    const [users, roles, flags, settings, leaderboard, logs] = await Promise.all([
        prisma_1.prisma.user.findMany({ include: { roles: true } }),
        prisma_1.prisma.role.findMany(),
        prisma_1.prisma.featureFlag.findMany(),
        prisma_1.prisma.setting.findMany(),
        prisma_1.prisma.leaderboardEntry.findMany(),
        prisma_1.prisma.auditLog.findMany(),
    ]);
    return { users, roles, flags, settings, leaderboard, logs };
}
async function importData(payload) {
    // naive import, assuming trusted input
    await prisma_1.prisma.$transaction(async (tx) => {
        await tx.refreshToken.deleteMany({});
        await tx.auditLog.deleteMany({});
        await tx.leaderboardEntry.deleteMany({});
        await tx.user.deleteMany({});
        await tx.role.deleteMany({});
        await tx.role.createMany({ data: payload.roles.map((r) => ({ id: r.id, name: r.name })) });
        for (const u of payload.users) {
            await tx.user.create({ data: { id: u.id, email: u.email, username: u.username, passwordHash: u.passwordHash, isBanned: u.isBanned, createdAt: u.createdAt, updatedAt: u.updatedAt, roles: { connect: u.roles.map((r) => ({ id: r.id })) } } });
        }
        if (payload.flags?.length)
            await tx.featureFlag.createMany({ data: payload.flags });
        if (payload.settings?.length)
            await tx.setting.createMany({ data: payload.settings });
        if (payload.leaderboard?.length)
            await tx.leaderboardEntry.createMany({ data: payload.leaderboard });
    });
    return { ok: true };
}
async function leaderboardPublic() {
    const entries = await prisma_1.prisma.leaderboardEntry.findMany({ include: { user: { include: { roles: true } } }, orderBy: { score: 'desc' } });
    return entries.filter((e) => !e.user.roles.some((r) => r.name === 'GUEST') && !e.hidden);
}
