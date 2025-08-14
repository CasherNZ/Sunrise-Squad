# Sunrise Squad — Cloudflare Pages + Functions Port

This folder contains a ready-to-deploy port of your app to Cloudflare.
- **Frontend:** Vite build served by Pages
- **API:** Cloudflare **Pages Functions** (Hono), in `functions/`
- **DB:** Postgres (Neon) via `@neondatabase/serverless` **HTTP driver** + `drizzle-orm/neon-http`
- **Auth:** Signed cookie (HMAC) stored as `ss_sess` (replaces express-session)
- **Cron:** separate Worker in `cron-worker/` for daily resets (use Cloudflare Cron Triggers)

## Quick start

```bash
# From repo root
npm i
npm run build
npm run preview
# Or deploy
npm run deploy
```

### Environment variables (Pages → Project → Settings → Environment Variables)
- `DATABASE_URL`  (Neon Postgres connection string)
- `SESSION_SECRET` (random long string)
- `APP_URL` (optional base URL used in emails)

### Dev
```
npm run dev
```

### Routes covered
- Auth: `/api/register`, `/api/login`, `/api/logout`, `/api/auth/user`
- Settings: `/api/settings`, `/api/settings/verify-pin`
- Children: `/api/children`
- Tasks: `/api/tasks`, `/api/tasks/:id`, `/api/tasks/child/:childId`, `/api/tasks/reorder`
- Completions: `/api/task-completions`, `/api/task-completions/date`
- Points history: `/api/points-history`
- Prizes: `/api/prizes`, `/api/redeem-prize`
- Pets: `/api/pets`
- Helpers: `/api/greeting`, `/api/current-time-type`, `/api/reset`

> **Note:** Password reset endpoints are stubbed. If needed, I can wire SendGrid via fetch on Workers.

### What changed from Express
- Replaced `express-session` + Passport with a small, **HMAC-signed cookie**.
- DB client switched from `neon-serverless` Pool to **neon-http** (Workers-safe).
- Routes converted to Hono inside `functions/api/[[catchall]].ts`.

### Cron Worker
Edit `cron-worker/wrangler.toml` and set `DATABASE_URL`, then:
```
cd cron-worker
npm i
npm run deploy
```

---

If you hit anything odd (e.g., hashing mismatch with old users), I can migrate stored password hashes to the same scrypt format used here (`scrypt-js`).

