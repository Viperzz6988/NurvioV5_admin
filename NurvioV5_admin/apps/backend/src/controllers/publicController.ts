import { Request, Response } from 'express';
import { prisma } from '../db/prisma';
import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { z } from 'zod';

export async function publicLeaderboard(req: Request, res: Response) {
  const users = await prisma.user.findMany({
    where: {
      isBanned: false,
      roles: { none: { name: 'GUEST' as any } },
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

export async function contact(req: Request, res: Response) {
  const schema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    subject: z.string().min(2).max(200),
    message: z.string().min(10).max(2000),
  });

  const parse = schema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  const { name, email, subject, message } = parse.data;

  try {
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
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to send email' });
  }

  res.json({ success: true });
}