"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.audit = audit;
exports.auditMiddleware = auditMiddleware;
const prisma_1 = require("../db/prisma");
async function audit(action, details, userId) {
    try {
        await prisma_1.prisma.auditLog.create({
            data: {
                action,
                details,
                userId,
            },
        });
    }
    catch (err) {
        // ignore
    }
}
function auditMiddleware(action) {
    return async (req, res, next) => {
        try {
            await prisma_1.prisma.auditLog.create({
                data: {
                    action,
                    ip: req.ip,
                    userAgent: req.headers['user-agent'] || undefined,
                    userId: req.user?.userId,
                    details: {
                        method: req.method,
                        path: req.path,
                        body: req.body ? '[redacted]' : undefined,
                    },
                },
            });
        }
        catch { }
        next();
    };
}
