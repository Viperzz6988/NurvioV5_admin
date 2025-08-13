import { config } from './config.js';
import { Pool as PgPool } from 'pg';
import mysql from 'mysql2/promise';

export type DbKind = 'postgres' | 'mysql';

function detectDbKind(url: string): DbKind {
  const lower = url.toLowerCase();
  if (lower.startsWith('postgres://') || lower.startsWith('postgresql://')) return 'postgres';
  if (lower.startsWith('mysql://') || lower.startsWith('mysql2://')) return 'mysql';
  throw new Error('Unsupported DATABASE_URL scheme. Use postgres:// or mysql://');
}

export const kind: DbKind = detectDbKind(config.databaseUrl);

function convertPlaceholdersForPg(sql: string): string {
  let index = 0;
  return sql.replace(/\?/g, () => {
    index += 1;
    return `$${index}`;
  });
}

let pgPool: any = null;
let mysqlPool: mysql.Pool | null = null;

if (kind === 'postgres') {
  pgPool = new PgPool({
    connectionString: config.databaseUrl,
    ssl: config.dbSsl ? { rejectUnauthorized: config.dbSslRejectUnauthorized } : undefined,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
} else {
  mysqlPool = mysql.createPool({
    uri: config.databaseUrl,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    ssl: config.dbSsl ? { rejectUnauthorized: config.dbSslRejectUnauthorized } as any : undefined,
    multipleStatements: false,
  });
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  if (kind === 'postgres') {
    if (!pgPool) throw new Error('pg pool not configured');
    const text = convertPlaceholdersForPg(sql);
    const res = await pgPool.query(text, params);
    return res.rows as T[];
  } else {
    if (!mysqlPool) throw new Error('mysql pool not configured');
    const [rows] = await mysqlPool.execute(sql, params);
    return rows as T[];
  }
}

export async function transaction<T>(fn: (q: (sql: string, params?: any[]) => Promise<any[]>) => Promise<T>): Promise<T> {
  if (kind === 'postgres') {
    if (!pgPool) throw new Error('pg pool not configured');
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      const q = async (sql: string, params: any[] = []) => {
        const text = convertPlaceholdersForPg(sql);
        const res = await client.query(text, params);
        return res.rows as any[];
      };
      const out = await fn(q);
      await client.query('COMMIT');
      return out;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } else {
    if (!mysqlPool) throw new Error('mysql pool not configured');
    const conn = await mysqlPool.getConnection();
    try {
      await conn.beginTransaction();
      const q = async (sql: string, params: any[] = []) => {
        const [rows] = await conn.execute(sql, params);
        return rows as any[];
      };
      const out = await fn(q);
      await conn.commit();
      return out;
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }
}

export const db = { kind, query, tx: transaction };