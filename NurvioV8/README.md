# NurvioV8

Monorepo for the Nurvio platform (backend + frontend + database + admin panel + games). Clean structure, single documentation.

## Structure
```
NurvioV8/
  apps/
    backend/
      src/
      prisma/
      docker-compose.yml
      package.json
    frontend/
      src/
      package.json
  package.json
```

## Prerequisites
- Node.js 20+, npm 10+
- Docker (optional, recommended) + Docker Compose

## Environment Setup
- Backend: copy and configure env
```
cp apps/backend/.env.example apps/backend/.env
# Edit DATABASE_URL, JWT secrets, SMTP creds
```
- Frontend: copy env (defaults should work)
```
cp apps/frontend/.env.example apps/frontend/.env
```

## Database (Docker way)
```
cd apps/backend
docker-compose up -d
```
- pgAdmin: http://localhost:5050
- Login with `PGADMIN_DEFAULT_EMAIL` / `PGADMIN_DEFAULT_PASSWORD`
- Add server:
  - Name: nurvio
  - Host: postgres
  - Port: 5432
  - Username: POSTGRES_USER
  - Password: POSTGRES_PASSWORD

## Install, Migrate, Seed
```
cd ../..
npm install
npm --workspace apps/backend run prisma:migrate
npm --workspace apps/backend run prisma:generate
npm --workspace apps/backend run seed
```

## Run (Dev)
- Concurrent backend + frontend
```
npm run dev
```
- Backend only
```
npm --workspace apps/backend run dev
```
- Frontend only
```
npm --workspace apps/frontend run dev
```

## Default Admin Credentials
- orange.admin@nurvio.de / Root.Orange!
- vez.admin@nurvio.de / Root.Vez!

## Features
- Admin Panel: users CRUD, bulk actions, feature flags, maintenance mode, cache clear, audit logs, data import/export, metrics, dashboard
- Public: leaderboard (admins highlighted, guests/banned filtered), contact form (SMTP)
- Games: blackjack, tetris, tic-tac-toe, gamble (scores integrated into leaderboard)
- Auth: JWT access/refresh with hashed refresh tokens, guest login
- Rate limiting and maintenance gates

## Non-Docker DB Setup
1) Install Postgres locally and create database matching `DATABASE_URL`
2) Ensure `apps/backend/.env` has valid `DATABASE_URL`
3) Run migrations and seed as above

## Troubleshooting
- Prisma P1001: ensure Postgres is running and `DATABASE_URL` is correct
- SMTP send failure: verify SMTP_* envs
- CORS: backend uses permissive CORS in dev; adjust for prod

## Production Build
```
npm run build
# start backend
npm --workspace apps/backend run start
# serve frontend build with any static server or integrate with backend
```