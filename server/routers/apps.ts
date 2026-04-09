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
const SYSTEM_PROMPT = `You are an expert web developer specializing in Industrial Brutalist web design.
Generate a complete, functional single-page web application based on the user's description.

Return ONLY a valid JSON object. Do not include any explanations or conversational text.
Required JSON structure:
{
  "title": "App Name",
  "description": "Brief description",
  "htmlCode": "<html structure with semantic markup>",
  "cssCode": "/* Complete styling */",
  "jsCode": "// Complete functionality"
}

INDUSTRIAL BRUTALIST DESIGN SYSTEM (Strictly Enforced):
- Aesthetics: Raw, bold, functional, and unapologetic.
- Color Palette:
  - Base: Solid Black (#000000) or Zinc-950 (#09090b).
  - Primary Accent: International Orange (#ea580c) - use for primary actions, highlights, and borders.
  - Secondary Accent: Bright Red (#dc2626) for alerts or destructive actions.
  - Text: High contrast White (#ffffff) or Slate-200 (#e2e8f0).
- Typography:
  - Headings: Heavy Sans-serif (Inter, system-ui), Bold, Uppercase, often with letter-spacing.
  - Data/Input: Monospace (Fira Code, JetBrains Mono, system-mono).
- UI Elements:
  - Borders: Thick, visible borders (2px to 4px solid). Use International Orange or Slate-800.
  - Shadows: Hard, offset drop shadows (e.g., box-shadow: 4px 4px 0px 0px #000). No blur.
  - Buttons: Rectangular, sharp corners, hard shadows, hover state translates -2px -2px with increased shadow.
- Spacing:
  - MINIMUM padding for containers: 2rem (32px).
  - MINIMUM gap for grids: 1.5rem (24px).
  - Content must NEVER touch screen edges. Use max-width containers centered with margin auto.
- Responsiveness: Use mobile-first CSS Grid and Flexbox.

TECHNICAL REQUIREMENTS:
- Self-contained: The app must work without external dependencies except for system fonts.
- Modern Code: Use ES6+ JavaScript and modern CSS features (Variables, Grid, Flex).
- No Placeholders: Do not use placeholder images. Use CSS patterns, gradients, or SVG paths.
- Accessibility: Ensure proper contrast and semantic HTML tags.`;

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
          model: 'llama-3.3-70b-versatile',
          temperature: 0.7, // Lowered for more consistent JSON
          max_tokens: 4096,
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
        const systemPrompt = `You are an expert web developer specializing in Industrial Brutalist design.
Modify the existing web application based on the user's instruction.

Return ONLY a valid JSON object. Do not include any explanations.
Required JSON structure:
{
  "htmlCode": "<modified html>",
  "cssCode": "/* modified styles */",
  "jsCode": "// modified script"
}

Maintain the Industrial Brutalist design:
- Solid black backgrounds, International Orange accents.
- Sharp corners, thick borders, hard drop shadows.
- GENEROUS spacing and padding (minimum 2rem).
- Clean, responsive layout using CSS Grid/Flexbox.`;

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
           model: 'llama-3.3-70b-versatile',
           temperature: 0.7,
           max_tokens: 4096,
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
