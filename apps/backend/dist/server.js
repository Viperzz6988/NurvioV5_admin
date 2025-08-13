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
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use('/api', rateLimit_1.apiLimiter);
app.get('/health', async (_req, res) => {
    try {
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        res.json({ ok: true });
    }
    catch (e) {
        res.status(500).json({ ok: false });
    }
});
app.use((req, res, next) => {
    if (env_1.env.maintenanceMode && !req.path.startsWith('/health'))
        return res.status(503).json({ message: 'Maintenance mode' });
    next();
});
app.use('/api/auth', authRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/public', publicRoutes_1.default);
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
});
app.listen(env_1.env.port, () => {
    console.log(`Backend listening on http://localhost:${env_1.env.port}`);
});
