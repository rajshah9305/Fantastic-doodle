/**
 * Zod validation schemas for API inputs
 * FIX: Replaces manual type checking with proper schema validation
 * This improves type safety and provides better error messages
 */

import { z } from "zod";

// App generation input validation
export const GenerateAppInputSchema = z.object({
  prompt: z
    .string()
    .min(10, "Prompt must be at least 10 characters")
    .max(2000, "Prompt must not exceed 2000 characters"),
  sessionId: z.string().optional(),
});

export type GenerateAppInput = z.infer<typeof GenerateAppInputSchema>;

// App modification input validation
export const ModifyAppInputSchema = z.object({
  id: z.number().int().positive("App ID must be a positive integer"),
  prompt: z
    .string()
    .min(5, "Modification prompt must be at least 5 characters")
    .max(2000, "Prompt must not exceed 2000 characters"),
});

export type ModifyAppInput = z.infer<typeof ModifyAppInputSchema>;

// App update input validation
export const UpdateAppInputSchema = z.object({
  id: z.number().int().positive("App ID must be a positive integer"),
  htmlCode: z.string().optional(),
  cssCode: z.string().optional(),
  jsCode: z.string().optional(),
});

export type UpdateAppInput = z.infer<typeof UpdateAppInputSchema>;

// App get/delete input validation
export const AppIdInputSchema = z.object({
  id: z.number().int().positive("App ID must be a positive integer"),
});

export type AppIdInput = z.infer<typeof AppIdInputSchema>;
