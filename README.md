# Monabit — Crypto Dashboard

A full-stack cryptocurrency market dashboard built with React, Express, TypeScript, and Supabase. Deployed on Google Cloud Run.

- **Frontend:** https://monabit-web-133087156906.us-central1.run.app
- **Backend:**  https://monabit-api-133087156906.us-central1.run.app

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui |
| State | Zustand (client), TanStack Query (server) |
| Charts | Recharts |
| Backend | Node.js, Express, TypeScript |
| Database | Supabase (PostgreSQL + Auth) + Drizzle ORM |
| External API | CoinGecko (free tier) |
| Deployment | Google Cloud Run, Docker, GitHub Actions |
| Testing | Vitest |

## Quick Start (Local)

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project

### Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd monabit

# 2. Copy environment files
cp api/.env.example api/.env
cp web/.env.example web/.env

# 3. Fill in api/.env with your Supabase credentials
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=eyJ...
# SUPABASE_SERVICE_ROLE_KEY=eyJ...
# DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
# COINGECKO_API_KEY=CG-...

# 4. Fill in web/.env
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...
# VITE_API_URL=http://localhost:8080/api

# 5. Install dependencies
make install

# 6. Run database migrations
cd api && npm run db:migrate

# 7. Start both services
make dev
```

The API runs on `http://localhost:8080`, the frontend on `http://localhost:5173`.

## Environment Variables

### Backend

See `api/.env.example` and `api/api-env.yaml.example` for all variables.

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server only) |
| `DATABASE_URL` | Yes | PostgreSQL connection string (for Drizzle) |
| `COINGECKO_API_KEY` | No | Free CoinGecko API key |
| `CORS_ORIGIN` | No | Frontend origin (default: `http://localhost:5173`) |
| `NODE_ENV` | No | `development` / `production` / `test` |
| `PORT` | No | Server port (default: 8080) |
| `LOG_LEVEL` | No | `info` / `debug` / `trace` / `warn` / `error` |

### Frontend

See `web/.env.example`.

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `VITE_API_URL` | Yes | Backend API URL |

## Architecture

See [`README_ARCHITECTURE-EN.md`](./README_ARCHITECTURE-EN.md) for the full architecture documentation covering backend layers, frontend state management, database model, API endpoints, CoinGecko integration, security, and technology decisions.

## Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for Google Cloud Run deployment instructions.

### Deploy Scripts

```bash
# 1. Create env files with real values
cp api/api-env.yaml.example api/api-env.yaml
cp web/web-env.yaml.example web/web-env.yaml
# Edit both files with your credentials

# 2. Deploy both services
./gcloud-deploy.sh

# Or individually:
cd api && ./gcloud-deploy.sh
cd web && ./gcloud-deploy.sh
```

The deploy scripts automatically find the gcloud SDK and reference `api-env.yaml` / `web-env.yaml` (both in `.gitignore`) to pass environment variables at deploy time without hardcoding secrets.

## AI Tools Usage

### Tools Used

- **Claude (via OpenCode)**: AI pair programmer throughout development.

### How I Used AI

| Area | AI's Role | My Role |
|------|-----------|---------|
| Architecture planning | Proposed patterns (layers, state split, caching) | Reviewed, challenged tradeoffs, made final decisions |
| Boilerplate generation | Generated configs, Dockerfiles, CI/CD YAML | Verified correctness, adjusted for production |
| Code implementation | Wrote code following my architectural direction | Reviewed every file, modified to match conventions |
| Documentation | Helped structure README, ADRs, and narrative | Provided technical decisions and final review |

### What I Learned / Limitations

- **Over-engineering bias**: The AI often suggested tools appropriate for large teams (Redis, Turborepo, Prisma) that added complexity without proportional value. I pushed back toward simplicity.
- **Vigilance required**: AI-generated code covered "happy paths" well but missed edge cases, error handling, and security concerns. I added rate limiting, idempotency, input validation, and RLS policies myself.
- **Context management**: For multi-hour sessions, the AI sometimes lost track of earlier decisions. I maintained the architectural vision and re-established context when needed.
- **Reusability**: The AI initially duplicated patterns (inline confirm dialogs, form components, search logic) instead of creating reusable abstractions. I had to explicitly request shared components like `ConfirmDialog`, `Modal`, and `Tooltip` to reduce code duplication and improve maintainability.

## Known Limitations

- **CoinGecko free tier**: Rate-limited to ~10-30 req/min. Mitigated by aggressive caching but will throttle under high concurrent usage with cold caches.
- **In-memory cache**: Cache is lost on instance restart. Acceptable for 60s TTL; Redis would be needed for multi-instance deployments.
- **Cloud Run cold starts**: ~2s delay when scaling from 0. Mitigated by `min-instances: 1` if needed (~$40/month).
- **No WebSocket real-time updates**: Dashboard polls every 60s. Sufficient for most use cases but not truly real-time.
- **JWT in localStorage**: Susceptible to XSS (mitigated by CSP + React escaping). BBF pattern would be needed for HttpOnly cookie sessions in production.

## License

This project was built as a technical challenge.

