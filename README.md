# UI (Frontend)

React 18 + Vite + Tailwind + React Router supplier portal.

## Run

```bash
cp .env.example .env   # fill VITE_SUPABASE_* keys
npm install
npm run dev            # http://localhost:5173
```

Vite proxies `/api` → `http://localhost:3001` in dev (or set `VITE_API_URL`).

## Environment

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (auth) |
| `VITE_API_URL` | Backend API base (default: proxied `/api`) |
| `VITE_SHOW_JSON` | Show request JSON on submit pages |
| `VITE_USE_DUMMY_DASHBOARD_DATA` | Use dummy dashboard data |

## Pages

- `/login` — Supabase sign-in
- `/schedules` — delivery schedule board
- `/dashboard` — transaction metrics
- `/submit/asn`, `/submit/invoice`, `/submit/poack`, `/submit/scheduleack`
- `/settings`, `/profile`, `/labels`, `/edifact`
