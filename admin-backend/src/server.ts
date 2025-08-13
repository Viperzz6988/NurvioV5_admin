import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import session from 'express-session';
import csrf from 'csurf';
import { config, isProduction } from './config.js';
import { db, kind as dbKind } from './db.js';
import { ensureAdminAccounts, verifyAdminCredentials } from './auth.js';
import { contactSchema, loginSchema } from './validation.js';
import { sendContactEmail } from './email.js';
import rateLimit from 'express-rate-limit';

async function buildSessionStore(sess: typeof session) {
  if (dbKind === 'postgres') {
    const mod = await import('connect-pg-simple');
    const PgStore = (mod as any)(sess);
    const { Pool } = await import('pg');
    const pgPool = new Pool({
      connectionString: config.databaseUrl,
      ssl: config.dbSsl ? { rejectUnauthorized: config.dbSslRejectUnauthorized } : undefined,
    });
    return new PgStore({ pool: pgPool, tableName: 'session', createTableIfMissing: true });
  } else {
    const mod = await import('express-mysql-session');
    const MySQLStore = (mod as any)(sess);
    const url = new URL(config.databaseUrl);
    const options = {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ''),
      createDatabaseTable: true,
      schema: {
        tableName: 'sessions',
        columnNames: {
          session_id: 'session_id',
          expires: 'expires',
          data: 'data',
        },
      },
    } as any;
    return new MySQLStore(options);
  }
}

(async () => {
  await ensureAdminAccounts();

  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(
    cors({
      origin: config.corsOrigin || true,
      credentials: true,
    } as any)
  );
  app.use(express.json({ limit: '100kb' }));

  const store = await buildSessionStore(session);
  app.use(
    session({
      secret: config.sessionSecret || 'dev-secret-change-me',
      resave: false,
      saveUninitialized: false,
      store,
      cookie: {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 8,
      },
      name: 'sid',
    })
  );

  const csrfProtection = csrf({ cookie: false });

  const limiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
  });

  function requireAdmin(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    if (req.session && req.session.admin) return next();
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Static frontend
  app.use(express.static('public'));

  // Health
  app.get('/api/health', (_req, res) => res.json({ ok: true, db: dbKind }));

  // CSRF token
  app.get('/api/csrf', csrfProtection as any, (req, res) => {
    res.json({ csrfToken: (req as any).csrfToken() });
  });

  // Admin login
  app.post('/api/admin/login', limiter as any, csrfProtection as any, async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
    const { email, password } = parsed.data;
    const admin = await verifyAdminCredentials(email, password);
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
    req.session.admin = { id: admin.id, email: admin.email };
    res.json({ ok: true, admin: { email: admin.email } });
  });

  app.post('/api/admin/logout', requireAdmin, (req, res) => {
    req.session.destroy(() => {
      res.clearCookie('sid');
      res.json({ ok: true });
    });
  });

  app.get('/api/admin/me', requireAdmin, (req, res) => {
    res.json({ admin: req.session.admin });
  });

  app.get('/api/admin/users', requireAdmin, async (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const limit = Math.min(200, Math.max(1, parseInt(String(req.query.limit || '100'), 10)));
    let rows;
    if (q) {
      if (dbKind === 'postgres') {
        rows = await db.query<{ id: number; username: string }>(
          'SELECT id, username FROM users WHERE username ILIKE ? OR CAST(id AS TEXT) LIKE ? ORDER BY id ASC LIMIT ?',
          [`%${q}%`, `%${q}%`, limit]
        );
      } else {
        rows = await db.query<{ id: number; username: string }>(
          'SELECT id, username FROM users WHERE username LIKE ? OR CAST(id AS CHAR) LIKE ? ORDER BY id ASC LIMIT ?',
          [`%${q}%`, `%${q}%`, limit]
        );
      }
    } else {
      rows = await db.query<{ id: number; username: string }>(
        'SELECT id, username FROM users ORDER BY id ASC LIMIT ?',[limit]
      );
    }
    res.json({ users: rows });
  });

  app.post('/api/contact', limiter as any, csrfProtection as any, async (req, res) => {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
    const { name, email, message } = parsed.data;
    if (/\r|\n/.test(name) || /\r|\n/.test(email)) return res.status(400).json({ error: 'Invalid characters' });

    await db.query('INSERT INTO contact_messages (sender_name, sender_email, message) VALUES (?, ?, ?)', [name, email, message]);

    try {
      await sendContactEmail({ name, email, message });
      res.json({ ok: true });
    } catch (err) {
      console.error('SMTP error', err);
      res.status(502).json({ error: 'Failed to send email' });
    }
  });

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  app.listen(config.port, () => {
    console.log(`Server listening on :${config.port} (DB: ${dbKind})`);
  });
})();