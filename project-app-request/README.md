# Project Request Management App

A complete project-request management web application for a freelance software developer. Potential
clients can submit a project request without creating an account; the administrator reviews, manages,
and tracks all requests from a secure dashboard, and receives instant Telegram notifications for every
new submission.

## Tech Stack

**Frontend:** React, Vite, TypeScript, Tailwind CSS, React Router, Axios, Recharts, Lucide React

**Backend:** Node.js, Express, TypeScript, JSON Web Token authentication (HTTP-only cookie), bcrypt,
dotenv, Telegram Bot API

**Storage:** Local JSON files on the backend only (no database). All reads/writes go through a reusable,
atomic JSON file storage service — the frontend never touches these files directly.

## Project Structure

```
project-request-app/
  client/               React + Vite + TypeScript frontend
    src/
      api/              Axios client + typed API modules
      components/       Shared UI, public, and admin components
      hooks/             Auth, toast, dark mode, debounce hooks/contexts
      layouts/           Public and admin page layouts
      pages/             Public and admin pages
      routes/            ProtectedRoute guard
      types/             Shared TypeScript types
      utils/             Formatters, validators, status helpers
    .env.example
  server/               Express + TypeScript backend
    src/
      config/            Environment variable loading
      controllers/       Route handlers
      middleware/         Auth guard, rate limiting, validation, error handling
      routes/             Express routers
      services/           Business logic (requests, auth, telegram, dashboard, account)
      storage/            Reusable atomic JSON file storage service
      types/              Shared TypeScript types
      utils/              Logger, formatters, sanitizers, Zod schemas
    data/
      requests.json       (git-ignored, created automatically)
      admin.json           (git-ignored, created automatically)
      requests.example.json
      admin.example.json
    .env.example
  package.json           Root scripts to run both apps together
  .gitignore
  README.md
```

## Getting Started

### 1. Install dependencies

```bash
npm install
npm run install:all
```

### 2. Configure environment variables

Copy the example env files and fill in real values:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env`:

```
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=replace_with_a_long_random_secret
TELEGRAM_BOT_TOKEN=replace_with_your_bot_token
TELEGRAM_CHAT_ID=replace_with_your_chat_id
ADMIN_INITIAL_NAME=Jomari Lacano
ADMIN_INITIAL_EMAIL=admin@example.com
ADMIN_INITIAL_PASSWORD=replace_with_a_strong_password
```

- Generate a strong `JWT_SECRET`, e.g. `openssl rand -hex 64`.
- Create a Telegram bot via [@BotFather](https://t.me/BotFather) to get `TELEGRAM_BOT_TOKEN`.
- Message your bot once, then call `https://api.telegram.org/bot<token>/getUpdates` to find your
  `TELEGRAM_CHAT_ID`.
- `ADMIN_INITIAL_*` variables are only used to create the **first** admin account on the first server
  start (`server/data/admin.json`). After that file exists, these variables are ignored — update the
  account via the Account Settings page instead.

### 3. Run in development

```bash
npm run dev
```

This starts the backend (port 5000) and frontend (port 5173) concurrently.

- Public site: http://localhost:5173
- Admin login: http://localhost:5173/admin/login

### 4. Build for production

```bash
npm run build
npm run start
```

`npm run start` runs the compiled backend only. Serve the built frontend (`client/dist`) with any static
file host, or extend `server/src/app.ts` to serve it directly.

## Security Notes

- The Telegram bot token, JWT secret, and admin password are **only** read on the backend from
  `server/.env`. They are never sent to, or embedded in, the React build.
- Admin sessions use a short-lived JWT stored in a secure, HTTP-only cookie — never in
  `localStorage`/`sessionStorage`, so it cannot be read by client-side JavaScript.
- Passwords are hashed with bcrypt (12 salt rounds); plain-text passwords are never stored or logged.
- All `/api/admin/*` routes require a valid session (`requireAuth` middleware).
- Input is validated and sanitized with Zod schemas on every write endpoint.
- Helmet, CORS (restricted to `CLIENT_URL` with credentials), and rate limiting (general API, login, and
  public submission endpoints) are enabled by default.
- The public request form includes a honeypot field; bots that fill it in receive a fake success
  response without anything being persisted.
- The server never logs the client's proposed amount or other sensitive request content — only safe,
  non-sensitive metadata (e.g. request IDs, HTTP status codes) is logged.

## JSON File Storage

All persistent data lives in `server/data/requests.json` and `server/data/admin.json`. These files are
listed in `.gitignore` because they may contain personal information; `requests.example.json` and
`admin.example.json` are committed as structural references only.

The `JsonFileStore` service (`server/src/storage/JsonFileStore.ts`) provides:

- Automatic file (and directory) creation with sensible defaults on first run.
- A per-file mutex so concurrent requests can never interleave writes.
- Atomic writes: data is written to a `.tmp` file and then renamed over the target file.
- A rolling `.bak` backup of the previous good file before every write.
- Automatic recovery from the backup if the main file is found to be corrupted or unreadable.
- Schema validation before any write is committed.

## Telegram Notifications

After a request is saved, the backend sends a formatted message to the configured Telegram chat. If the
Telegram API call fails (e.g. invalid token, network issue), the saved request is **not** lost — the
server still returns a success response to the client, and the request's `notificationStatus` is marked
`failed` with a safe (non-sensitive) error summary. Admins can retry the notification at any time from
the request's detail view.

## Deployment Warning — JSON File Storage Limitations

This application intentionally avoids a database to keep setup simple, but that comes with real
constraints you must understand before deploying to production:

- **Single-server only.** JSON file storage is only safe when exactly **one** backend process has access
  to `server/data/*.json` at a time. Running multiple instances/replicas against the same files (e.g.
  behind a load balancer, in a container orchestrator with multiple replicas, or serverless functions
  with concurrent cold starts) **will** cause data loss or corruption, because each instance has no
  knowledge of writes made by the others.
- **Not suitable for serverless/stateless hosting.** Platforms like Vercel Functions, AWS Lambda, or
  similar stateless compute do not guarantee a persistent, writable local filesystem between
  invocations — your data will disappear.
- **Some free hosting tiers wipe local storage.** Many free-tier PaaS platforms (e.g. ephemeral
  filesystems on some Heroku/Render/Railway free plans) erase local files on every restart, redeploy, or
  after periods of inactivity. Verify your host provides a **persistent volume** mounted at
  `server/data` before relying on this in production.
- **Use hosting with a persistent disk/volume.** A traditional VPS, a single always-on container with an
  attached persistent volume, or a managed VM are appropriate choices.
- **Growth path.** As request volume grows, or if you need multiple backend instances for reliability,
  migrate the storage layer (`server/src/storage`) to PostgreSQL or another proper database. The service
  layer (`server/src/services`) already isolates all data access behind small, focused functions to make
  that migration straightforward.

## Available Scripts (root)

| Script | Description |
| --- | --- |
| `npm run install:all` | Installs dependencies for both `client` and `server`. |
| `npm run dev` | Runs both frontend and backend in development mode concurrently. |
| `npm run build` | Builds both the backend and frontend for production. |
| `npm run start` | Starts the compiled backend (serves the API only). |

## License

This project is provided as-is for the freelance developer's own use.
