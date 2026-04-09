import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import type { Context } from './context.js';

// ✅ INITIALIZE TRPC ONCE - fixes TS2395 errors
export const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

// Export reusable procedures and router
export const router = t.router;
export const publicProcedure = t.procedure;
