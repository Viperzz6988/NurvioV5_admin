import 'dotenv/config';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { run, get } from './db.js';

async function main() {
  await run('PRAGMA foreign_keys = ON;');
  // Ensure role column exists
  try { await run("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'"); } catch (_) {}
  try { await run("ALTER TABLE users ADD COLUMN force_password_change INTEGER DEFAULT 0"); } catch (_) {}

  const admin1Email = process.env.ADMIN1_EMAIL;
  const admin1Pw = process.env.ADMIN1_PW;
  const admin2Email = process.env.ADMIN2_EMAIL;
  const admin2Pw = process.env.ADMIN2_PW;

  let useDefaults = false;
  if ((!admin1Email || !admin1Pw || !admin2Email || !admin2Pw)) {
    if (process.argv.includes('--allow-default-admins')) {
      console.warn('WARNING: Creating default admin accounts. CHANGE THEIR PASSWORDS IMMEDIATELY on first login.');
      useDefaults = true;
    } else {
      console.log('No admin env variables set. To create default admins, run with --allow-default-admins');
      process.exit(0);
    }
  }

  const admins = [
    { email: admin1Email || 'orange.admin@nurvio.de', password: admin1Pw || 'Root.Orange!', username: 'orange.admin', name: 'Orange Admin' },
    { email: admin2Email || 'vez.admin@nurvio.de', password: admin2Pw || 'Root.Vez!', username: 'vez.admin', name: 'Vez Admin' },
  ];

  for (const a of admins) {
    const exists = await get('SELECT id FROM users WHERE email = ?', [a.email.toLowerCase()]);
    if (exists) {
      console.log(`Admin already exists: ${a.email}`);
      continue;
    }
    const id = crypto.randomUUID?.() || String(Date.now());
    const hash = await bcrypt.hash(a.password, 12);
    await run('INSERT INTO users (id, email, username, name, password_hash, created_at, role, force_password_change) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
      id,
      a.email.toLowerCase(),
      a.username.toLowerCase(),
      a.name,
      hash,
      new Date().toISOString(),
      'admin',
      useDefaults ? 1 : 0,
    ]);
    console.log(`Created admin: ${a.email}`);
  }

  console.log('Seed complete.');
}

main().catch((e) => { console.error(e); process.exit(1); });