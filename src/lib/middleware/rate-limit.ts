/**
 * Rate limiting middleware for API routes
 * Prevents abuse and protects expensive operations
 */

import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  maxRequests: number; // Maximum requests allowed
  windowMs: number; // Time window in milliseconds
  message?: string; // Custom error message
}

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// In production, use Redis for distributed rate limiting
const store = new Map<string, RateLimitStore>();

/**
 * Clean up expired entries from the store
 */
function cleanup() {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (now > value.resetTime) {
      store.delete(key);
    }
  }
}

// Run cleanup every minute
if (typeof setInterval !== "undefined") {
  setInterval(cleanup, 60000);
}

/**
 * Get identifier for rate limiting
 * Uses IP address or user ID if authenticated
 */
function getIdentifier(req: NextRequest): string {
  // Try to get IP from headers
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

  // TODO: If authenticated, use user ID instead
  // const userId = req.headers.get("x-user-id");
  // return userId || ip;

  return ip;
}

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = store.get(identifier);

  // No entry or expired entry
  if (!entry || now > entry.resetTime) {
    const resetTime = now + config.windowMs;
    store.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: config.maxRequests - 1, resetTime };
  }

  // Increment count
  entry.count++;

  // Check if exceeded
  if (entry.count > config.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Rate limit middleware wrapper
 *
 * @example
 * ```typescript
 * export const POST = withRateLimit(
 *   { maxRequests: 10, windowMs: 60000 }, // 10 requests per minute
 *   async (req) => {
 *     // Your handler code
 *     return NextResponse.json({ success: true });
 *   }
 * );
 * ```
 */
export function withRateLimit(
  config: RateLimitConfig,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const identifier = getIdentifier(req);
    const { allowed, remaining, resetTime } = checkRateLimit(identifier, config);

    // Add rate limit headers
    const headers = {
      "X-RateLimit-Limit": config.maxRequests.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": new Date(resetTime).toISOString(),
    };

    if (!allowed) {
      const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: config.message || "Too many requests. Please try again later.",
          retryAfter,
        },
        {
          status: 429,
          headers: {
            ...headers,
            "Retry-After": retryAfter.toString(),
          },
        }
      );
    }

    // Call handler
    const response = await handler(req);

    // Add rate limit headers to response
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  };
}

/**
 * Pre-configured rate limit configs for common use cases
 */
export const RateLimitPresets = {
  // Strict: 5 requests per minute
  STRICT: {
    maxRequests: 5,
    windowMs: 60000,
    message: "Too many requests. Maximum 5 requests per minute.",
  },

  // Normal: 30 requests per minute
  NORMAL: {
    maxRequests: 30,
    windowMs: 60000,
    message: "Too many requests. Maximum 30 requests per minute.",
  },

  // Generous: 100 requests per minute
  GENEROUS: {
    maxRequests: 100,
    windowMs: 60000,
    message: "Too many requests. Maximum 100 requests per minute.",
  },

  // AI Operations: 10 requests per minute (expensive)
  AI_OPERATIONS: {
    maxRequests: 10,
    windowMs: 60000,
    message: "Too many AI requests. Maximum 10 per minute.",
  },

  // File Uploads: 5 uploads per hour
  FILE_UPLOAD: {
    maxRequests: 5,
    windowMs: 3600000,
    message: "Too many file uploads. Maximum 5 per hour.",
  },

  // Authentication: 5 attempts per 15 minutes
  AUTH: {
    maxRequests: 5,
    windowMs: 900000,
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
} as const;

/**
 * Combine rate limiting with validation
 *
 * @example
 * ```typescript
 * export const POST = withRateLimitAndValidation(
 *   RateLimitPresets.AI_OPERATIONS,
 *   CreateTargetSchema,
 *   async (req, validatedData) => {
 *     return NextResponse.json({ success: true });
 *   }
 * );
 * ```
 */
export function withRateLimitAndValidation<T>(
  rateLimitConfig: RateLimitConfig,
  schema: any, // Zod schema
  handler: (req: NextRequest, validatedData: T) => Promise<NextResponse>
) {
  return withRateLimit(rateLimitConfig, async (req: NextRequest) => {
    // Validation will be handled by withValidation
    const { withValidation } = await import("./validate");
    return withValidation(schema, handler)(req);
  });
}
