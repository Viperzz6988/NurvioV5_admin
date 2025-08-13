import { db } from '../src/db.js';

async function main() {
  const rows = await db.query<{ c: string | number }>('SELECT COUNT(*) as c FROM users');
  const count = Number(rows[0]?.c ?? 0);
  if (count === 0) {
    const sample = [
      ['alice', 'alice@example.com'],
      ['bob', 'bob@example.com'],
      ['charlie', 'charlie@example.com'],
    ];
    for (const [u, e] of sample) {
      await db.query('INSERT INTO users (username, email) VALUES (?, ?)', [u, e]);
    }
    console.log('Seeded users');
  } else {
    console.log('Users already present, skipping');
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});