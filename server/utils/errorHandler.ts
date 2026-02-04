/**
 * Centralized error handling utilities
 * Provides consistent error formatting and logging across the application
 */

export interface AppError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

export class AppErrorHandler {
  /**
   * Handles API errors with proper logging and formatting
   */
  static handle(error: unknown, context?: string): AppError {
    console.error(`[Error${context ? ` - ${context}` : ''}]`, error);

    if (error && typeof error === 'object' && 'code' in error && 'message' in error && 'statusCode' in error) {
      const appError = error as AppError;
      return {
        code: appError.code || "INTERNAL_ERROR",
        message: appError.message || "An unexpected error occurred",
        statusCode: appError.statusCode || 500,
      };
    }

    if (error instanceof Error) {
      // Groq API errors
      if (error.message.includes("429")) {
        return {
          code: "RATE_LIMITED",
          message: "API rate limited. Please try again in a moment.",
          statusCode: 429,
        };
      }

      if (error.message.includes("timeout")) {
        return {
          code: "TIMEOUT",
          message: "Request timed out. Please try again.",
          statusCode: 504,
        };
      }

      if (error.message.includes("401") || error.message.includes("authentication")) {
        return {
          code: "AUTH_ERROR",
          message: "Authentication failed. Check your API key.",
          statusCode: 401,
        };
      }

      return {
        code: "OPERATION_FAILED",
        message: error.message,
        statusCode: 500,
      };
    }

    return {
      code: "UNKNOWN_ERROR",
      message: "An unexpected error occurred",
      statusCode: 500,
      details: { raw: String(error) },
    };
  }

  /**
   * Creates an AppError with custom code and message
   */
  static create(code: string, message: string, statusCode = 500): AppError {
    return { code, message, statusCode };
  }

  /**
   * Validates environment variables are set
   */
  static validateEnv(vars: string[]): string {
    const missing = vars.filter(v => !process.env[v]);
    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}`
      );
    }
    return "OK";
  }
}

/**
 * Request timeout wrapper for async operations
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  label = "Operation"
): Promise<T> {
  let timeoutHandle: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutHandle);
  });
}

/**
 * Retry with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        const delay = delayMs * Math.pow(2, attempt);
        console.log(
          `[Retry] Attempt ${attempt + 1}/${maxRetries + 1} failed, retrying in ${delay}ms`
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("Max retries exceeded");
}
