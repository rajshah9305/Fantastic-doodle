/**
 * Zod validation schemas for API inputs
 * Provides type-safe input validation with meaningful error messages
 */

import { z } from "zod";

// Session ID validation
const SessionIdSchema = z
  .string()
  .min(1, "Session ID is required")
  .max(100, "Session ID too long")
  .regex(/^[a-zA-Z0-9_-]+$/, "Invalid session ID format");

// App generation input validation
export const GenerateAppInputSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(10, "Prompt must be at least 10 characters")
    .max(2000, "Prompt must not exceed 2000 characters")
    .describe("Natural language description of the app to generate"),
  sessionId: SessionIdSchema,
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
