import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from '../src/db.js';

function transformForMysql(sql: string): string {
  // Replace BIGSERIAL with BIGINT AUTO_INCREMENT
  let out = sql.replace(/BIGSERIAL/gi, 'BIGINT AUTO_INCREMENT');
  // Ensure CURRENT_TIMESTAMP syntax without parentheses is fine; leave as-is
  // Append engine/charset to each CREATE TABLE
  out = out.replace(/\)\s*;\s*$/gm, ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;');
  return out;
}

async function run() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  // Always read schema from project root to avoid copying into dist
  const schemaPath = path.resolve(process.cwd(), 'db/schema.sql');
  let sql = fs.readFileSync(schemaPath, 'utf8');

  // If using MySQL, transform schema for compatibility
  const isMysql = (await import('../src/db.js')).db.kind === 'mysql';
  if (isMysql) {
    sql = transformForMysql(sql);
  }

  const statements = sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));
  for (const stmt of statements) {
    await db.query(stmt);
  }
  console.log('Migration complete');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});