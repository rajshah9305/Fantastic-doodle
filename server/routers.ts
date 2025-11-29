import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { generateAppFromPrompt, modifyAppWithAI } from "./groqClient";
export const appRouter = router({
  system: systemRouter,
  apps: router({
    generate: publicProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "prompt" in val && typeof (val as any).prompt === "string") {
          return val as { prompt: string };
        }
        throw new Error("Invalid input: prompt is required");
      })
      .mutation(async ({ ctx, input }) => {
        const generated = await generateAppFromPrompt(input.prompt);
        return {
          success: true,
          appId: 1,
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
      .mutation(async ({ ctx, input }) => {


        const modified = await modifyAppWithAI(
          input.currentCode,
          input.instruction,
          app.prompt
        );

        return {
          success: true,
          ...modified,
        };
      }),

    list: publicProcedure.query(async () => {
      return [];
    }),

    get: publicProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "id" in val && typeof (val as any).id === "number") {
          return val as { id: number };
        }
        throw new Error("Invalid input: id is required");
      })
      .query(async ({ ctx, input }) => {
        return {
          id: input.id,
          title: "Sample App",
          htmlCode: "<div>Sample HTML</div>",
          cssCode: "body { margin: 0; }",
          jsCode: "console.log('Hello');"
        };
      }),

    delete: publicProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "id" in val && typeof (val as any).id === "number") {
          return val as { id: number };
        }
        throw new Error("Invalid input: id is required");
      })
      .mutation(async ({ ctx, input }) => {
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
