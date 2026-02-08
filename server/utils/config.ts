/**
 * Environment configuration with validation
 * Ensures all required variables are set at startup
 */

import { z } from "zod";

const ConfigSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  GROQ_API_KEY: z.string().min(10, "Invalid GROQ_API_KEY"),
  DATABASE_URL: z.string().optional(),
  PORT: z.string().default("3000"),
});

type Config = z.infer<typeof ConfigSchema>;

class Configuration {
  private config: Config | null = null;

  /**
   * Load and validate environment configuration
   * Throws an error if validation fails
   */
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
        const missingVars = error.issues
          .filter(i => i.code === "too_small" || i.code === "invalid_type")
          .map(i => i.path.join("."))
          .join(", ");
        console.error(`[Config] Missing or invalid variables: ${missingVars}`);
        console.error("[Config] Check your .env file");
      }
      throw error;
    }
  }

  /**
   * Get a specific config value with fallback
   */
  get<K extends keyof Config>(key: K, fallback?: Config[K]): Config[K] {
    const config = this.load();
    const value = config[key];
    return value !== undefined ? value : (fallback as Config[K]);
  }

  /**
   * Check if running in development mode
   */
  isDevelopment(): boolean {
    return this.get("NODE_ENV") === "development";
  }

  /**
   * Check if running in production mode
   */
  isProduction(): boolean {
    return this.get("NODE_ENV") === "production";
  }

  /**
   * Check if database is configured
   */
  hasDatabaseUrl(): boolean {
    return !!this.get("DATABASE_URL");
  }
}

export const config = new Configuration();

/**
 * Initial load attempt
 */
try {
  config.load();
} catch (error) {
  console.warn("[Config] Warning: Initial configuration load failed. Some features may not work until all required environment variables are provided.");
}
