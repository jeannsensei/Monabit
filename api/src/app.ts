import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { env } from "@/config/env";
import { apiRoutes } from "@/routes";
import { errorMiddleware } from "@/middlewares/error.middleware";
import { requestIdMiddleware } from "@/middlewares/request-id.middleware";
import { generalLimiter } from "@/middlewares/rate-limit.middleware";
import { idempotencyMiddleware } from "@/middlewares/idempotency.middleware";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { cacheService } from "@/services/cache.service";
import { logger } from "@/utils/logger";
import { startScheduler } from "./utils/scheduler";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
          ],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: [
            "'self'",
            "data:",
            "https://assets.coingecko.com",
            "https://coin-images.coingecko.com",
          ],
          connectSrc: ["'self'", env.SUPABASE_URL],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );

  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(requestIdMiddleware);
  app.use(generalLimiter);
  app.use(idempotencyMiddleware);

  app.use((req, _res, next) => {
    logger.info(
      { method: req.method, path: req.path, requestId: req.requestId },
      "Request received",
    );
    next();
  });

  app.get("/api/health", async (_req, res) => {
    const start = Date.now();
    let supabaseStatus = "unknown";
    let supabaseLatency = 0;

    try {
      await db.select().from(profiles).limit(1);
      supabaseLatency = Date.now() - start;
      supabaseStatus = "connected";
    } catch {
      supabaseStatus = "disconnected";
    }

    const cacheStats = cacheService.stats();

    res.json({
      status: supabaseStatus === "connected" ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        supabase: { status: supabaseStatus, latency_ms: supabaseLatency },
        cache: {
          status: "ok",
          keys: cacheStats.keys,
          hits: cacheStats.hits,
          misses: cacheStats.misses,
        },
      },
      version: "1.0.0",
    });
  });

  app.use("/api", apiRoutes);

  app.use(errorMiddleware);

  return app;
}

export function startServer() {
  const app = createApp();

  app.listen(env.PORT, () => {
    logger.info(
      { port: env.PORT, env: env.NODE_ENV },
      "Monabit API server started",
    );
    startScheduler();
  });
}
