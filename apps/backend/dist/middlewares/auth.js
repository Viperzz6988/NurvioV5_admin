"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireRoles = requireRoles;
const jwt_1 = require("../utils/jwt");
function requireAuth(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer '))
        return res.status(401).json({ message: 'Unauthorized' });
    const token = auth.slice(7);
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        req.user = payload;
        next();
    }
    catch {
        return res.status(401).json({ message: 'Invalid token' });
    }
}
function requireRoles(roles) {
    return (req, res, next) => {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const has = req.user.roles.some((r) => roles.includes(r));
        if (!has)
            return res.status(403).json({ message: 'Forbidden' });
        next();
    };
}
