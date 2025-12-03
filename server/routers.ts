import { publicProcedure, router } from "./_core/trpc";
import { generateAppFromPrompt, modifyAppWithAI } from "./groqClient";
import * as db from "./db";
import { nanoid } from "nanoid";

export const appRouter = router({
  apps: router({
    generate: publicProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "prompt" in val && typeof (val as any).prompt === "string") {
          return val as { prompt: string; sessionId?: string };
        }
        throw new Error("Invalid input: prompt is required");
      })
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
      .input((val: unknown) => {
        if (
          typeof val === "object" &&
          val !== null &&
          "id" in val &&
          typeof (val as any).id === "number" &&
          "prompt" in val &&
          typeof (val as any).prompt === "string"
        ) {
          return val as { id: number; prompt: string };
        }
        throw new Error("Invalid input: id and prompt are required");
      })
      .mutation(async ({ input }) => {
        const app = await db.getGeneratedAppById(input.id);
        if (!app) {
          throw new Error("App not found");
        }

        const currentCode = `${app.htmlCode}\n\n<style>\n${app.cssCode || ''}\n</style>\n\n<script>\n${app.jsCode || ''}\n</script>`;

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
      .input((val: unknown) => {
        if (
          typeof val === "object" &&
          val !== null &&
          "id" in val &&
          typeof (val as any).id === "number"
        ) {
          return val as { id: number; htmlCode?: string; cssCode?: string; jsCode?: string };
        }
        throw new Error("Invalid input: id is required");
      })
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.updateGeneratedApp(id, updates);
        return { success: true };
      }),

    list: publicProcedure
      .query(async () => {
        return db.getAllGeneratedApps();
      }),

    get: publicProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "id" in val && typeof (val as any).id === "number") {
          return val as { id: number };
        }
        throw new Error("Invalid input: id is required");
      })
      .query(async ({ input }) => {
        const app = await db.getGeneratedAppById(input.id);
        if (!app) {
          throw new Error("App not found");
        }
        return app;
      }),

    delete: publicProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "id" in val && typeof (val as any).id === "number") {
          return val as { id: number };
        }
        throw new Error("Invalid input: id is required");
      })
      .mutation(async ({ input }) => {
        await db.deleteGeneratedApp(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
