import { publicProcedure, router } from '../_core/trpc.js';
import { z } from 'zod';
import { getGroqClient } from '../groqClient.js';

// Validate Groq is available on startup
getGroqClient();

export const groqRouter = router({
  chat: publicProcedure
    .input(z.object({
      messages: z.array(z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
      })),
      model: z.string().default('llama3-8b-8192'),
    }))
    .mutation(async ({ input }) => {
      const completion = await getGroqClient().chat.completions.create({
        messages: input.messages,
        model: input.model,
      });

      return {
        content: completion.choices[0]?.message?.content,
        usage: completion.usage,
      };
    }),

  models: publicProcedure.query(async () => {
    return {
      models: [
        'llama3-8b-8192',
        'llama3-70b-8192',
        'llama-3.1-8b-instant',
      ],
    };
  }),
});
