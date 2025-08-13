import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, run } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const migrationsDir = path.resolve(projectRoot, 'database', 'migrations');

async function applyMigrations() {
  if (!fs.existsSync(migrationsDir)) {
    console.log('No migrations directory found. Skipping.');
    process.exit(0);
  }
  const files = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  await run('PRAGMA foreign_keys = ON;');
  await run('CREATE TABLE IF NOT EXISTS _migrations (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL);');

  for (const file of files) {
    const id = file;
    const applied = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM _migrations WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(!!row);
      });
    });
    if (applied) {
      continue;
    }
    const sql = fs.readFileSync(path.resolve(migrationsDir, file), 'utf-8');
    console.log(`Applying migration ${file}...`);
    await new Promise((resolve, reject) => db.exec(sql, (err) => (err ? reject(err) : resolve())));
    await run('INSERT INTO _migrations (id, applied_at) VALUES (?, ?)', [id, new Date().toISOString()]);
  }
  console.log('Migrations complete.');
  process.exit(0);
}

applyMigrations().catch((err) => {
  console.error(err);
  process.exit(1);
});