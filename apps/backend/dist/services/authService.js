"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.refresh = refresh;
exports.logout = logout;
exports.guestLogin = guestLogin;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../db/prisma");
const jwt_1 = require("../utils/jwt");
const env_1 = require("../config/env");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
async function authenticate(emailOrUsername, password) {
    const user = await prisma_1.prisma.user.findFirst({
        where: {
            OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
        },
        include: { roles: true },
    });
    if (!user || !(await bcryptjs_1.default.compare(password, user.passwordHash))) {
        throw new Error('Invalid credentials');
    }
    if (user.isBanned)
        throw new Error('User is banned');
    const payload = {
        userId: user.id,
        roles: user.roles.map((r) => r.name),
    };
    const accessToken = (0, jwt_1.signAccessToken)(payload);
    const refreshToken = (0, jwt_1.signRefreshToken)(payload);
    const tokenHash = await bcryptjs_1.default.hash(refreshToken, env_1.env.refreshTokenSaltRounds);
    const expiresAt = new Date(jsonwebtoken_1.default.decode(refreshToken, { json: true })?.exp * 1000);
    await prisma_1.prisma.refreshToken.create({
        data: {
            tokenHash,
            userId: user.id,
            expiresAt,
        },
    });
    await prisma_1.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    return { accessToken, refreshToken, user };
}
async function refresh(refreshToken) {
    const payload = jsonwebtoken_1.default.verify(refreshToken, env_1.env.jwt.refreshSecret);
    const userId = payload.userId;
    const tokens = await prisma_1.prisma.refreshToken.findMany({ where: { userId, revokedAt: null } });
    let valid = false;
    for (const t of tokens) {
        const ok = await bcryptjs_1.default.compare(refreshToken, t.tokenHash);
        if (ok && new Date() < t.expiresAt) {
            valid = true;
            break;
        }
    }
    if (!valid)
        throw new Error('Invalid refresh token');
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId }, include: { roles: true } });
    if (!user)
        throw new Error('User not found');
    const newPayload = { userId: user.id, roles: user.roles.map((r) => r.name) };
    const accessToken = (0, jwt_1.signAccessToken)(newPayload);
    const newRefreshToken = (0, jwt_1.signRefreshToken)(newPayload);
    const tokenHash = await bcryptjs_1.default.hash(newRefreshToken, env_1.env.refreshTokenSaltRounds);
    const expiresAt = new Date(jsonwebtoken_1.default.decode(newRefreshToken, { json: true })?.exp * 1000);
    await prisma_1.prisma.refreshToken.create({ data: { tokenHash, userId: user.id, expiresAt } });
    return { accessToken, refreshToken: newRefreshToken };
}
async function logout(userId) {
    await prisma_1.prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
}
async function guestLogin() {
    // Return tokens with GUEST role and no user entity
    const payload = { userId: 'guest', roles: ['GUEST'] };
    const accessToken = (0, jwt_1.signAccessToken)(payload);
    const refreshToken = (0, jwt_1.signRefreshToken)(payload);
    return { accessToken, refreshToken };
}
