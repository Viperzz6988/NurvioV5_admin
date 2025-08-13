"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.refresh = refresh;
exports.logout = logout;
exports.me = me;
exports.guest = guest;
const authService_1 = require("../services/authService");
const prisma_1 = require("../db/prisma");
const jwt_1 = require("../utils/jwt");
const audit_1 = require("../middlewares/audit");
async function login(req, res) {
    const { identifier, password } = req.body;
    try {
        const { accessToken, refreshToken, user } = await (0, authService_1.authenticate)(identifier, password);
        await (0, audit_1.audit)('auth.login', { userId: user.id });
        return res.json({ accessToken, refreshToken, user: sanitizeUser(user) });
    }
    catch (err) {
        await (0, audit_1.audit)('auth.login.failed', { identifier });
        return res.status(401).json({ message: err.message || 'Invalid credentials' });
    }
}
async function refresh(req, res) {
    const { refreshToken } = req.body;
    try {
        const tokens = await (0, authService_1.refresh)(refreshToken);
        await (0, audit_1.audit)('auth.refresh');
        return res.json(tokens);
    }
    catch (err) {
        await (0, audit_1.audit)('auth.refresh.failed');
        return res.status(401).json({ message: err.message || 'Invalid refresh token' });
    }
}
async function logout(req, res) {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer '))
        return res.status(401).json({ message: 'Unauthorized' });
    const token = auth.slice(7);
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        await (0, authService_1.logout)(payload.userId);
        await (0, audit_1.audit)('auth.logout', { userId: payload.userId });
        return res.json({ success: true });
    }
    catch {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}
async function me(req, res) {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer '))
        return res.status(401).json({ message: 'Unauthorized' });
    const token = auth.slice(7);
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        if (payload.userId === 'guest')
            return res.json({ user: { id: 'guest', username: 'Guest', roles: ['GUEST'] } });
        const user = await prisma_1.prisma.user.findUnique({ where: { id: payload.userId }, include: { roles: true } });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        return res.json({ user: sanitizeUser(user) });
    }
    catch {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}
async function guest(req, res) {
    const tokens = await (0, authService_1.guestLogin)();
    return res.json(tokens);
}
function sanitizeUser(user) {
    return {
        id: user.id,
        email: user.email,
        username: user.username,
        roles: user.roles?.map((r) => r.name) || [],
        isBanned: user.isBanned,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}
