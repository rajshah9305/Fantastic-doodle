/**
 * Simple in-memory rate limiting
 * Tracks requests by IP/session to prevent abuse
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private readonly windowMs: number; // Time window in ms
  private readonly maxRequests: number; // Max requests per window

  constructor(windowMs = 60000, maxRequests = 30) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Clean up old entries every 10 minutes
    setInterval(() => this.cleanup(), 10 * 60 * 1000);
  }

  /**
   * Check if a request is allowed
   * Returns true if within limit, false if rate limited
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || now >= entry.resetAt) {
      // New window or entry expired
      this.store.set(identifier, {
        count: 1,
        resetAt: now + this.windowMs,
      });
      return true;
    }

    if (entry.count < this.maxRequests) {
      entry.count++;
      return true;
    }

    return false;
  }

  /**
   * Get remaining requests for an identifier
   */
  getRemaining(identifier: string): number {
    const entry = this.store.get(identifier);
    if (!entry) return this.maxRequests;
    if (Date.now() >= entry.resetAt) return this.maxRequests;
    return Math.max(0, this.maxRequests - entry.count);
  }

  /**
   * Get reset time for an identifier
   */
  getResetTime(identifier: string): number {
    const entry = this.store.get(identifier);
    if (!entry) return 0;
    return Math.max(0, entry.resetAt - Date.now());
  }

  /**
   * Reset rate limit for an identifier
   */
  reset(identifier: string): void {
    this.store.delete(identifier);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.store.forEach((entry, key) => {
      if (now >= entry.resetAt) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.store.delete(key));
  }
}

// Create rate limiters for different endpoints
export const apiLimiter = new RateLimiter(60000, 30); // 30 requests per minute
export const generateLimiter = new RateLimiter(60000, 5); // 5 generations per minute
export const modifyLimiter = new RateLimiter(60000, 10); // 10 modifications per minute
