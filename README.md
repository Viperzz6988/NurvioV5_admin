# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/6220ca84-4d96-4cfa-adde-d901a34af43a

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/6220ca84-4d96-4cfa-adde-d901a34af43a) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/6220ca84-4d96-4cfa-adde-d901a34af43a) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

# Nurvio Hub

This project is a React + Vite + TypeScript app using Tailwind and shadcn/ui.

## Internationalization (i18n)

- Global language is provided by `src/contexts/LanguageContext.tsx`.
- Translations are loaded from `public/locales/en.json` and `public/locales/de.json` by key.
- Default language is English (`en`). Current language is stored in `localStorage` under `language` and restored on page load.
- Use the `useLanguage()` hook to access:
  - `t(key)` to translate
  - `language` and `setLanguage('en' | 'de')`
- The header contains a `LanguageToggle` to switch languages.
- To add/extend translations: add the key to both JSON files under `public/locales/` and, if needed, to `src/i18n/translations.ts` type for IDE support.

## Theme (Dark/Light)

- The theme state lives in `src/components/Layout.tsx` and writes `darkMode` to `localStorage`.
- The `DarkModeToggle` button toggles the `dark` class on `document.documentElement`.

## Auth Modals (Login / Sign Up)

- Reusable modal component in `src/components/auth/AuthModal.tsx` using Radix Dialog.
- Opens from header buttons "Login" and "Sign Up" in `src/components/Navigation.tsx`.
- Features:
  - Smooth pop-in animation (scale+fade via shadcn dialog classes)
  - Focus trap, ESC to close, click outside to close
  - Form validation via `react-hook-form` + `zod`
  - Responsive, max width 480px
- Hook up backend:
  - Replace the placeholder submit in `AuthModal`'s `onSubmit` with API calls.
  - Example: call your `/api/login` or `/api/register` and handle tokens accordingly.

## Wheel of Fortune

- Implemented as `src/components/games/EnhancedWheel.tsx` (SVG + requestAnimationFrame) with deterministic alignment of the preselected winner to the top pointer.
- Simple confetti effect is rendered on a canvas overlay when a result is chosen.
- Page route: `/zufall/gluecksrad` handled by `src/pages/GlueckradPage.tsx`.
- Configuration:
  - Users can add up to 12 segments; minimum 2 required.
  - Colors cycle from a predefined palette inside the component.
  - You can set initial segments by changing the default `segments` state in `EnhancedWheel`.

## Conventions

- All user-facing strings must be translated via `t('key')` and defined in `public/locales`.
- Prefer composing pages with the existing UI primitives from `src/components/ui`.

## Development

- Install: `npm install`
- Run dev: `npm run dev`
- Build: `npm run build`

# Nurvio-Hub

This is the Nurvio-Hub application built with React + Vite + TypeScript and shadcn/ui.

## Authentication Flow (with Guest Access)
- On first load, users are prompted with a modal to choose: Login, Sign Up, or Continue as Guest.
- Guest users have full functionality, but nothing is persisted to their account (e.g., highscores are not saved across sessions).
- The current session state is stored in a global `AuthContext`.
  - Non-guest sessions are persisted in `sessionStorage` to survive reloads during the browser session.
  - Guest sessions are ephemeral.
- The header shows the current user name or “Guest”. Clicking it opens the user settings menu.
- Logout clears the session and returns the app to the session choice modal.

## Settings Menu (Header, top-right)
- The header only shows navigation and the user status on the right.
- Clicking the user status opens a menu with:
  - Theme switch (Dark/Light)
  - Language switch (DE/EN)
  - Logout (for authenticated users)
- Theme is persisted in `localStorage`.
- Language is persisted in `localStorage` and translations are loaded from `public/locales` with fallback.

## Wheel of Fortune (Glücksrad)
- Rebuilt using responsive SVG with `requestAnimationFrame` for smooth animation and precise winner alignment.
- Add/remove participants dynamically, with limits and reset.
- Confetti animation is rendered on a canvas overlay.
- Fully responsive; the wheel scales with its container.
- Located at route `/zufall/gluecksrad`.

## Persistence
- Theme: `localStorage` key `theme`.
- Language: `localStorage` key `language`.
- Authenticated User (non-guest): `sessionStorage` key `auth_user`.

## Architecture
- Global state via React Contexts:
  - `AuthContext` for session handling (login, signup, guest, logout)
  - `ThemeContext` for theme management
  - `LanguageContext` for i18n
- UI built using shadcn/ui components and Tailwind CSS.

## Development
- Install: `npm install`
- Run: `npm run dev`
- Build: `npm run build`
- Preview build: `npm run preview`

## Gamble Section
- New top-level navigation entry: `Gamble` (between `Games` and `Zufall`).
- Gamble Lobby at `/gamble` with:
  - Leaderboard of top players
  - Embedded games with tab switcher:
    - RiskPlay (formerly "Gamble Game")
    - Blackjack (simple AI dealer, Hit/Stand, bust and win conditions)
- Existing route `/spiele/gamble` remains and now renders the RiskPlay game page.

## Wheel of Fortune
- Reworked to a modern SVG-based spinner using `requestAnimationFrame` with dynamic participant management, accurate winner calculation, and confetti animation.
- Fully responsive and accessible.

## Settings & Persistence
- Language, theme and session remain unchanged. Settings persist in `localStorage` via existing contexts.

## Backend API and Database

A lightweight Express + SQLite backend is included to support authentication and leaderboards.

- Backend location: `server/`
- Database files and migrations: `database/`
- Local run:
  - Install frontend deps in project root: `npm install`
  - Install backend deps: `cd server && npm install`
  - Run DB migrations: `npm run migrate`
  - Start backend: `npm run dev` (port 3001)
  - Start frontend from project root: `npm run dev` (Vite proxies `/api`)

For deployment, ensure the backend is running and accessible under `/api` and run migrations during deploy. See `database/README.md` and `server/.env.example`.

# Nurvio Hub

This project contains a Vite + React frontend and an Express + SQLite backend.

## Development

- Copy environment example and set secrets:
  - `cp server/.env.example server/.env` (create one if not present)
  - Required env vars:
    - `JWT_SECRET=change_me`
    - `DATABASE_FILE=../database/app.db` (default)
    - Optional seeding vars: `ADMIN1_EMAIL`, `ADMIN1_PW`, `ADMIN2_EMAIL`, `ADMIN2_PW`

- Install and run:
  - Frontend: `npm install` then `npm run dev`
  - Backend: `cd server && npm install && npm run migrate && npm run dev`

## Database Migrations

SQL files live in `database/migrations/*.sql` and are applied by `server/src/migrate.js`.

- Apply migrations: `cd server && npm run migrate`

Tables:
- `users` (with `role`, `force_password_change`, lockout columns)
- `leaderboard` (game high scores)
- `blackjack_balance` (per-user chip balance; default 1000)
- `admin_audit` (admin action log)

## Seeding Admins (Secure)

Never commit plaintext passwords or `.env` with secrets.

- Preferred: set environment variables then run seed:
  - `cd server && ADMIN1_EMAIL=orange.admin@nurvio.de ADMIN1_PW=... ADMIN2_EMAIL=vez.admin@nurvio.de ADMIN2_PW=... npm run seed`
- Convenience (local only): create default admins by running:
  - `cd server && npm run seed -- --allow-default-admins`
  - This creates two admins with default passwords and sets `force_password_change`. Change their passwords immediately.

## Backend Endpoints

- Auth: `POST /api/register`, `POST /api/login`, `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- Leaderboards: `GET /api/leaderboard`, `GET /api/leaderboard/:game`, `POST /api/leaderboard` (auth)
- Health: `GET /api/health` → 200 `{ ok: true }` or 503 `{ error: "db_unavailable" }`
- Admin (JWT + role=admin required):
  - `POST /api/admin/leaderboard/set`
  - `POST /api/admin/leaderboard/remove`
  - `POST /api/admin/blackjack/set_balance`
  - `GET /api/admin/audit`

All admin mutations insert rows into `admin_audit`.

## Frontend

- Auth modal wires to `/api/login` and `/api/register`.
- Guest mode is the default; when DB is unavailable, a banner appears: "Score saving currently unavailable — you can still play as guest, scores will not be saved."
- Admins see an "Admin" badge next to their name and an `Admin Panel` link.
- Admin Panel allows:
  - Set/remove leaderboard entries
  - Set Blackjack balance
  - View audit log (read-only)

### Blackjack

- A Reset button restores the local balance and clears any temporary animations.
- Chips are DOM-managed per session and cleaned on unmount/navigation.

## Health and Degradation

- If DB is down, write endpoints return 503 `{ error: "db_unavailable" }`. Frontend shows a banner and continues in guest mode.
- Server keeps a small in-memory retry queue for score submissions (TTL ~5m). Note: queue is lost on server restart.

## Security Checklist

- `.env` is in `.gitignore`; DB file ignored by git
- `JWT_SECRET` only from `process.env`
- Cookies set with `HttpOnly; Secure; SameSite=Strict` where possible
- Passwords hashed with `bcrypt`
- Login rate limiting (5/min/IP) and lockout after repeated failures
- Admin endpoints require JWT + role `admin`

## Favicon

- Custom favicon placed at `public/favicon.ico`; the prior SVG icon reference was removed from `index.html` to avoid the heart icon.

## Build

- Frontend: `npm run build`
- Ensure no secrets are included in built assets.
