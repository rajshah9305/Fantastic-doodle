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

// Helper to parse AI response robustly
const parseAIResponse = (text: string) => {
  try {
    // Attempt to extract JSON from markdown if present
    const jsonMatch = text.match(/```json\s?([\s\S]*?)```/) ||
                     text.match(/```\s?([\s\S]*?)```/);

    const cleanJson = jsonMatch ? jsonMatch[1].trim() : text.trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    throw new Error('Failed to parse AI response. The generated response was not valid JSON.');
  }
};

// System prompt for app generation
const SYSTEM_PROMPT = `You are an expert full-stack web developer and UI/UX designer. Your job is to generate complete, functional, and visually stunning single-page web applications exactly as the user describes.

Return ONLY a valid JSON object with no extra text, markdown, or explanation.
Required JSON structure:
{
  "title": "App Name",
  "description": "Brief description",
  "htmlCode": "<html structure with semantic markup>",
  "cssCode": "/* Complete styling */",
  "jsCode": "// Complete functionality"
}

CORE RULES — follow these without exception:
1. USER INTENT IS LAW. If the user specifies a style, color, layout, or theme — implement it exactly. Never override or ignore explicit user instructions.
2. If the user does NOT specify a visual style, apply a modern, polished default: clean typography, subtle gradients or glassmorphism, smooth transitions, and a cohesive color palette derived from the app's purpose.
3. Every app must feel UNIQUE and CRAFTED — not generic. Avoid cookie-cutter layouts. Use creative spacing, micro-interactions, and thoughtful visual hierarchy.
4. NEVER produce a plain, unstyled, or minimal-effort result. Every output should look like a real product.

TECHNICAL REQUIREMENTS:
- Self-contained: No external dependencies except system fonts (use @import for Google Fonts if needed via CSS).
- Modern Code: ES6+ JavaScript, CSS custom properties, Grid, Flexbox, and smooth transitions.
- No placeholder images: Use CSS gradients, SVG icons, or emoji as visual elements.
- Fully functional: All interactive elements must work. No stub functions or TODO comments.
- Responsive: Mobile-first layout using CSS Grid/Flexbox.
- Accessible: Semantic HTML, proper contrast ratios, focus states on interactive elements.
- Polished details: Hover states, loading states where relevant, smooth animations (prefer CSS transitions over JS).

QUALITY BAR:
- The app should look like it was built by a senior developer at a top-tier product company.
- Spacing must be generous and intentional — never cramped.
- Typography must be readable and hierarchical.
- Color usage must be consistent and purposeful.`;

export const appsRouter = router({
  generate: publicProcedure
    .input(
      z.object({
        prompt: z.string().min(1, 'Prompt is required'),
        model: z.string().optional(),
        sessionId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Ensure session exists
        const session = await getSessionById(input.sessionId);
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
              content: `Generate a web application exactly as described: ${input.prompt}`,
            },
          ],
          model: input.model || 'llama-3.3-70b-versatile',
          temperature: 0.5,
          max_tokens: 8192,
          top_p: 1,
        });

        const responseText =
          completion.choices[0]?.message?.content || '';

        // Parse the response
        const appData = parseAIResponse(responseText);

        // Validate response structure
        if (
          !appData.title ||
          !appData.htmlCode ||
          typeof appData.title !== 'string' ||
          typeof appData.htmlCode !== 'string'
        ) {
          throw new Error('Invalid app structure from AI: Missing required fields');
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
          id: Array.isArray(app) ? app[0]?.id : (app as any)?.id,
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to generate app: ${message}`);
      }
    }),

  list: publicProcedure.query(async () => {
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
        model: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const app = await getGeneratedAppById(input.id);
        if (!app) {
          throw new Error('App not found');
        }

        // Call Groq API to modify app
        const systemPrompt = `You are an expert web developer and UI/UX designer. Modify the existing web application based on the user's instruction.

Return ONLY a valid JSON object with no extra text, markdown, or explanation.
Required JSON structure:
{
  "htmlCode": "<modified html>",
  "cssCode": "/* modified styles */",
  "jsCode": "// modified script"
}

CORE RULES — follow these without exception:
1. USER INSTRUCTION IS LAW. Apply exactly what the user asks for — colors, layout, style, behavior, content. Never ignore or override explicit instructions.
2. Preserve everything the user did NOT ask to change. Only modify what was explicitly requested.
3. Keep the app fully functional after every modification. Never break existing features.
4. Maintain or improve visual quality — the result must still look polished and intentional.
5. If the instruction is ambiguous, make the most sensible interpretation and apply it cleanly.`;

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
           model: input.model || 'llama-3.3-70b-versatile',
           temperature: 0.5,
           max_tokens: 8192,
           top_p: 1,
           });

          const responseText =
          completion.choices[0]?.message?.content || '';

          const modifiedCode = parseAIResponse(responseText);

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
