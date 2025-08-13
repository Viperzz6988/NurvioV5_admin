# NurvioV5_admin

A monorepo containing the Nurvio Admin backend (Express + Prisma + Postgres) and frontend (Vite + React + MUI). Includes Docker Compose for Postgres and pgAdmin.

## Prerequisites
- Node.js 20+
- npm 10+
- Docker + Docker Compose

## Setup
1) Clone the repo
```
git clone https://github.com/Viperzz6988/NurvioV5_admin
cd NurvioV5_admin
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
- Access pgAdmin at http://localhost:5050
- Login with `PGADMIN_DEFAULT_EMAIL` / `PGADMIN_DEFAULT_PASSWORD`
- Add a new Server:
  - Name: nurvio
  - Host: postgres
  - Port: 5432
  - Username: POSTGRES_USER
  - Password: POSTGRES_PASSWORD

4) Install and generate Prisma
```
npm install
npm --workspace apps/backend run prisma:migrate
npm --workspace apps/backend run prisma:generate
npm --workspace apps/backend run seed
```

5) Run development servers
```
npm run dev
```
- Backend: http://localhost:4000
- Frontend: http://localhost:5173

## Default Admin Accounts
- orange.admin@nurvio.de / Root.Orange!
- vez.admin@nurvio.de / Root.Vez!

## API Overview
Base URL: http://localhost:4000/api

- Auth
  - POST /auth/login { identifier, password }
  - POST /auth/refresh { refreshToken }
  - POST /auth/logout
  - GET /auth/me
  - POST /auth/guest

- Admin (require ADMIN or SUPERADMIN)
  - GET /admin/users
  - POST /admin/users
  - PUT /admin/users/:id
  - DELETE /admin/users/:id
  - POST /admin/users/bulk/delete
  - POST /admin/users/bulk/role
  - POST /admin/users/bulk/ban
  - POST /admin/feature-flags
  - POST /admin/maintenance
  - POST /admin/cache/clear
  - GET /admin/metrics
  - GET /admin/audit-logs
  - GET /admin/export
  - POST /admin/import
  - GET /admin/leaderboard

- Public
  - GET /public/leaderboard
  - POST /public/contact

## Frontend Features
- Authentication with token refresh and guest login
- Admin dashboard: users, settings (feature flags, maintenance, cache), audit logs, data import/export, metrics, leaderboard viewer
- Public pages: leaderboard with admin highlight, contact form
- i18next with EN/DE and theme toggle (light/dark)

## Build
- Root: `npm run build` builds both backend and frontend
- Frontend only: `npm --workspace apps/frontend run build`
- Backend only: `npm --workspace apps/backend run build`