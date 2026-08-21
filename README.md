# UI (Frontend)

React 18 + Vite + Tailwind + React Router supplier portal.

## Run

```bash
cp .env.example .env
npm install
npm run dev            # http://localhost:5173
```

Vite proxies `/api` → `http://localhost:3001` in dev (or set `VITE_API_URL`).

## Environment

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Backend API base (default: proxied `/api`) |
| `VITE_MASTER_PORTAL_BASE_URL` | Master Portal base URL (login + db-route) |
| `VITE_SHOW_JSON` | Show request JSON on submit pages |
| `VITE_USE_DUMMY_DASHBOARD_DATA` | Use dummy dashboard data |

## Pages

- `/login` — Master Portal sign-in
- `/schedules` — delivery schedule board
- `/dashboard` — transaction metrics
- `/submit/asn`, `/submit/invoice`, `/submit/poack`, `/submit/scheduleack`
