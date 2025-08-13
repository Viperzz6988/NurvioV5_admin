import 'dotenv/config';

export const isProduction = process.env.NODE_ENV === 'production';

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  dbSsl: process.env.DB_SSL === 'true',
  dbSslRejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
  sessionSecret: process.env.SESSION_SECRET || '',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '30', 10),
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: process.env.SMTP_SECURE !== 'false',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'No Reply <no-reply@example.com>',
    to: process.env.CONTACT_TO || 'Admin <admin@example.com>'
  },
  corsOrigin: process.env.CORS_ORIGIN || (isProduction ? '' : 'http://localhost:5173')
};

if (!config.databaseUrl) {
  console.warn('Warning: DATABASE_URL is not set.');
}
if (!config.sessionSecret) {
  console.warn('Warning: SESSION_SECRET is not set.');
}