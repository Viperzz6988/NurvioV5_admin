Database setup

- SQLite file: `database/app.db`
- Migrations: `database/migrations/*.sql`

Local development

1. Install frontend deps: `npm install` in repo root.
2. Install backend deps: `cd server && npm install`.
3. Run migrations: `npm run migrate` in `server` folder. This creates the DB and tables.
4. Start backend: `npm run dev` in `server`. It listens on port 3001 by default.
5. Start frontend: from repo root `npm run dev`. Vite proxies `/api` to the backend.

Environment

- Copy `server/.env.example` to `server/.env` if you want to override defaults. `JWT_SECRET` is recommended in production.
- Optionally set `DATABASE_FILE` to a custom absolute path.

Deploy

- Ensure the `server` process runs and is reachable by the frontend at `/api` (configure reverse proxy accordingly).
- Run `npm run migrate` in `server` during deployment to apply migrations.