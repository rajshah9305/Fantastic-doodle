// ✅ SINGLE EXPORT - fixes TS2440 import conflicts
import { router } from './_core/trpc.js';
import { groqRouter } from './routers/groq.js';
import { healthRouter } from './routers/health.js';
import { appsRouter } from './routers/apps.js';

// Merge all sub-routers
export const appRouter = router({
  health: healthRouter,
  groq: groqRouter,
  apps: appsRouter,
});

export type AppRouter = typeof appRouter;
