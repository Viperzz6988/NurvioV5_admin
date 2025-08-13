import { Request, Response } from 'express';
import { prisma } from '../db/prisma';
import nodemailer from 'nodemailer';
import { env } from '../config/env';

export async function publicLeaderboard(req: Request, res: Response) {
  const entries = await prisma.leaderboardEntry.findMany({ include: { user: { include: { roles: true } } }, orderBy: { score: 'desc' } });
  const data = entries
    .filter((e) => !e.user.roles.some((r) => r.name === 'GUEST') && !e.hidden)
    .map((e) => ({ id: e.id, userId: e.userId, username: e.user.username, score: e.score, isAdmin: e.user.roles.some((r) => r.name === 'ADMIN' || r.name === 'SUPERADMIN') }));
  res.json(data);
}

export async function contact(req: Request, res: Response) {
  const { name, email, subject, message } = req.body as { name: string; email: string; subject: string; message: string };
  if (!name || !email || !subject || !message || message.length < 10) return res.status(400).json({ message: 'Invalid input' });
  const transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
  });
  await transporter.sendMail({
    from: env.smtp.from,
    to: 'contact@nurvio-hub.de',
    subject: `[Contact] ${subject}`,
    replyTo: email,
    text: `From: ${name} <${email}>

${message}`,
  });
  res.json({ success: true });
}