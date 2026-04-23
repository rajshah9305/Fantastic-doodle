/**
 * Environment configuration with validation
 * Ensures expected variables are available at startup
 */

import { z } from "zod";

const ConfigSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  GROQ_API_KEY: z.string().min(10, "Invalid GROQ_API_KEY").optional(),
  DATABASE_URL: z.string().optional(),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  VERCEL_URL: z.string().optional(),
});

type Config = z.infer<typeof ConfigSchema>;

class Configuration {
  private config: Config | null = null;

  load(): Config {
    if (this.config) {
      return this.config;
    }

    try {
      this.config = ConfigSchema.parse(process.env);
      console.log("[Config] Environment variables loaded successfully");
      return this.config;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const invalidVars = error.issues.map(issue => issue.path.join(".")).join(", ");
        console.error(`[Config] Missing or invalid variables: ${invalidVars}`);
        console.error("[Config] Check your .env file");
      }
      throw error;
    }
  }

  get<K extends keyof Config>(key: K, fallback?: Config[K]): Config[K] {
    const config = this.load();
    const value = config[key];
    return value !== undefined ? value : (fallback as Config[K]);
  }

  isDevelopment(): boolean {
    return this.get("NODE_ENV") === "development";
  }

  isProduction(): boolean {
    return this.get("NODE_ENV") === "production";
  }

  hasDatabaseUrl(): boolean {
    return !!this.get("DATABASE_URL");
  }

  hasGroqApiKey(): boolean {
    const key = this.get("GROQ_API_KEY");
    return typeof key === "string" && key.trim().length >= 10;
  }
}

export const config = new Configuration();
