/**
 * Retry utility for handling transient failures in API calls
 *
 * Implements exponential backoff to avoid overwhelming the server
 */

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
  shouldRetry?: (error: Error) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  onRetry: () => {},
  shouldRetry: () => true,
};

/**
 * Execute a function with exponential backoff retry logic
 *
 * @param fn - Async function to execute
 * @param options - Retry configuration
 * @returns Result of the function
 * @throws Last error if all retries fail
 *
 * @example
 * const data = await retryWithBackoff(
 *   () => fetch('/api/players'),
 *   { maxRetries: 3, initialDelay: 1000 }
 * );
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry if we've exhausted attempts
      if (attempt === opts.maxRetries) {
        break;
      }

      // Check if this error should be retried
      if (!opts.shouldRetry(lastError)) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt),
        opts.maxDelay
      );

      // Notify about retry
      opts.onRetry(attempt + 1, lastError);

      // Wait before retrying
      await sleep(delay);
    }
  }

  throw lastError!;
}

/**
 * Check if an error is retryable (network errors, 5xx, rate limits)
 */
export function isRetryableError(error: Error): boolean {
  // Network errors
  if (error.message.includes("fetch failed") || error.message.includes("network")) {
    return true;
  }

  // Check if it's a fetch Response error
  if ("status" in error) {
    const status = (error as any).status;
    // Retry on 5xx errors and 429 (rate limit)
    return status >= 500 || status === 429;
  }

  return false;
}

/**
 * Create a fetch wrapper with automatic retry logic
 *
 * @example
 * const fetchWithRetry = createRetryableFetch({ maxRetries: 3 });
 * const response = await fetchWithRetry('/api/players');
 */
export function createRetryableFetch(options: RetryOptions = {}) {
  return async (url: string, init?: RequestInit): Promise<Response> => {
    return retryWithBackoff(
      async () => {
        const response = await fetch(url, init);

        // Check for HTTP errors
        if (!response.ok) {
          const error = new Error(`HTTP ${response.status}: ${response.statusText}`) as any;
          error.status = response.status;
          error.response = response;
          throw error;
        }

        return response;
      },
      {
        ...options,
        shouldRetry: (error) => {
          // Custom shouldRetry from options or use default
          if (options.shouldRetry) {
            return options.shouldRetry(error);
          }
          return isRetryableError(error);
        },
      }
    );
  };
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Rate limiter to prevent too many requests
 */
export class RateLimiter {
  private queue: Array<() => void> = [];
  private activeCount = 0;

  constructor(
    private maxConcurrent: number = 5,
    private minDelay: number = 100
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Wait if we're at max concurrent requests
    while (this.activeCount >= this.maxConcurrent) {
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }

    this.activeCount++;

    try {
      const result = await fn();

      // Add minimum delay between requests
      await sleep(this.minDelay);

      return result;
    } finally {
      this.activeCount--;

      // Process next queued request
      const next = this.queue.shift();
      if (next) {
        next();
      }
    }
  }
}
