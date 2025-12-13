import { router } from './_core/trpc.js';
import { healthRouter } from './routers/health.js';
import { appsRouter } from './routers/apps.js';

// Merge all sub-routers
export const appRouter = router({
  health: healthRouter,
  apps: appsRouter,
});

export type AppRouter = typeof appRouter;
