import { publicProcedure, router } from '../_core/trpc.js';
import { z } from 'zod';
import {
  createGeneratedApp,
  getGeneratedAppById,
  getGeneratedAppsBySessionId,
  updateGeneratedApp,
  deleteGeneratedApp,
  createSession,
  getSessionById,
} from '../db.js';
import { getGroqClient } from '../groqClient.js';

// System prompt for app generation
const SYSTEM_PROMPT = `You are an expert web developer. Generate a complete, functional single-page web application based on the user's description.

Return ONLY a JSON object with exactly these fields (no markdown, no code blocks, raw JSON):
{
  "title": "App Name",
  "description": "Brief description",
  "htmlCode": "<html structure with semantic markup>",
  "cssCode": "/* Complete styling */",
  "jsCode": "// Complete functionality"
}

Important:
- The app must be self-contained and work independently
- Include all necessary HTML, CSS, and JavaScript
- Make it visually appealing and responsive
- Ensure all functionality is implemented
- Use modern best practices`;

export const appsRouter = router({
  generate: publicProcedure
    .input(
      z.object({
        prompt: z.string().min(1, 'Prompt is required'),
        sessionId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Ensure session exists
        let session = await getSessionById(input.sessionId);
        if (!session) {
          await createSession({
            sessionId: input.sessionId,
          });
        }

        // Call Groq API to generate app
         const completion = await getGroqClient().chat.completions.create({
          messages: [
            {
              role: 'system',
              content: SYSTEM_PROMPT,
            },
            {
              role: 'user',
              content: `Generate a web application for: ${input.prompt}`,
            },
          ],
          model: 'openai/gpt-oss-120b',
          temperature: 1,
          max_completion_tokens: 65536,
          top_p: 1,
          reasoning_effort: 'medium',
        });

        const responseText =
          completion.choices[0]?.message?.content || '';

        // Parse the response
        let appData;
        try {
          appData = JSON.parse(responseText);
        } catch {
          throw new Error(
            'Failed to parse AI response. The generated response was not valid JSON.'
          );
        }

        // Validate response structure
        if (
          !appData.title ||
          !appData.htmlCode ||
          typeof appData.title !== 'string' ||
          typeof appData.htmlCode !== 'string'
        ) {
          throw new Error('Invalid app structure from AI');
        }

        // Save to database
        const app = await createGeneratedApp({
          sessionId: input.sessionId,
          title: appData.title,
          description: appData.description || input.prompt,
          prompt: input.prompt,
          htmlCode: appData.htmlCode,
          cssCode: appData.cssCode || '',
          jsCode: appData.jsCode || '',
        });

        return {
          success: true,
          sessionId: input.sessionId,
          title: appData.title,
          description: appData.description,
          htmlCode: appData.htmlCode,
          cssCode: appData.cssCode || null,
          jsCode: appData.jsCode || null,
          id: Array.isArray(app) ? app[0]?.id : undefined,
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to generate app: ${message}`);
      }
    }),

  list: publicProcedure.query(async ({ ctx }) => {
    // Get all apps (without session filtering for now)
    const apps = await getGeneratedAppsBySessionId('all', 100, 0);
    return apps || [];
  }),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const app = await getGeneratedAppById(input.id);
      if (!app) {
        throw new Error('App not found');
      }
      return app;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        htmlCode: z.string().optional(),
        cssCode: z.string().optional(),
        jsCode: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      const result = await updateGeneratedApp(id, updates);
      return { success: true, result };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteGeneratedApp(input.id);
      return { success: true };
    }),

  modify: publicProcedure
    .input(
      z.object({
        id: z.number(),
        instruction: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const app = await getGeneratedAppById(input.id);
        if (!app) {
          throw new Error('App not found');
        }

        // Call Groq API to modify app
        const systemPrompt = `You are an expert web developer. Modify the existing web application based on the user's instruction.
Return ONLY a JSON object with exactly these fields (no markdown, no code blocks, raw JSON):
{
  "htmlCode": "<modified html>",
  "cssCode": "/* modified styles */",
  "jsCode": "// modified script"
}`;

        const completion = await getGroqClient().chat.completions.create({
           messages: [
             {
               role: 'system',
               content: systemPrompt,
             },
             {
               role: 'user',
               content: `Current app HTML:\n${app.htmlCode}\n\nCurrent app CSS:\n${app.cssCode}\n\nCurrent app JS:\n${app.jsCode}\n\nModification instruction: ${input.instruction}`,
             },
           ],
           model: 'openai/gpt-oss-120b',
           temperature: 1,
           max_completion_tokens: 65536,
           top_p: 1,
           reasoning_effort: 'medium',
           });

          const responseText =
          completion.choices[0]?.message?.content || '';

          let modifiedCode;
          try {
          modifiedCode = JSON.parse(responseText);
          } catch {
          throw new Error(
            'Failed to parse AI response for app modification.'
          );
          }

        // Update the app
        await updateGeneratedApp(input.id, {
          htmlCode: modifiedCode.htmlCode || app.htmlCode,
          cssCode: modifiedCode.cssCode || app.cssCode,
          jsCode: modifiedCode.jsCode || app.jsCode,
        });

        const updatedApp = await getGeneratedAppById(input.id);
        return updatedApp;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to modify app: ${message}`);
      }
    }),
});
