## Backend Docker (Postgres + pgAdmin)

1. Copy `.env.example` to `.env` in `apps/backend` and adjust as needed:

```
cp apps/backend/.env.example apps/backend/.env
```

2. Start Postgres and pgAdmin:

```
cd apps/backend
docker-compose up -d
```

3. Access pgAdmin at http://localhost:5050 using `PGADMIN_DEFAULT_EMAIL`/`PGADMIN_DEFAULT_PASSWORD` from `.env`.

4. In pgAdmin, add a new server:
- Name: nurvio
- Host: postgres
- Port: 5432
- Username: `POSTGRES_USER`
- Password: `POSTGRES_PASSWORD`

5. Run Prisma migrations and generate client:

```
npm --workspace apps/backend run prisma:migrate
npm --workspace apps/backend run prisma:generate
```

6. Start backend for development:

```
npm run dev:backend
```

Public endpoints:
- GET `http://localhost:4000/api/public/leaderboard`
- POST `http://localhost:4000/api/public/contact` { name, email, subject, message }