import { publicProcedure, router } from "./_core/trpc";
import { generateAppFromPrompt, modifyAppWithAI } from "./groqClient";
import * as db from "./db";
import { nanoid } from "nanoid";
import { z } from "zod";

// Input validation schemas
const generateInputSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty"),
  sessionId: z.string().optional(),
});

const modifyInputSchema = z.object({
  appId: z.number().positive(),
  instruction: z.string().min(1, "Instruction cannot be empty"),
  currentCode: z.string(),
});

const getByIdSchema = z.object({
  id: z.number().positive(),
});

const getBySessionSchema = z.object({
  sessionId: z.string().min(1),
});

export const appRouter = router({
  apps: router({
    generate: publicProcedure
      .input(generateInputSchema)
      .mutation(async ({ input }) => {
        const sessionId = input.sessionId || nanoid();

        // Ensure session exists
        const existingSession = await db.getSessionById(sessionId);
        if (!existingSession) {
          await db.createSession({ sessionId });
        } else {
          await db.updateSessionActivity(sessionId);
        }

        const generated = await generateAppFromPrompt(input.prompt);

        // Save to database
        const result = await db.createGeneratedApp({
          sessionId,
          title: generated.title || "Untitled App",
          description: null,
          prompt: input.prompt,
          htmlCode: generated.htmlCode,
          cssCode: generated.cssCode || null,
          jsCode: generated.jsCode || null,
        });

        return {
          success: true,
          sessionId,
          appId: result.id,
          ...generated,
        };
      }),

    modify: publicProcedure
      .input(modifyInputSchema)
      .mutation(async ({ input }) => {
        const app = await db.getGeneratedAppById(input.appId);
        if (!app) {
          throw new Error("App not found");
        }

        const modified = await modifyAppWithAI(
          input.currentCode,
          input.instruction,
          app.prompt
        );

        // Update the app in database
        await db.updateGeneratedApp(input.appId, {
          htmlCode: modified.htmlCode,
          cssCode: modified.cssCode || null,
          jsCode: modified.jsCode || null,
        });

        return {
          success: true,
          ...modified,
        };
      }),

    list: publicProcedure
      .input(getBySessionSchema)
      .query(async ({ input }) => {
        if (!input.sessionId) {
          return [];
        }
        return db.getGeneratedAppsBySessionId(input.sessionId);
      }),

    get: publicProcedure
      .input(getByIdSchema)
      .query(async ({ input }) => {
        const app = await db.getGeneratedAppById(input.id);
        if (!app) {
          throw new Error("App not found");
        }
        return app;
      }),

    delete: publicProcedure
      .input(getByIdSchema)
      .mutation(async ({ input }) => {
        await db.deleteGeneratedApp(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
