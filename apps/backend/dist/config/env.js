"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT || 4000),
    databaseUrl: process.env.DATABASE_URL || '',
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET || 'access',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh',
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    },
    refreshTokenSaltRounds: Number(process.env.REFRESH_TOKEN_SALT_ROUNDS || 12),
    rateLimit: {
        windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
        max: Number(process.env.RATE_LIMIT_MAX || 100),
    },
    smtp: {
        host: process.env.SMTP_HOST || '',
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
        from: process.env.SMTP_FROM || 'Nurvio Admin <no-reply@nurvio-hub.de>',
    },
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
};
