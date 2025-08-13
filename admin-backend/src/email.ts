import nodemailer from 'nodemailer';
import { config } from './config.js';

export function createSmtpTransport() {
  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
    tls: { rejectUnauthorized: true },
  });
}

export async function sendContactEmail(opts: { name: string; email: string; message: string }) {
  const transporter = createSmtpTransport();
  const subject = `New contact message from ${opts.name}`;
  const text = [`From: ${opts.name} <${opts.email}>`, '', 'Message:', opts.message].join('\n');
  await transporter.sendMail({ from: config.smtp.from, to: config.smtp.to, subject, text });
}