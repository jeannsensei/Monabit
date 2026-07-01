# Monabit — Architecture (English)

## High-Level

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

Two separate Cloud Run services:
- **Frontend** (`monabit-web`): nginx serving React SPA, 256MiB RAM, scales 0–5
- **Backend** (`monabit-api`): Express, 512MiB RAM, scales 0–5

## Backend Architecture — Layered

```
Request → Routes → Controllers → Services → Repositories → Supabase / CoinGecko
```

| Layer | Responsibility | Contains |
|-------|---------------|----------|
| **Routes** | HTTP method + path mapping, middleware chain | `routes/*.routes.ts` |
| **Controllers** | Parse request, call service, format response | `controllers/*.controller.ts` |
| **Services** | Business logic, orchestration, caching logic | `services/*.service.ts` |
| **Repositories** | Data access (Drizzle ORM queries) | `repositories/index.ts` |
| **Middlewares** | Cross-cutting: auth, validation, rate limit, idempotency | `middlewares/*.middleware.ts` |

### Why Four Layers?

- **Testability**: Services can be unit-tested by mocking repositories. Controllers can be tested without HTTP (they receive plain objects).
- **Maintainability**: Switching from Supabase to raw PostgreSQL only touches repositories — services don't change.
- **Separation of concerns**: Each layer has one reason to change. Controllers don't contain business logic. Services don't touch `req`/`res`.

### File Map

```
api/src/
├── config/          env.ts (Zod-validated env vars), supabase.ts
├── middlewares/     auth, admin, error, validate, rate-limit, idempotency, request-id
├── routes/          auth, crypto, admin, profile, favorites, alerts
├── controllers/     auth, crypto, admin, profile, favorites, alerts
├── services/        auth, crypto, coingecko, user, favorites, alert, cache
├── repositories/    user, favorites, audit (Drizzle queries)
├── utils/           logger (Pino), errors (AppError), retry, scheduler, async-handler
├── db/              index.ts (Drizzle client), schema.ts (Drizzle schema)
├── app.ts           Express app setup, middleware pipeline, health endpoint
└── index.ts         Server entry point
```

## Frontend Architecture

### State Management — Two Tools, Two Concerns

| State Type | Tool | Why | Example Data |
|-----------|------|-----|-------------|
| **Server state** | TanStack Query | Automatic caching, background refetch, stale-while-revalidate, deduplication, retry | Crypto prices, users list, favorites, alerts |
| **Client state** | Zustand | Minimal boilerplate, localStorage persistence, selector-based re-renders | Theme (dark/light), sidebar open/closed |

### Folder Structure

```
web/src/
├── components/
│   ├── ui/          shadcn/ui primitives (button, card, table, modal, select, tooltip)
│   ├── layout/      AppLayout, Sidebar, Header, ProtectedRoute, AdminRoute
│   ├── auth/        LoginForm, RegisterForm, GoogleButton
│   ├── crypto/      CryptoTable, KPICards, PriceChart, CoinSearch, CoinDetailBar
│   └── users/       (none — admin form is inline in the page)
├── pages/           LoginPage, RegisterPage, DashboardPage, FavoritesPage,
│                    AlertsPage, AdminUsersPage, ProfilePage, NotFoundPage,
│                    AuthCallbackPage, ForgotPasswordPage, ResetPasswordPage
├── hooks/           useAuth, useCrypto, useUsers, useFavorites, useAlerts, useAlertNotifications
├── stores/          app.store.ts (Zustand), auth.store.ts (Zustand)
├── services/        api.ts (axios), supabase.ts (Supabase client)
├── providers/       ThemeProvider (no longer has AuthProvider — it's in Zustand)
├── lib/             utils.ts (formatting), constants.ts
├── types/           shared TypeScript interfaces
└── i18n/            i18n config + en.json + es.json
```

### Component Tree

```
<App>
  <ErrorBoundary>
    <Suspense>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/forgot" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            <Route element={<AdminRoute />}>
              <Route path="/admin/users" element={<AdminUsersPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Suspense>
  </ErrorBoundary>
</App>
```

### Why TanStack Query + Zustand Together?

Most React apps make the mistake of putting ALL state in one global store (Redux, Context). This creates problems:
- Server data gets stale (no auto-refetch)
- Mutations need manual cache management
- Every state change re-renders unrelated components

**TanStack Query handles server state automatically:**
- Caches API responses with configurable TTLs
- Deduplicates concurrent requests (two components asking for the same data = one API call)
- Refetches on window focus, interval, or manual trigger
- Supports optimistic updates with rollback

**Zustand handles only client-only UI state:**
- Theme (persisted to localStorage via `persist` middleware)
- Sidebar open/closed state
- ~10 lines of code, no Provider wrapper needed

## Database Model

### Schema

```sql
auth.users (built-in Supabase)
    │  1:1 (trigger on signup)
    ▼
profiles
    │  extends auth.users with username, full_name, role, preferences
    │
    ├── 1:N ──▶ favorites      (coin_id, coin_symbol, coin_name)
    ├── 1:N ──▶ price_alerts   (target_price, direction, is_triggered)
    └── 1:N ──▶ audit_logs    (action, resource, details JSONB)
```

### Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `profiles` | Application user data | id (FK→auth.users), role (admin/user), is_active, preferences (JSONB) |
| `favorites` | Bookmarked coins | user_id (FK), coin_id, coin_symbol, coin_name |
| `price_alerts` | Price threshold alerts | user_id (FK), target_price, direction (above/below), is_triggered |
| `audit_logs` | Admin action audit trail | user_id (FK), action, resource, details (JSONB), ip_address |

### Design Decisions

- **profiles separate from auth.users**: Supabase handles passwords, email confirmations, and token management. We handle display names, roles, and preferences. Changes to each happen at different rates.
- **role as TEXT with CHECK constraint**: Simpler than a PostgreSQL ENUM. More flexible for future roles.
- **audit_logs with JSONB**: The `details` column stores old/new values as a JSON diff — human-readable and queryable.
- **Row Level Security (RLS)**: Every table has RLS policies. Users can only read/write their own data. Admins can read everything. Even if the backend has a bug, the database enforces access control.

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register email/password |
| POST | `/api/auth/login` | No | Login, returns JWT |
| POST | `/api/auth/google` | No | Google OAuth |
| POST | `/api/auth/logout` | Yes | Invalidate session |
| POST | `/api/auth/refresh` | No | Refresh expired JWT |
| GET | `/api/auth/me` | Yes | Current user profile |

### Cryptocurrency

| Method | Endpoint | Auth | Cache | Description |
|--------|----------|------|-------|-------------|
| GET | `/api/crypto/top10` | Yes | 60s | Top 10 by market cap |
| GET | `/api/crypto/market-overview` | Yes | 120s | Global KPIs |
| GET | `/api/crypto/by-ids?ids=a,b` | Yes | 60s | Bulk coin data by IDs |
| GET | `/api/crypto/:coinId` | Yes | 60s | Single coin detail |
| GET | `/api/crypto/:coinId/history` | Yes | 300s | Price history for charts |
| GET | `/api/crypto/search?q=` | Yes | 120s | Coin search |

### Admin (role: admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List users (paginated) |
| GET | `/api/admin/users/:id` | Get single user |
| POST | `/api/admin/users` | Create user |
| PUT | `/api/admin/users/:id` | Update user (role, status) |
| POST | `/api/admin/users/:id/reset-password` | Admin reset password |
| DELETE | `/api/admin/users/:id` | Soft-delete (deactivate) |

### Profile & Favorites

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get own profile |
| PUT | `/api/profile` | Update own profile |
| GET | `/api/favorites` | List favorites |
| POST | `/api/favorites` | Add favorite |
| DELETE | `/api/favorites/:coinId` | Remove favorite |

### Price Alerts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts` | List alerts |
| POST | `/api/alerts` | Create alert |
| PUT | `/api/alerts/:id` | Update alert (resets triggered) |
| DELETE | `/api/alerts/:id` | Remove alert |
| POST | `/api/alerts/check` | Check prices, trigger/rearm alerts |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check (DB, cache, uptime) |

## CoinGecko Integration

**Provider**: CoinGecko (free tier, requires free API key)

**Endpoints used**: `/coins/markets`, `/global`, `/coins/{id}`, `/coins/{id}/market_chart`, `/search`

**Stability mechanisms**:

| Mechanism | Implementation |
|-----------|---------------|
| Cache | `node-cache` in-memory, 60s TTL for market data, 120s global, 300s history |
| Pre-fetch | `node-cron` refreshes cache every 55 seconds |
| Retry | Exponential backoff, 3 attempts (2s → 4s → 8s) on 429/5xx |
| Circuit breaker | After 5 consecutive failures, stops calling CoinGecko for 30s |
| Fallback | Stale cached data returned if CoinGecko is down |

**Result**: At most 1.09 calls/minute to CoinGecko. 99% of user requests hit the cache.

**Files**: `coingecko.service.ts` (HTTP client + retry), `crypto.service.ts` (cache-first logic), `cache.service.ts` (generic wrapper), `scheduler.ts` (node-cron)

## Authentication & Security

### Authentication Flow

1. User registers or logs in via email/password or Google OAuth
2. Supabase Auth validates credentials, returns JWT (1h expiry) + refresh token
3. JWT stored in `localStorage`, sent as `Authorization: Bearer <token>` on every API request
4. Backend `auth.middleware.ts` validates JWT with Supabase on every request, attaches `req.user`
5. Token refresh via axios interceptor when backend returns 401

### Security Layers

| Layer | What It Does |
|-------|-------------|
| **Helmet** | Sets 15+ HTTP security headers (CSP, HSTS, X-Frame-Options) |
| **CORS** | Only the frontend origin is allowed |
| **Rate limiting** | 100 req/15min general, 10 req/15min for auth endpoints |
| **JWT validation** | Every protected route validates the token with Supabase |
| **Role-based access** | `adminMiddleware` checks `req.user.role === 'admin'` |
| **Row Level Security** | PostgreSQL RLS — defense in depth beyond app code |
| **Input validation** | Zod schemas on all request body, query, and params |
| **Idempotency** | `X-Idempotency-Key` header on all mutations prevents duplicates |
| **CSRF** | JWT in Authorization header (not cookie) — immune to CSRF by design |
| **XSS** | React escaping + Content Security Policy |
| **Secrets** | `.env` in `.gitignore`, `.env.example` with placeholders. Real values injected via Cloud Run |

## Key Technology Decisions

| Decision | Choice | Why Not the Alternative |
|----------|--------|------------------------|
| ORM | **Drizzle** | Prisma requires dual schema management (Prisma + Supabase), heavier, needs `prisma generate` step |
| Database | **Supabase** | Firestore is NoSQL (bad for relational data). Supabase gives Auth + DB + RLS in one product |
| Backend framework | **Express** | NestJS adds boilerplate (modules, decorators, DI) without proportional benefit for this scope |
| State management | **Zustand + TanStack Query** | Redux for 2 pieces of UI state is overkill. TanStack Query handles all server state automatically |
| Styling | **Tailwind + shadcn/ui** | MUI is heavy, opinionated. shadcn/ui is copy-paste — you own the code |
| Charts | **Recharts** | D3 is too low-level. Chart.js is not React-native. Recharts is composable + lightweight |
| HTTP | **Axios** | Response interceptor with 401 queuing + retry is hard to replicate with raw fetch |
| Validation | **Zod** | Joi is heavier. Yup has weaker TypeScript inference. Zod infers types from schemas automatically |

## Known Limitations

| Limitation | Impact | Mitigation |
|-----------|--------|------------|
| CoinGecko free tier | 10-30 req/min limit | 60s cache + 55s prefetch = 1.09 req/min |
| In-memory cache | Lost on restart | Acceptable for 60s TTL. Redis if multi-instance |
| Cloud Run cold starts | ~2s when scaling from 0 | `--min-instances 1` adds ~$40/month |
| No WebSocket | Data polls every 60s | Sufficient for a dashboard. Not real-time |
| JWT in localStorage | XSS risk (mitigated) | CSP + React escaping. BFF pattern for production |

## Future Improvements

- Redis for shared caching across instances
- WebSocket for real-time price updates
- End-to-end tests with Playwright
- Email notifications for price alerts
- OpenAPI/Swagger from Zod schemas
- Feature flags for controlled rollouts
- Error tracking with Sentry
