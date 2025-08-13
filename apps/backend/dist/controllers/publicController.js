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
const zod_1 = require("zod");
async function publicLeaderboard(req, res) {
    const users = await prisma_1.prisma.user.findMany({
        where: {
            isBanned: false,
            roles: { none: { name: 'GUEST' } },
        },
        orderBy: { score: 'desc' },
        select: {
            id: true,
            username: true,
            score: true,
            roles: { select: { name: true } },
        },
        take: 100,
    });
    const data = users.map((u) => ({
        id: u.id,
        username: u.username,
        score: u.score,
        isAdmin: u.roles.some((r) => r.name === 'ADMIN' || r.name === 'SUPERADMIN'),
    }));
    res.json(data);
}
async function contact(req, res) {
    const schema = zod_1.z.object({
        name: zod_1.z.string().min(2).max(100),
        email: zod_1.z.string().email(),
        subject: zod_1.z.string().min(2).max(200),
        message: zod_1.z.string().min(10).max(2000),
    });
    const parse = schema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Invalid input' });
    }
    const { name, email, subject, message } = parse.data;
    try {
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
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to send email' });
    }
    res.json({ success: true });
}
