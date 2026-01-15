/**
 * Retry Utility with Exponential Backoff
 * 
 * Provides retry logic with configurable exponential backoff for resilient operations.
 * Supports custom retry conditions, max attempts, and backoff strategies.
 */

import { logger } from './logger';

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxAttempts?: number;
  /** Initial delay in milliseconds (default: 100) */
  initialDelay?: number;
  /** Maximum delay in milliseconds (default: 5000) */
  maxDelay?: number;
  /** Exponential backoff multiplier (default: 2) */
  multiplier?: number;
  /** Jitter factor (0-1, default: 0.1) - adds randomness to prevent thundering herd */
  jitter?: number;
  /** Custom function to determine if error should be retried (default: retry all errors) */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  /** Custom function to determine delay for specific attempt */
  getDelay?: (attempt: number, baseDelay: number) => number;
  /** Context for logging */
  context?: Record<string, any>;
}

export class RetryError extends Error {
  constructor(
    message: string,
    public readonly attempts: number,
    public readonly lastError: unknown
  ) {
    super(message);
    this.name = 'RetryError';
  }
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  multiplier: number,
  jitter: number
): number {
  // Exponential backoff: initialDelay * (multiplier ^ attempt)
  const exponentialDelay = initialDelay * Math.pow(multiplier, attempt - 1);
  
  // Cap at maxDelay
  const cappedDelay = Math.min(exponentialDelay, maxDelay);
  
  // Add jitter (random variation to prevent thundering herd)
  const jitterAmount = cappedDelay * jitter * Math.random();
  const finalDelay = cappedDelay + jitterAmount;
  
  return Math.floor(finalDelay);
}

/**
 * Default shouldRetry function - retry all errors except RetryError
 */
function defaultShouldRetry(error: unknown, _attempt: number): boolean {
  // Don't retry if it's a RetryError (already exhausted retries)
  if (error instanceof RetryError) {
    return false;
  }
  
  // Retry for all other errors
  return true;
}

/**
 * Retry a function with exponential backoff
 * 
 * @param fn Function to retry
 * @param options Retry options
 * @returns Result of function execution
 * @throws RetryError if all attempts fail
 * 
 * @example
 * ```typescript
 * const result = await retry(
 *   () => dynamoDB.get({ TableName: 'Users', Key: { id: '123' } }).promise(),
 *   {
 *     maxAttempts: 3,
 *     initialDelay: 100,
 *     context: { userId: '123', operation: 'getUser' }
 *   }
 * );
 * ```
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 100,
    maxDelay = 5000,
    multiplier = 2,
    jitter = 0.1,
    shouldRetry = defaultShouldRetry,
    getDelay,
    context = {},
  } = options;

  let lastError: unknown;
  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt++;

    try {
      const result = await fn();
      
      // Log successful retry if not first attempt
      if (attempt > 1) {
        logger.info('Operation succeeded after retry', {
          ...context,
          attempt,
          totalAttempts: attempt,
        });
      }
      
      return result;
    } catch (error) {
      lastError = error;

      // Check if we should retry this error
      if (!shouldRetry(error, attempt)) {
        logger.warn('Error not retriable, stopping retries', {
          ...context,
          attempt,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }

      // If this was the last attempt, throw error
      if (attempt >= maxAttempts) {
        logger.error('Operation failed after all retry attempts', error, {
          ...context,
          attempts: attempt,
          totalAttempts: attempt,
        });
        throw new RetryError(
          `Operation failed after ${attempt} attempts`,
          attempt,
          error
        );
      }

      // Calculate delay for next attempt
      const delay = getDelay
        ? getDelay(attempt, initialDelay)
        : calculateDelay(attempt, initialDelay, maxDelay, multiplier, jitter);

      logger.warn('Operation failed, retrying', {
        ...context,
        attempt,
        nextAttempt: attempt + 1,
        delay,
        error: error instanceof Error ? error.message : String(error),
      });

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw new RetryError(
    `Operation failed after ${attempt} attempts`,
    attempt,
    lastError
  );
}

/**
 * Retry with specific conditions for AWS SDK errors
 */
export interface AWSRetryOptions extends RetryOptions {
  /** Retry on throttling errors (default: true) */
  retryOnThrottling?: boolean;
  /** Retry on 5xx errors (default: true) */
  retryOn5xx?: boolean;
  /** Retry on network errors (default: true) */
  retryOnNetworkError?: boolean;
}

/**
 * Check if AWS error should be retried
 */
function shouldRetryAWSError(error: unknown, options: AWSRetryOptions): boolean {
  if (!(error instanceof Error)) {
    return true;
  }

  const errorName = (error as any).name || '';
  const errorCode = (error as any).code || '';
  const statusCode = (error as any).statusCode || 0;

  // Throttling errors
  if (options.retryOnThrottling !== false) {
    if (
      errorName === 'ThrottlingException' ||
      errorCode === 'ThrottlingException' ||
      errorCode === 'ProvisionedThroughputExceededException' ||
      errorCode === 'RequestLimitExceeded'
    ) {
      return true;
    }
  }

  // 5xx errors
  if (options.retryOn5xx !== false) {
    if (statusCode >= 500 && statusCode < 600) {
      return true;
    }
  }

  // Network errors
  if (options.retryOnNetworkError !== false) {
    if (
      errorName === 'NetworkError' ||
      errorCode === 'ECONNRESET' ||
      errorCode === 'ETIMEDOUT' ||
      errorCode === 'ENOTFOUND'
    ) {
      return true;
    }
  }

  // Don't retry client errors (4xx) except throttling
  if (statusCode >= 400 && statusCode < 500) {
    return false;
  }

  // Retry other errors by default
  return true;
}

/**
 * Retry AWS SDK operations with smart retry logic
 * 
 * @example
 * ```typescript
 * const user = await retryAWS(
 *   () => docClient.send(new GetCommand({ TableName: 'Users', Key: { id: '123' } })),
 *   {
 *     maxAttempts: 5,
 *     initialDelay: 200,
 *     context: { userId: '123' }
 *   }
 * );
 * ```
 */
export async function retryAWS<T>(
  fn: () => Promise<T>,
  options: AWSRetryOptions = {}
): Promise<T> {
  return retry(fn, {
    ...options,
    shouldRetry: (error, attempt) => {
      // First check custom shouldRetry if provided
      if (options.shouldRetry && !options.shouldRetry(error, attempt)) {
        return false;
      }
      
      // Then check AWS-specific conditions
      return shouldRetryAWSError(error, options);
    },
  });
}
