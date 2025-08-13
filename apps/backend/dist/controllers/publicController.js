"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicLeaderboard = publicLeaderboard;
exports.contact = contact;
const prisma_1 = require("../db/prisma");
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
async function publicLeaderboard(req, res) {
    const entries = await prisma_1.prisma.leaderboardEntry.findMany({ include: { user: { include: { roles: true } } }, orderBy: { score: 'desc' } });
    const data = entries
        .filter((e) => !e.user.roles.some((r) => r.name === 'GUEST') && !e.hidden)
        .map((e) => ({ id: e.id, userId: e.userId, username: e.user.username, score: e.score, isAdmin: e.user.roles.some((r) => r.name === 'ADMIN' || r.name === 'SUPERADMIN') }));
    res.json(data);
}
async function contact(req, res) {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message || message.length < 10)
        return res.status(400).json({ message: 'Invalid input' });
    const transporter = nodemailer_1.default.createTransport({
        host: env_1.env.smtp.host,
        port: env_1.env.smtp.port,
        secure: env_1.env.smtp.secure,
        auth: { user: env_1.env.smtp.user, pass: env_1.env.smtp.pass },
    });
    await transporter.sendMail({
        from: env_1.env.smtp.from,
        to: 'contact@nurvio-hub.de',
        subject: `[Contact] ${subject}`,
        replyTo: email,
        text: `From: ${name} <${email}>

${message}`,
    });
    res.json({ success: true });
}
