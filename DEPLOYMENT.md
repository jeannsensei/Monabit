# Deployment

## Google Cloud Run

The app is deployed as **two separate Cloud Run services**:

| Service | Memory | CPU | Scaling |
|---------|--------|-----|---------|
| `monabit-api` (Express) | 512MiB | 1 | 0–5 instances |
| `monabit-web` (nginx + React) | 256MiB | 1 | 0–5 instances |

## CI/CD Pipeline (GitHub Actions)

```
PR Open:  lint → typecheck → test → ✓ (mergeable)
Main Push: lint → typecheck → test → build Docker → push → deploy → health check
```

## Deployment Steps (Manual)

1. Create a Google Cloud project and enable Cloud Run + Artifact Registry APIs
2. Create a service account with `roles/run.admin` and `roles/storage.admin`, download JSON key
3. Add to GitHub Secrets: `GCP_SA_KEY`, `GCP_PROJECT_ID`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
4. Push to `main` branch — deployment is automatic

## Configuring Google OAuth

1. In Google Cloud Console → APIs & Services → Credentials → Create OAuth 2.0 Client ID (Web)
2. Add `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback` as authorized redirect URI
3. Copy Client ID and Secret into Supabase Dashboard → Authentication → Providers → Google

## Environment Variables

### Backend (`api/.env`)

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | Environment (`development`, `production`, `test`) |
| `PORT` | Server port |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `DATABASE_URL` | PostgreSQL direct connection string (for Drizzle) |
| `COINGECKO_API_URL` | CoinGecko API base URL |
| `COINGECKO_API_KEY` | Free CoinGecko API key (get on their website) |
| `CORS_ORIGIN` | Frontend origin |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window |
| `RATE_LIMIT_MAX` | Max requests per window |
| `LOG_LEVEL` | Logging level |

### Frontend (`web/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `VITE_API_URL` | Backend API URL |
