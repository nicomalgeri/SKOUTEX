/**
 * Centralized error handling utilities
 *
 * Provides consistent error handling across the application
 */

export enum ErrorCode {
  // Authentication errors
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  INVALID_TOKEN = "INVALID_TOKEN",

  // API errors
  API_ERROR = "API_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  RATE_LIMIT = "RATE_LIMIT",
  TIMEOUT = "TIMEOUT",

  // Data errors
  NOT_FOUND = "NOT_FOUND",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  DUPLICATE_ERROR = "DUPLICATE_ERROR",

  // External service errors
  SPORTMONKS_ERROR = "SPORTMONKS_ERROR",
  OPENAI_ERROR = "OPENAI_ERROR",
  SUPABASE_ERROR = "SUPABASE_ERROR",

  // Unknown errors
  UNKNOWN = "UNKNOWN",
}

export class AppError extends Error {
  constructor(
    message: string,
    public code: ErrorCode = ErrorCode.UNKNOWN,
    public statusCode: number = 500,
    public isOperational: boolean = true,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * Parse HTTP response errors into AppError
 */
export function parseApiError(response: Response, data?: unknown): AppError {
  let code = ErrorCode.API_ERROR;
  let message = "An error occurred";

  // Determine error code from status
  if (response.status === 401) {
    code = ErrorCode.UNAUTHORIZED;
    message = "You must be logged in to perform this action";
  } else if (response.status === 403) {
    code = ErrorCode.FORBIDDEN;
    message = "You don't have permission to perform this action";
  } else if (response.status === 404) {
    code = ErrorCode.NOT_FOUND;
    message = "The requested resource was not found";
  } else if (response.status === 422) {
    code = ErrorCode.VALIDATION_ERROR;
    message = "Invalid data provided";
  } else if (response.status === 429) {
    code = ErrorCode.RATE_LIMIT;
    message = "Too many requests. Please try again later";
  } else if (response.status >= 500) {
    code = ErrorCode.API_ERROR;
    message = "Server error. Please try again later";
  }

  // Override with data if available
  if (data && typeof data === "object" && "error" in data) {
    message = (data as any).error;
  }

  return new AppError(message, code, response.status, true, data);
}

/**
 * Convert any error to user-friendly message
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Network errors
    if (error.message.includes("fetch failed") || error.message.includes("network")) {
      return "Network error. Please check your internet connection";
    }

    // Timeout errors
    if (error.message.includes("timeout")) {
      return "Request timed out. Please try again";
    }

    // Generic error message
    return error.message;
  }

  return "An unexpected error occurred";
}

/**
 * Log error to console in development, send to error tracking in production
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", error);
    if (context) {
      console.error("Context:", context);
    }
  } else {
    // In production, send to error tracking service (e.g., Sentry)
    // Example: Sentry.captureException(error, { extra: context });
    console.error("[Production Error]", error);
  }
}

/**
 * Determine if error should be retried
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof AppError) {
    return (
      error.code === ErrorCode.NETWORK_ERROR ||
      error.code === ErrorCode.TIMEOUT ||
      error.code === ErrorCode.RATE_LIMIT ||
      (error.statusCode >= 500 && error.statusCode < 600)
    );
  }

  return false;
}

/**
 * Create standardized error response for API routes
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage: string = "An error occurred"
) {
  if (error instanceof AppError) {
    const response: { error: string; code: ErrorCode; details?: unknown } = {
      error: error.message,
      code: error.code,
    };

    if (error.details) {
      response.details = error.details;
    }

    return response;
  }

  if (error instanceof Error) {
    return {
      error: error.message || defaultMessage,
      code: ErrorCode.UNKNOWN,
    };
  }

  return {
    error: defaultMessage,
    code: ErrorCode.UNKNOWN,
  };
}

/**
 * Wrap async API route handlers with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<Response>>(
  handler: T
): T {
  return (async (...args: Parameters<T>): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      logError(error, { args });

      const errorResponse = createErrorResponse(error);
      const statusCode = error instanceof AppError ? error.statusCode : 500;

      return new Response(JSON.stringify(errorResponse), {
        status: statusCode,
        headers: { "Content-Type": "application/json" },
      });
    }
  }) as T;
}
