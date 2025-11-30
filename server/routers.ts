import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { generateAppFromPrompt, modifyAppWithAI } from "./groqClient";
import * as db from "./db";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,
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
          "appId" in val &&
          typeof (val as any).appId === "number" &&
          "instruction" in val &&
          typeof (val as any).instruction === "string" &&
          "currentCode" in val &&
          typeof (val as any).currentCode === "string"
        ) {
          return val as { appId: number; instruction: string; currentCode: string };
        }
        throw new Error("Invalid input: appId, instruction, and currentCode are required");
      })
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
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "sessionId" in val && typeof (val as any).sessionId === "string") {
          return val as { sessionId: string };
        }
        return { sessionId: "" };
      })
      .query(async ({ input }) => {
        if (!input.sessionId) {
          return [];
        }
        return db.getGeneratedAppsBySessionId(input.sessionId);
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
