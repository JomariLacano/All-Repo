# Project Request Management App

A complete project-request management web application for a freelance software developer, Jomari
Lacano. Potential clients can submit a project request without creating an account, track its status
at any time, and send follow-up reminders; the administrator reviews, manages, and tracks all requests
from a secure dashboard with a live notification center, and receives instant Telegram notifications for
every new submission and follow-up.

## Tech Stack

**Frontend:** React, Vite, TypeScript, Tailwind CSS, React Router, Axios, Recharts, Lucide React

**Backend:** Node.js, Express, TypeScript, JSON Web Token authentication (HTTP-only cookie), bcrypt,
dotenv, Telegram Bot API

**Storage:** Local JSON files on the backend only (no database). All reads/writes go through a reusable,
atomic JSON file storage service — the frontend never touches these files directly.

## Key Features

- **Public request submission** — no account required, with honeypot + rate-limit spam protection.
- **Public request tracking** (`/track-request`) — clients look up status using their reference number
  and email (both must match; the error message never reveals which field was wrong).
- **Client follow-ups ("pings")** — clients can send a reminder from the tracking page, subject to a
  server-enforced cooldown (default 24h, configurable via `PING_COOLDOWN_HOURS`). Each follow-up sends
  a Telegram notification and appears in the request's follow-up history.
- **Admin notification center** — a bell in the admin top bar with unread count, dropdown preview, and a
  full notifications page (filter, mark read/all read, delete, clear old).
- **Admin follow-up management** — a timeline of all pings per request, with per-ping Telegram retry,
  and table-level sorting/filtering by follow-up activity.

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
      utils/             Formatters, validators, status helpers, ordinal numbers
    .env.example
  server/               Express + TypeScript backend
    src/
      config/            Environment variable loading
      controllers/       Route handlers
      middleware/         Auth guard, rate limiting, validation, error handling
      routes/             Express routers
      services/           Business logic (requests, auth, telegram, dashboard, account, notifications)
      storage/            Reusable atomic JSON file storage service
      types/              Shared TypeScript types
      utils/              Logger, formatters, sanitizers, Zod schemas
    data/
      requests.json       (git-ignored, created automatically)
      admin.json           (git-ignored, created automatically)
      notifications.json   (git-ignored, created automatically)
      requests.example.json
      admin.example.json
      notifications.example.json
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
APP_TIMEZONE=Asia/Manila
PING_COOLDOWN_HOURS=24
```

- Generate a strong `JWT_SECRET`, e.g. `openssl rand -hex 64`.
- Create a Telegram bot via [@BotFather](https://t.me/BotFather) to get `TELEGRAM_BOT_TOKEN`.
- Message your bot once, then call `https://api.telegram.org/bot<token>/getUpdates` to find your
  `TELEGRAM_CHAT_ID`.
- `ADMIN_INITIAL_*` variables are only used to create the **first** admin account on the first server
  start (`server/data/admin.json`). After that file exists, these variables are ignored — update the
  account via the Account Settings page instead.
- `APP_TIMEZONE` is the IANA timezone (e.g. `Asia/Manila`) used to format dates/times shown to users
  and sent in Telegram messages. Timestamps are always stored in ISO UTC and only converted for display.
- `PING_COOLDOWN_HOURS` sets how long a client must wait between follow-up pings on the same request
  (default `24`). This is enforced on the backend regardless of what the frontend shows.

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
- Helmet, CORS (restricted to `CLIENT_URL` with credentials), and rate limiting (general API, login,
  public submission, request tracking, and follow-up/ping endpoints) are enabled by default.
- The public request form includes a honeypot field; bots that fill it in receive a fake success
  response without anything being persisted.
- The public tracking and follow-up endpoints require **both** the reference number and the email used
  at submission time to match (case-insensitively); a reference number alone is never sufficient. On a
  mismatch, both endpoints return the same generic error so an attacker cannot tell which field failed.
- The follow-up ("ping") cooldown is enforced entirely on the backend — the frontend only displays the
  next-allowed time it was told by the server; it never decides whether a ping is allowed.
- The server never logs the client's proposed amount or other sensitive request content — only safe,
  non-sensitive metadata (e.g. request IDs, HTTP status codes) is logged.

## JSON File Storage

All persistent data lives in `server/data/requests.json`, `server/data/admin.json`, and
`server/data/notifications.json`. These files are listed in `.gitignore` because they may contain
personal information; `requests.example.json`, `admin.example.json`, and `notifications.example.json`
are committed as structural references only.

The `JsonFileStore` service (`server/src/storage/JsonFileStore.ts`) provides:

- Automatic file (and directory) creation with sensible defaults on first run.
- A per-file mutex so concurrent requests can never interleave writes.
- Atomic writes: data is written to a `.tmp` file and then renamed over the target file.
- A rolling `.bak` backup of the previous good file before every write.
- Automatic recovery from the backup if the main file is found to be corrupted or unreadable.
- Schema validation before any write is committed.

## Telegram Notifications

The backend sends a formatted Telegram message to the configured chat whenever:

- A new project request is submitted.
- A client sends a follow-up ("ping") — the message includes the ping's ordinal number (1st, 2nd, 3rd,
  21st, …), the optional client message, and a summary of the previous ping for context.

If a Telegram API call fails (e.g. invalid token, network issue), the saved request or ping is **not**
lost — the server still returns a success response to the client, and the relevant notification status
is marked `failed` with a safe (non-sensitive) error summary. Admins can retry any failed notification —
including individual follow-up pings — from the request's detail view, and every send/retry attempt also
creates an entry in the admin notification center.

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
