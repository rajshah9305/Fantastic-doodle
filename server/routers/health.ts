import { publicProcedure, router } from '../_core/trpc.js';

export const healthRouter = router({
  check: publicProcedure.query(async () => {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      groqKey: !!process.env.GROQ_API_KEY,
    };
  }),
});
