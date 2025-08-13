"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./config/env");
const prisma_1 = require("./db/prisma");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const publicRoutes_1 = __importDefault(require("./routes/publicRoutes"));
const rateLimit_1 = require("./middlewares/rateLimit");
const jwt_1 = require("./utils/jwt");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)('dev'));
app.get('/health', async (_req, res) => {
    try {
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        res.json({ ok: true });
    }
    catch (e) {
        res.status(500).json({ ok: false });
    }
});
let maintenanceCache = null;
async function isMaintenance() {
    if (env_1.env.nodeEnv === 'development')
        return false;
    const now = Date.now();
    if (maintenanceCache && now - maintenanceCache.ts < 5000)
        return maintenanceCache.enabled;
    try {
        const setting = await prisma_1.prisma.setting.findUnique({ where: { key: 'maintenance' } });
        const enabled = Boolean(setting?.value?.enabled);
        maintenanceCache = { enabled, ts: now };
        return enabled;
    }
    catch {
        return false;
    }
}
app.use(async (req, res, next) => {
    const maintenance = await isMaintenance();
    if (!maintenance)
        return next();
    // Allow admins during maintenance
    try {
        const auth = req.headers.authorization;
        if (auth?.startsWith('Bearer ')) {
            const token = auth.slice(7);
            const payload = (0, jwt_1.verifyAccessToken)(token);
            const roles = payload.roles || [];
            const isAdmin = roles.includes('ADMIN') || roles.includes('SUPERADMIN');
            if (isAdmin)
                return next();
        }
    }
    catch { }
    return res.status(503).json({ message: 'Maintenance mode' });
});
app.use('/api/auth', authRoutes_1.default);
app.use('/api/admin', rateLimit_1.apiLimiter, adminRoutes_1.default);
app.use('/api/public', rateLimit_1.apiLimiter, publicRoutes_1.default);
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
});
app.listen(env_1.env.port, () => {
    console.log(`Backend listening on http://localhost:${env_1.env.port}`);
});
