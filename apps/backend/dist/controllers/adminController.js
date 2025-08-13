"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = getUsers;
exports.getUsersSelect = getUsersSelect;
exports.stats = stats;
exports.getFeatureFlags = getFeatureFlags;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.bulkDelete = bulkDelete;
exports.bulkRoleChange = bulkRoleChange;
exports.bulkBan = bulkBan;
exports.featureFlag = featureFlag;
exports.maintenance = maintenance;
exports.clearServerCache = clearServerCache;
exports.getMetrics = getMetrics;
exports.getAuditLogs = getAuditLogs;
exports.exportAll = exportAll;
exports.importAll = importAll;
exports.leaderboard = leaderboard;
const admin = __importStar(require("../services/adminService"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const audit_1 = require("../middlewares/audit");
async function getUsers(req, res) {
    const data = await admin.listUsers({
        search: req.query.search,
        role: req.query.role,
        banned: req.query.banned,
        skip: req.query.skip ? Number(req.query.skip) : undefined,
        take: req.query.take ? Number(req.query.take) : undefined,
    });
    res.json(data);
}
async function getUsersSelect(req, res) {
    const list = await admin.listUsersSelect(req.query.search || undefined);
    res.json(list);
}
async function stats(_req, res) {
    const s = await admin.stats();
    res.json(s);
}
async function getFeatureFlags(_req, res) {
    const flags = await admin.listFeatureFlags();
    res.json(flags);
}
async function createUser(req, res) {
    const { email, username, password, roles } = req.body;
    const passwordHash = await bcryptjs_1.default.hash(password, 12);
    const user = await admin.createUser({ email, username, passwordHash, roles: roles || ['USER'] });
    await (0, audit_1.audit)('admin.createUser', { id: user.id, email: user.email }, req.user?.userId);
    res.json(user);
}
async function updateUser(req, res) {
    const id = req.params.id;
    const { email, username, password, roles, isBanned } = req.body;
    const data = { email, username, roles, isBanned };
    if (password)
        data.passwordHash = await bcryptjs_1.default.hash(password, 12);
    const user = await admin.updateUser(id, data);
    await (0, audit_1.audit)('admin.updateUser', { id }, req.user?.userId);
    res.json(user);
}
async function deleteUser(req, res) {
    const id = req.params.id;
    await admin.deleteUser(id);
    await (0, audit_1.audit)('admin.deleteUser', { id }, req.user?.userId);
    res.json({ success: true });
}
async function bulkDelete(req, res) {
    const { ids } = req.body;
    await admin.bulkDelete(ids);
    await (0, audit_1.audit)('admin.bulkDelete', { ids }, req.user?.userId);
    res.json({ success: true });
}
async function bulkRoleChange(req, res) {
    const { ids, role } = req.body;
    await admin.bulkRoleChange(ids, role);
    await (0, audit_1.audit)('admin.bulkRoleChange', { ids, role }, req.user?.userId);
    res.json({ success: true });
}
async function bulkBan(req, res) {
    const { ids, isBanned } = req.body;
    await admin.bulkBan(ids, isBanned);
    await (0, audit_1.audit)('admin.bulkBan', { ids, isBanned }, req.user?.userId);
    res.json({ success: true });
}
async function featureFlag(req, res) {
    const { key, enabled } = req.body;
    const flag = await admin.toggleFeatureFlag(key, enabled);
    await (0, audit_1.audit)('admin.featureFlag', { key, enabled }, req.user?.userId);
    res.json(flag);
}
async function maintenance(req, res) {
    const { enabled } = req.body;
    const out = await admin.toggleMaintenanceMode(enabled);
    await (0, audit_1.audit)('admin.maintenance', { enabled }, req.user?.userId);
    res.json(out);
}
async function clearServerCache(req, res) {
    const out = await admin.clearCache();
    await (0, audit_1.audit)('admin.clearCache', undefined, req.user?.userId);
    res.json(out);
}
async function getMetrics(_req, res) {
    const out = await admin.metrics();
    res.json(out);
}
async function getAuditLogs(req, res) {
    const data = await admin.auditLogs({
        from: req.query.from,
        to: req.query.to,
        userId: req.query.userId,
        action: req.query.action,
        skip: req.query.skip ? Number(req.query.skip) : undefined,
        take: req.query.take ? Number(req.query.take) : undefined,
    });
    res.json(data);
}
async function exportAll(req, res) {
    const data = await admin.exportData();
    await (0, audit_1.audit)('admin.export', undefined, req.user?.userId);
    res.json(data);
}
async function importAll(req, res) {
    const payload = req.body;
    const data = await admin.importData(payload);
    await (0, audit_1.audit)('admin.import', undefined, req.user?.userId);
    res.json(data);
}
async function leaderboard(_req, res) {
    const data = await admin.leaderboardPublic();
    res.json(data);
}
