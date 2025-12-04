import { publicProcedure, router } from "./_core/trpc";
import { generateAppFromPrompt, modifyAppWithAI } from "./groqClient";
import * as db from "./db";
import { nanoid } from "nanoid";
// FIX: Use Zod schemas for proper input validation instead of manual type checking
import {
  GenerateAppInputSchema,
  ModifyAppInputSchema,
  UpdateAppInputSchema,
  AppIdInputSchema,
} from "../shared/validation";

export const appRouter = router({
  apps: router({
    generate: publicProcedure
      // FIX: Use Zod schema validation for type safety and better error messages
      .input(GenerateAppInputSchema)
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
        await db.createGeneratedApp({
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
          ...generated,
        };
      }),

    modify: publicProcedure
      // FIX: Use Zod schema validation for type safety and better error messages
      .input(ModifyAppInputSchema)
      .mutation(async ({ input }) => {
        const app = await db.getGeneratedAppById(input.id);
        if (!app) {
          throw new Error("App not found");
        }

        const currentCode = `${app.htmlCode}\n\n<style>\n${app.cssCode || ""}\n</style>\n\n<script>\n${app.jsCode || ""}\n</script>`;

        const modified = await modifyAppWithAI(
          currentCode,
          input.prompt,
          app.prompt
        );

        // Update the app in database
        await db.updateGeneratedApp(input.id, {
          htmlCode: modified.htmlCode,
          cssCode: modified.cssCode || null,
          jsCode: modified.jsCode || null,
        });

        return {
          success: true,
          id: input.id,
          title: modified.title || app.title,
          htmlCode: modified.htmlCode,
          cssCode: modified.cssCode,
          jsCode: modified.jsCode,
        };
      }),

    update: publicProcedure
      // FIX: Use Zod schema validation for type safety and better error messages
      .input(UpdateAppInputSchema)
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.updateGeneratedApp(id, updates);
        return { success: true };
      }),

    list: publicProcedure.query(async () => {
      return db.getAllGeneratedApps();
    }),

    get: publicProcedure
      // FIX: Use Zod schema validation for type safety and better error messages
      .input(AppIdInputSchema)
      .query(async ({ input }) => {
        const app = await db.getGeneratedAppById(input.id);
        if (!app) {
          throw new Error("App not found");
        }
        return app;
      }),

    delete: publicProcedure
      // FIX: Use Zod schema validation for type safety and better error messages
      .input(AppIdInputSchema)
      .mutation(async ({ input }) => {
        await db.deleteGeneratedApp(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
