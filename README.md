# NurvioV5_admin

A clean monorepo for Nurvio Admin platform.

- Backend: Express + Prisma + PostgreSQL (CommonJS)
- Frontend: Vite + React + TypeScript + MUI
- Database: Postgres 15 (Docker) + pgAdmin

## Quick Start (Docker)
1) Clone and enter repo
```
git clone https://github.com/Viperzz6988/NurvioV5_admin
cd NurvioV5_admin/NurvioV5_admin
```
2) Copy env files
```
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```
3) Start Postgres + pgAdmin
```
cd apps/backend
docker-compose up -d
```
- pgAdmin: http://localhost:5050
- Login with `PGADMIN_DEFAULT_EMAIL` / `PGADMIN_DEFAULT_PASSWORD`
- Add Server in pgAdmin:
  - Name: nurvio
  - Host: postgres
  - Port: 5432
  - User: POSTGRES_USER
  - Password: POSTGRES_PASSWORD

4) Install deps, migrate DB, seed
```
cd ../../
npm install
npm --workspace apps/backend run prisma:migrate
npm --workspace apps/backend run prisma:generate
npm --workspace apps/backend run seed
```

5) Run dev
```
npm run dev
```
- Backend: http://localhost:4000
- Frontend: http://localhost:5173

## Quick Start (No Docker)
1) Install Postgres locally, create DB matching `DATABASE_URL` in `apps/backend/.env`
2) Copy envs, install deps
```
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
npm install
```
3) Migrate + seed
```
npm --workspace apps/backend run prisma:migrate
npm --workspace apps/backend run prisma:generate
npm --workspace apps/backend run seed
```
4) Run dev
```
npm run dev
```

## Default Admin Credentials
- orange.admin@nurvio.de / Root.Orange!
- vez.admin@nurvio.de / Root.Vez!

## Environment Files
- apps/backend/.env
  - DATABASE_URL
  - JWT_ACCESS_SECRET / JWT_REFRESH_SECRET
  - SMTP_HOST/PORT/SECURE/USER/PASS/FROM
  - REDIS_URL (optional)
  - POSTGRES_*, PGADMIN_* (if Docker)
- apps/frontend/.env
  - VITE_API_BASE_URL (default http://localhost:4000/api)

## Features
- Authentication: JWT access/refresh, hashed refresh tokens, guest login
- Roles: ADMIN, SUPERADMIN, USER, GUEST
- Admin Panel
  - Users: CRUD, search, bulk role, bulk ban/unban, bulk delete
  - Settings: feature flags, maintenance mode, cache clear
  - Logs: audit logs with filters
  - Data: export/import JSON
  - Metrics: CPU, memory, DB connections
  - Leaderboard manager
  - Dashboard: total users, active 24h, banned, server metrics
- Public
  - Leaderboard (admins highlighted; banned and guests excluded)
  - Contact form with SMTP
- Games
  - Leaderboard integration for blackjack, tetris, tic-tac-toe, gamble game (scores stored on users)

## Scripts
- Root
  - dev: run backend + frontend
  - build: build both apps
- Backend
  - dev, build, start
  - prisma:migrate, prisma:generate, seed
- Frontend
  - dev, build

## Troubleshooting
- Docker not running: install Docker Desktop and retry `docker-compose up -d` in `apps/backend`.
- Prisma cannot reach DB: verify `DATABASE_URL` and Postgres up; run migrations again.
- SMTP send fails: verify SMTP_* envs.

## Structure
```
NurvioV5_admin/
  NurvioV5_admin/
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