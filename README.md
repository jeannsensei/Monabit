# Monabit — Crypto Dashboard

A full-stack cryptocurrency market dashboard built with React, Express, TypeScript, and Supabase. Deployed on Google Cloud Run.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui |
| State | Zustand (client), TanStack Query (server) |
| Charts | Recharts |
| Backend | Node.js, Express, TypeScript |
| Database | Supabase (PostgreSQL + Auth) |
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

# 4. Fill in web/.env
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...
# VITE_API_URL=http://localhost:8080/api

# 5. Run Supabase migrations
supabase db push

# 6. Install dependencies
make install

# 7. Start both services
make dev
```

The API runs on `http://localhost:8080`, the frontend on `http://localhost:5173`.

## Environment Variables

### Backend (`api/.env.example`)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `8080` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anon key | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) | `eyJ...` |
| `COINGECKO_API_URL` | CoinGecko API base | `https://api.coingecko.com/api/v3` |
| `COINGECKO_API_KEY` | Optional — for higher rate limits | `CG-...` |
| `CORS_ORIGIN` | Frontend origin | `http://localhost:5173` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `LOG_LEVEL` | Logging level | `info` |

### Frontend (`web/.env.example`)

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `VITE_API_URL` | Backend API URL |

## Architecture

### High-Level

```
Browser → Cloud Run Frontend (nginx + React SPA)
              │
              ▼
         Cloud Run Backend (Express + TypeScript)
              │
         ┌────┴────┐
         ▼         ▼
     Supabase    CoinGecko
   (Auth + DB)    (Crypto Data)
```

### Backend Layers

Every request flows through: **Routes → Controllers → Services → Repositories → Supabase**.

- **Routes**: Define endpoints and middleware chains. No logic.
- **Controllers**: Handle HTTP concerns (parsing, status codes). No business logic.
- **Services**: Business logic and orchestration (cache check → API call → transform → store).
- **Repositories**: Data access layer. Encapsulates Supabase queries.
- **Middlewares**: Cross-cutting concerns (auth, validation, rate limiting, idempotency).

This separation means services are testable without HTTP mocking, and switching databases only touches repositories.

### Frontend State Management

- **TanStack Query**: All server state (crypto data, user lists, favorites). Automatic caching, background refetch, stale-while-revalidate.
- **Zustand**: Client-only UI state (theme, sidebar toggle). Persisted to localStorage.
- **React Router v6**: SPA routing with auth guards and role-based access control.

## Database Model

### Tables

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `profiles` | Extends Supabase `auth.users` with display name, role, preferences | 1:1 with `auth.users` |
| `favorites` | User's bookmarked cryptocurrencies | N:1 to `profiles` |
| `price_alerts` | Price threshold alerts per user | N:1 to `profiles` |
| `audit_logs` | Admin action tracking (who did what) | N:1 to `profiles` |

### Design Decisions

- `profiles` is separate from `auth.users` for separation of concerns: Supabase handles auth, we handle application data.
- `role` is a CHECK-constrained TEXT field (`'admin'` or `'user'`), avoiding an enum for flexibility.
- `audit_logs` stores old/new values as JSONB for rich change tracking.
- Row Level Security (RLS) policies enforce access at the database level: users can only read their own data, admins can read everything.

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register with email/password |
| POST | `/api/auth/login` | No | Login (returns JWT) |
| POST | `/api/auth/google` | No | Google OAuth login |
| POST | `/api/auth/logout` | Yes | Invalidate session |
| GET | `/api/auth/me` | Yes | Get current user profile |

### Cryptocurrency

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/crypto/top10` | Yes | Top 10 coins by market cap (cached 60s) |
| GET | `/api/crypto/market-overview` | Yes | Global KPIs (total mcap, volume, dominance) |
| GET | `/api/crypto/:coinId` | Yes | Single coin detail |
| GET | `/api/crypto/:coinId/history` | Yes | Price history for charts |
| GET | `/api/crypto/search?q=` | Yes | Search coins |

### Admin (role: admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users (paginated) |
| GET | `/api/admin/users/:id` | Get single user |
| POST | `/api/admin/users` | Create user |
| PUT | `/api/admin/users/:id` | Update user (role, active status) |
| DELETE | `/api/admin/users/:id` | Soft-delete (deactivate) |

### Profile & Favorites

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get own profile |
| PUT | `/api/profile` | Update profile |
| GET | `/api/favorites` | List favorites |
| POST | `/api/favorites` | Add to favorites |
| DELETE | `/api/favorites/:coinId` | Remove favorite |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check (DB, cache status) |

## CoinGecko Integration

I chose **CoinGecko** because its free tier requires no API key and provides comprehensive market data (top coins, global KPIs, historical charts, search) via a RESTful API.

### Caching Strategy

To avoid hitting CoinGecko's rate limits (10-30 req/min on free tier):

- **In-memory TTL cache** (`node-cache`): 60s for market data, 120s for global data, 300s for historical data.
- **Background scheduler** (`node-cron`): Pre-fetches top 10 and global data every 55 seconds.
- **Result**: At most 1.09 CoinGecko calls per minute. 99% of user requests hit the cache.

### Reliability

- **Exponential backoff retry**: 3 attempts with increasing delay on 429/5xx errors.
- **Graceful degradation**: If CoinGecko is down, stale cached data is returned with a warning.
- **Scheduler isolation**: Cache refresh failures don't affect user requests.

## Authentication & Security

### Authentication Flow

1. User registers or logs in via email/password (or Google OAuth).
2. Supabase Auth validates credentials and returns a JWT.
3. JWT is stored in `localStorage` and sent as `Authorization: Bearer <token>` on every API request.
4. Backend `auth.middleware.ts` validates the JWT with Supabase and attaches the user profile to `req.user`.
5. `admin.middleware.ts` checks `req.user.role === 'admin'` for admin-only routes.

### Security Measures

| Layer | Implementation |
|-------|---------------|
| **Authentication** | Supabase JWT, 1-hour expiry, refresh tokens |
| **Authorization** | Role-based (admin/user), enforced at middleware and RLS |
| **Row Level Security** | PostgreSQL RLS policies prevent unauthorized data access at DB level |
| **Input validation** | Zod schemas on all request bodies, queries, and params |
| **Rate limiting** | Auth: 10 req/15min per IP. General: 100 req/15min per IP. |
| **HTTP headers** | Helmet (CSP, X-Frame-Options, HSTS, etc.) |
| **CORS** | Whitelist frontend origin only |
| **Idempotency** | `X-Idempotency-Key` header prevents duplicate mutations |
| **Secrets** | `.env` in `.gitignore`, `.env.example` with placeholders |
| **Dependencies** | `npm audit` in CI pipeline |

## Deployment

### Google Cloud Run

The app is deployed as **two separate Cloud Run services**:

| Service | Memory | CPU | Scaling |
|---------|--------|-----|---------|
| `monabit-api` (Express) | 512MiB | 1 | 0–5 instances |
| `monabit-web` (nginx + React) | 256MiB | 1 | 0–5 instances |

### CI/CD Pipeline (GitHub Actions)

```
PR Open:  lint → typecheck → test → ✓ (mergeable)
Main Push: lint → typecheck → test → build Docker → push → deploy → health check
```

### Deployment Steps (Manual)

1. Create a Google Cloud project and enable Cloud Run + Artifact Registry APIs
2. Create a service account with `roles/run.admin` and `roles/storage.admin`, download JSON key
3. Add to GitHub Secrets: `GCP_SA_KEY`, `GCP_PROJECT_ID`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
4. Push to `main` branch — deployment is automatic

### Configuring Google OAuth

1. In Google Cloud Console → APIs & Services → Credentials → Create OAuth 2.0 Client ID (Web)
2. Add `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback` as authorized redirect URI
3. Copy Client ID and Secret into Supabase Dashboard → Authentication → Providers → Google

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

## Known Limitations

- **CoinGecko free tier**: Rate-limited to ~10-30 req/min. Mitigated by aggressive caching but will throttle under high concurrent usage with cold caches.
- **In-memory cache**: Cache is lost on instance restart. Acceptable for 60s TTL; Redis would be needed for multi-instance deployments.
- **Cloud Run cold starts**: ~2s delay when scaling from 0. Mitigated by `min-instances: 1` if needed (~$40/month).
- **No WebSocket real-time updates**: Dashboard polls every 60s. Sufficient for most use cases but not truly real-time.
- **JWT in localStorage**: Susceptible to XSS (mitigated by CSP + React escaping). BFF pattern would be needed for HttpOnly cookie sessions in production.

## Future Improvements

- Redis for shared caching across multiple Cloud Run instances
- WebSocket integration for real-time price updates (Binance WebSocket or Supabase Realtime)
- End-to-end tests with Playwright
- Email notifications for price alerts
- OpenAPI/Swagger documentation generated from Zod schemas
- Feature flags for controlled rollouts
- Error tracking with Sentry

## License

This project was built as a technical challenge.
