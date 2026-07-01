# Monabit — Arquitectura (Español)

## Diagrama de Alto Nivel

```
Navegador → Cloud Run Frontend (nginx + React SPA)
                │
                ▼
           Cloud Run Backend (Express + TypeScript)
                │
           ┌────┴────┐
           ▼         ▼
       Supabase    CoinGecko
     (Auth + DB)    (Datos Cripto)
```

Dos servicios separados en Cloud Run:
- **Frontend** (`monabit-web`): nginx sirviendo React SPA, 256MiB RAM, escala 0–5
- **Backend** (`monabit-api`): Express, 512MiB RAM, escala 0–5

## Arquitectura del Backend — Capas

```
Request → Routes → Controllers → Services → Repositories → Supabase / CoinGecko
```

| Capa | Responsabilidad | Archivos |
|------|---------------|----------|
| **Routes** | Mapeo HTTP method + path, cadena de middlewares | `routes/*.routes.ts` |
| **Controllers** | Parsear request, llamar service, formatear respuesta | `controllers/*.controller.ts` |
| **Services** | Lógica de negocio, orquestación, caché | `services/*.service.ts` |
| **Repositories** | Acceso a datos (queries Drizzle ORM) | `repositories/index.ts` |
| **Middlewares** | Transversales: auth, validación, rate limit, idempotencia | `middlewares/*.middleware.ts` |

### ¿Por qué cuatro capas?

- **Testabilidad**: Los Services se prueban unitariamente mockeando repositories. Los Controllers no necesitan HTTP.
- **Mantenibilidad**: Cambiar de Supabase a PostgreSQL directo solo toca los repositories — los services no cambian.
- **Separación de responsabilidades**: Cada capa tiene una razón para cambiar. Los Controllers no tienen lógica de negocio. Los Services no tocan `req`/`res`.

### Mapa de Archivos

```
api/src/
├── config/          env.ts (variables de entorno validadas con Zod), supabase.ts
├── middlewares/     auth, admin, error, validate, rate-limit, idempotency, request-id
├── routes/          auth, crypto, admin, profile, favorites, alerts
├── controllers/     auth, crypto, admin, profile, favorites, alerts
├── services/        auth, crypto, coingecko, user, favorites, alert, cache
├── repositories/    user, favorites, audit (queries Drizzle)
├── utils/           logger (Pino), errors (AppError), retry, scheduler, async-handler
├── db/              index.ts (cliente Drizzle), schema.ts (schema Drizzle)
├── app.ts           Configuración Express, pipeline de middlewares, health endpoint
└── index.ts         Punto de entrada del servidor
```

## Arquitectura del Frontend

### Manejo de Estado — Dos Herramientas, Dos Propósitos

| Tipo de Estado | Herramienta | Por qué | Ejemplo |
|---------------|-------------|---------|---------|
| **Estado del servidor** | TanStack Query | Caché automática, refetch en background, stale-while-revalidate, deduplicación, reintentos | Precios cripto, lista de usuarios, favoritos, alertas |
| **Estado del cliente** | Zustand | Boilerplate mínimo, persistencia en localStorage, re-renders selectivos | Tema (dark/light), sidebar abierto/cerrado |

### Estructura de Carpetas

```
web/src/
├── components/
│   ├── ui/          Primitivas shadcn/ui (button, card, table, modal, select, tooltip)
│   ├── layout/      AppLayout, Sidebar, Header, ProtectedRoute, AdminRoute
│   ├── auth/        LoginForm, RegisterForm, GoogleButton
│   ├── crypto/      CryptoTable, KPICards, PriceChart, CoinSearch, CoinDetailBar
│   └── users/       (ninguno — el formulario admin está inline en la página)
├── pages/           LoginPage, RegisterPage, DashboardPage, FavoritesPage,
│                    AlertsPage, AdminUsersPage, ProfilePage, NotFoundPage,
│                    AuthCallbackPage, ForgotPasswordPage, ResetPasswordPage
├── hooks/           useAuth, useCrypto, useUsers, useFavorites, useAlerts, useAlertNotifications
├── stores/          app.store.ts (Zustand), auth.store.ts (Zustand)
├── services/        api.ts (axios), supabase.ts (cliente Supabase)
├── providers/       ThemeProvider (AuthProvider fue eliminado — la autenticación está en Zustand)
├── lib/             utils.ts (formateo), constants.ts
├── types/           Interfaces TypeScript compartidas
└── i18n/            Configuración i18n + en.json + es.json
```

### Árbol de Componentes

```
<App>
  <ErrorBoundary>
    <Suspense>
      <Routes>
        <Route path="/login" ... />
        <Route path="/register" ... />

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

### ¿Por qué TanStack Query + Zustand juntos?

Muchas apps React ponen TODO el estado en un store global (Redux, Context). Esto crea problemas:
- Los datos del servidor se vuelven obsoletos (sin auto-refetch)
- Las mutaciones requieren manejo manual de caché
- Cada cambio de estado re-renderiza componentes no relacionados

**TanStack Query maneja el estado del servidor automáticamente:**
- Cachea respuestas de API con TTLs configurables
- Deduplica requests concurrentes (dos componentes pidiendo los mismos datos = una llamada API)
- Refetch al enfocar ventana, por intervalo, o manualmente
- Soporta optimistic updates con rollback

**Zustand maneja solo estado UI del cliente:**
- Tema (persistido en localStorage via middleware `persist`)
- Estado del sidebar (abierto/cerrado)
- ~10 líneas de código, sin Provider wrapper

## Modelo de Base de Datos

### Esquema

```sql
auth.users (built-in Supabase)
    │  1:1 (trigger al registrarse)
    ▼
profiles
    │  extiende auth.users con username, full_name, role, preferences
    │
    ├── 1:N ──▶ favorites      (coin_id, coin_symbol, coin_name)
    ├── 1:N ──▶ price_alerts   (target_price, direction, is_triggered)
    └── 1:N ──▶ audit_logs    (action, resource, details JSONB)
```

### Tablas

| Tabla | Propósito | Columnas clave |
|-------|-----------|---------------|
| `profiles` | Datos de usuario de aplicación | id (FK→auth.users), role (admin/user), is_active, preferences (JSONB) |
| `favorites` | Monedas marcadas como favoritas | user_id (FK), coin_id, coin_symbol, coin_name |
| `price_alerts` | Alertas de precio | user_id (FK), target_price, direction (above/below), is_triggered |
| `audit_logs` | Trazabilidad de acciones admin | user_id (FK), action, resource, details (JSONB), ip_address |

### Decisiones de Diseño

- **profiles separada de auth.users**: Supabase maneja passwords, confirmaciones de email, tokens. Nosotros manejamos nombres, roles y preferencias. Cambian a ritmos diferentes.
- **role como TEXT con CHECK**: Más simple que un ENUM de PostgreSQL. Más flexible para roles futuros.
- **audit_logs con JSONB**: La columna `details` guarda valores viejos/nuevos como diff JSON — legible y consultable.
- **Row Level Security (RLS)**: Cada tabla tiene políticas RLS. Usuarios solo leen/escriben sus propios datos. Admins leen todo. Incluso si el backend tiene un bug, la base de datos fuerza el control de acceso.

## Endpoints de la API

### Autenticación

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Registro email/password |
| POST | `/api/auth/login` | No | Login, devuelve JWT |
| POST | `/api/auth/google` | No | Google OAuth |
| POST | `/api/auth/logout` | Sí | Invalidar sesión |
| POST | `/api/auth/refresh` | No | Refrescar JWT expirado |
| GET | `/api/auth/me` | Sí | Perfil del usuario actual |

### Criptomonedas

| Método | Endpoint | Auth | Caché | Descripción |
|--------|----------|------|-------|-------------|
| GET | `/api/crypto/top10` | Sí | 60s | Top 10 por market cap |
| GET | `/api/crypto/market-overview` | Sí | 120s | KPIs globales |
| GET | `/api/crypto/by-ids?ids=a,b` | Sí | 60s | Datos de varias monedas |
| GET | `/api/crypto/:coinId` | Sí | 60s | Detalle individual |
| GET | `/api/crypto/:coinId/history` | Sí | 300s | Historial de precios |
| GET | `/api/crypto/search?q=` | Sí | 120s | Búsqueda de monedas |

### Admin (rol: admin)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/admin/users` | Listar usuarios (paginado) |
| GET | `/api/admin/users/:id` | Obtener usuario |
| POST | `/api/admin/users` | Crear usuario |
| PUT | `/api/admin/users/:id` | Actualizar usuario (rol, estado) |
| POST | `/api/admin/users/:id/reset-password` | Admin resetea contraseña |
| DELETE | `/api/admin/users/:id` | Soft-delete (desactivar) |

### Perfil y Favoritos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/profile` | Obtener perfil propio |
| PUT | `/api/profile` | Actualizar perfil propio |
| GET | `/api/favorites` | Listar favoritos |
| POST | `/api/favorites` | Añadir favorito |
| DELETE | `/api/favorites/:coinId` | Eliminar favorito |

### Alertas de Precio

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/alerts` | Listar alertas |
| POST | `/api/alerts` | Crear alerta |
| PUT | `/api/alerts/:id` | Actualizar alerta (resetea triggered) |
| DELETE | `/api/alerts/:id` | Eliminar alerta |
| POST | `/api/alerts/check` | Verificar precios, disparar/rearmar alertas |

### Sistema

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Health check (DB, caché, uptime) |

## Integración con CoinGecko

**Proveedor**: CoinGecko (free tier, requiere API key gratuita)

**Endpoints usados**: `/coins/markets`, `/global`, `/coins/{id}`, `/coins/{id}/market_chart`, `/search`

**Mecanismos de estabilidad**:

| Mecanismo | Implementación |
|-----------|---------------|
| Caché | `node-cache` en memoria, TTL 60s para market data, 120s global, 300s history |
| Pre-fetch | `node-cron` refresca caché cada 55 segundos |
| Reintento | Backoff exponencial, 3 intentos (2s → 4s → 8s) en errores 429/5xx |
| Circuit breaker | Tras 5 fallos consecutivos, deja de llamar a CoinGecko por 30s |
| Fallback | Datos cacheados devueltos si CoinGecko está caído |

**Resultado**: Máximo 1.09 llamadas/minuto a CoinGecko. 99% de requests de usuarios pegan en caché.

**Archivos**: `coingecko.service.ts` (cliente HTTP + reintentos), `crypto.service.ts` (lógica cache-first), `cache.service.ts` (wrapper genérico), `scheduler.ts` (node-cron)

## Autenticación y Seguridad

### Flujo de Autenticación

1. Usuario se registra o inicia sesión via email/password o Google OAuth
2. Supabase Auth valida credenciales, devuelve JWT (1h expiración) + refresh token
3. JWT guardado en `localStorage`, enviado como `Authorization: Bearer <token>` en cada request
4. Backend `auth.middleware.ts` valida JWT con Supabase en cada request, adjunta `req.user`
5. Refresh de token via axios interceptor cuando el backend devuelve 401

### Capas de Seguridad

| Capa | Qué hace |
|------|----------|
| **Helmet** | Configura 15+ headers de seguridad HTTP (CSP, HSTS, X-Frame-Options) |
| **CORS** | Solo el origen del frontend está permitido |
| **Rate limiting** | 100 req/15min general, 10 req/15min para auth |
| **Validación JWT** | Cada ruta protegida valida el token con Supabase |
| **Control por roles** | `adminMiddleware` verifica `req.user.role === 'admin'` |
| **Row Level Security** | RLS en PostgreSQL — defensa en profundidad |
| **Validación de inputs** | Zod schemas en todos los body, query y params |
| **Idempotencia** | Header `X-Idempotency-Key` en todas las mutaciones |
| **CSRF** | JWT en header Authorization (no cookie) — inmune a CSRF por diseño |
| **XSS** | React escapa output + Content Security Policy |
| **Secretos** | `.env` en `.gitignore`, `.env.example` con placeholders |

## Decisiones Tecnológicas Clave

| Decisión | Elección | Por qué no la alternativa |
|----------|----------|------------------------|
| ORM | **Drizzle** | Prisma requiere manejar dos schemas (Prisma + Supabase), más pesado, necesita `prisma generate` |
| Base de datos | **Supabase** | Firestore es NoSQL (malo para datos relacionales). Supabase da Auth + DB + RLS en un producto |
| Framework backend | **Express** | NestJS añade boilerplate (módulos, decoradores, DI) sin beneficio proporcional para este alcance |
| Estado frontend | **Zustand + TanStack Query** | Redux para 2 piezas de estado UI es overkill. TanStack Query maneja estado del servidor automáticamente |
| Estilos | **Tailwind + shadcn/ui** | MUI es pesado, opinionado. shadcn/ui es copy-paste — eres dueño del código |
| Gráficos | **Recharts** | D3 es demasiado bajo nivel. Chart.js no es React-native. Recharts es componible + liviano |
| HTTP | **Axios** | El interceptor de responses con cola de 401 + reintentos es difícil de replicar con fetch plano |
| Validación | **Zod** | Joi es más pesado. Yup tiene inferencia de tipos más débil. Zod infiere tipos automáticamente |

## Limitaciones Conocidas

| Limitación | Impacto | Mitigación |
|-----------|---------|------------|
| CoinGecko free tier | 10-30 req/min de límite | Caché 60s + prefetch 55s = 1.09 req/min |
| Caché en memoria | Se pierde al reiniciar | Aceptable para TTL 60s. Redis si multi-instancia |
| Cold starts Cloud Run | ~2s al escalar de 0 | `--min-instances 1` añade ~$40/mes |
| Sin WebSocket | Datos se pollean cada 60s | Suficiente para un dashboard. No es tiempo real |
| JWT en localStorage | Riesgo XSS (mitigado) | CSP + React escaping. Patrón BFF para producción |

## Mejoras Futuras

- Redis para caché compartida entre instancias
- WebSocket para actualizaciones en tiempo real
- Tests end-to-end con Playwright
- Notificaciones por email para alertas de precio
- OpenAPI/Swagger desde schemas Zod
- Feature flags para despliegues controlados
- Error tracking con Sentry
