# Nurvio App (Node.js + TypeScript)

Production-ready starter using Express, sessions, SMTP, and a real relational database (PostgreSQL or MySQL). No ORM is required, but recommendations are included.

## Features
- Real DB connection (PostgreSQL/MySQL) via native drivers, pooled, parameterized queries
- Minimal schema and SQL for users, admins, and contact_messages
- Admin authentication for two fixed accounts (bcrypt, sessions, CSRF, rate limiting)
- Contact form API with SMTP (nodemailer) + validation and storage
- Admin panel with Target User dropdown (ID left, Username right)
- TypeScript backend and small TypeScript frontend bundled with esbuild
- Secure defaults: helmet, cookie flags, CSRF, rate limits

## Prerequisites
- Node.js >= 18
- A reachable PostgreSQL or MySQL server (no local DB files)

## Quick Start
1. Clone the repo and create configuration file:
   ```bash
   cp .env.example .env
   # edit .env to set DATABASE_URL, SESSION_SECRET, SMTP_*, etc.
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create tables on your DB server (requires DATABASE_URL):
   ```bash
   # ensure .env has a valid postgres:// or mysql:// URL
   npm run build
   npm run migrate
   ```

4. Optionally seed sample users:
   ```bash
   npm run seed:users
   ```

5. Build and run:
   ```bash
   npm run build
   npm start
   # or develop with hot-reload
   npm run dev
   ```


## Database
- One `DATABASE_URL` controls detection:
  - Postgres: `postgres://user:pass@host:5432/db` (set `DB_SSL=true` when needed)
  - MySQL: `mysql://user:pass@host:3306/db`
- SSL is supported via `DB_SSL` and `DB_SSL_REJECT_UNAUTHORIZED`.
- Schema file: `db/schema.sql` (run via `npm run migrate`).
- SQL safety: Always use `?` placeholders. The system converts to `$1..$n` for PostgreSQL.
- MySQL migrations: The migration script automatically adapts `BIGSERIAL` and appends `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`.

## SMTP
- Configure `SMTP_*` and `CONTACT_TO` in `.env`.
- The contact page will reject invalid emails (e.g., `lalalalala at e-mail.com`).

## Security
- Sessions stored in DB-backed stores (`connect-pg-simple` or `express-mysql-session`).
- Cookies: `httpOnly`, `secure` in production, `sameSite=lax`.
- Passwords: bcrypt with cost 12.
- CSRF: `csurf` tokens for state-changing endpoints.
- Rate limiting on login/contact.

## Frontend
- Static files in `public/`.
- TypeScript frontend sources in `frontend/` are bundled to `public/assets/` via esbuild.
- Admin dropdown shows User ID on the left and Username on the right for clarity.

## Recommendations
- ORM: Consider Drizzle or Prisma for type-safe queries and migrations as the project grows.
- Auth: For larger teams, consider Passport (sessions) or a provider like Ory/Clerk/Auth0. Keep admin panel on sessions for easy server-side invalidation.
- Additional hardening: enable strict CSP with nonces, add audit logging, and implement MFA for admin accounts.

## Deploying
- Provide environment variables via your platform (Docker/Kubernetes/VM).
- Ensure the DB server is reachable from the app and TLS is configured.
- Run `npm run migrate` during deploy.
- Run `npm run build` and then `npm start`.

## GitHub
- This project is ready to push to GitHub. After cloning and configuring:
  ```bash
  git init
  git add .
  git commit -m "Initial release"
  git branch -M main
  git remote add origin git@github.com:YOUR_ORG/YOUR_REPO.git
  git push -u origin main
  ```

## Scripts
- `npm run dev` – Run server in watch mode (ts-node ESM loader).
- `npm run build` – Compile TS and bundle frontend.
- `npm start` – Run compiled server.
- `npm run migrate` – Apply schema SQL to the configured DB.
- `npm run seed:users` – Insert sample users if none exist.
