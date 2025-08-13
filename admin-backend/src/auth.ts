import bcrypt from 'bcrypt';
import { db } from './db.js';

const BCRYPT_COST = 12;

const FIXED_ADMINS = [
  { email: 'orange.admin@nurvio.de', passwordPlain: 'Root.Orange!' },
  { email: 'vez.admin@nurvio.de', passwordPlain: 'Root.Vez!' },
];

export async function ensureAdminAccounts() {
  for (const admin of FIXED_ADMINS) {
    const existing = await db.query<{ id: number }>('SELECT id FROM admins WHERE email = ?', [admin.email]);
    if (existing.length === 0) {
      const passwordHash = await bcrypt.hash(admin.passwordPlain, BCRYPT_COST);
      await db.query('INSERT INTO admins (email, password_hash) VALUES (?, ?)', [admin.email, passwordHash]);
    }
  }
}

export async function verifyAdminCredentials(email: string, password: string) {
  const rows = await db.query<{ id: number; email: string; password_hash: string }>(
    'SELECT id, email, password_hash FROM admins WHERE email = ?',
    [email]
  );
  if (rows.length === 0) return null;
  const admin = rows[0];
  const ok = await bcrypt.compare(password, admin.password_hash);
  if (!ok) return null;
  return { id: admin.id, email: admin.email };
}