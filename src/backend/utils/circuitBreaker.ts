/**
 * Circuit Breaker Pattern Implementation
 * 
 * Prevents cascading failures by stopping requests to failing services.
 * Circuit breaker has three states: CLOSED, OPEN, HALF_OPEN.
 */

import { logger } from './logger';

export enum CircuitState {
  /** Normal operation - requests pass through */
  CLOSED = 'CLOSED',
  /** Circuit is open - requests fail immediately */
  OPEN = 'OPEN',
  /** Testing if service recovered - allow limited requests */
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerOptions {
  /** Number of failures before opening circuit (default: 5) */
  failureThreshold?: number;
  /** Time in milliseconds before attempting to close circuit (default: 60000) */
  timeout?: number;
  /** Number of successful requests in HALF_OPEN before closing (default: 2) */
  successThreshold?: number;
  /** Name for logging (default: 'CircuitBreaker') */
  name?: string;
  /** Context for logging */
  context?: Record<string, any>;
}

export class CircuitBreakerError extends Error {
  constructor(
    message: string,
    public readonly state: CircuitState,
    public readonly name: string
  ) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

/**
 * Circuit Breaker implementation
 * 
 * @example
 * ```typescript
 * const breaker = new CircuitBreaker({
 *   failureThreshold: 5,
 *   timeout: 60000,
 *   name: 'DynamoDB'
 * });
 * 
 * const result = await breaker.execute(async () => {
 *   return await dynamoDB.get({ TableName: 'Users', Key: { id: '123' } }).promise();
 * });
 * ```
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures = 0;
  private successes = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold: number;
  private readonly timeout: number;
  private readonly successThreshold: number;
  private readonly name: string;
  private readonly context: Record<string, any>;

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.timeout = options.timeout || 60000; // 1 minute
    this.successThreshold = options.successThreshold || 2;
    this.name = options.name || 'CircuitBreaker';
    this.context = options.context || {};
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get failure count
   */
  getFailures(): number {
    return this.failures;
  }

  /**
   * Reset circuit breaker to CLOSED state
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = 0;
    
    logger.info('Circuit breaker reset', {
      ...this.context,
      circuitBreaker: this.name,
    });
  }

  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit should transition from OPEN to HALF_OPEN
    if (this.state === CircuitState.OPEN) {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure >= this.timeout) {
        this.state = CircuitState.HALF_OPEN;
        this.successes = 0;
        
        logger.info('Circuit breaker entering HALF_OPEN state', {
          ...this.context,
          circuitBreaker: this.name,
          timeSinceLastFailure,
        });
      } else {
        // Circuit is still open, reject immediately
        const remainingTime = this.timeout - timeSinceLastFailure;
        logger.warn('Circuit breaker is OPEN, rejecting request', {
          ...this.context,
          circuitBreaker: this.name,
          remainingTime,
        });
        throw new CircuitBreakerError(
          `Circuit breaker is OPEN. Retry after ${Math.ceil(remainingTime / 1000)}s`,
          this.state,
          this.name
        );
      }
    }

    // Execute function
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;
      
      logger.info('Circuit breaker HALF_OPEN success', {
        ...this.context,
        circuitBreaker: this.name,
        successes: this.successes,
        threshold: this.successThreshold,
      });

      // If we have enough successes, close the circuit
      if (this.successes >= this.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.failures = 0;
        this.successes = 0;
        
        logger.info('Circuit breaker CLOSED after successful recovery', {
          ...this.context,
          circuitBreaker: this.name,
        });
      }
    } else {
      // In CLOSED state, reset failure count on success
      this.failures = 0;
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      // Any failure in HALF_OPEN immediately opens circuit
      this.state = CircuitState.OPEN;
      this.successes = 0;
      
      logger.warn('Circuit breaker reopened after HALF_OPEN failure', {
        ...this.context,
        circuitBreaker: this.name,
        failures: this.failures,
      });
    } else if (this.state === CircuitState.CLOSED) {
      logger.warn('Circuit breaker failure in CLOSED state', {
        ...this.context,
        circuitBreaker: this.name,
        failures: this.failures,
        threshold: this.failureThreshold,
      });

      // If we exceed threshold, open the circuit
      if (this.failures >= this.failureThreshold) {
        this.state = CircuitState.OPEN;
        
        logger.error('Circuit breaker OPENED due to failure threshold', {
          ...this.context,
          circuitBreaker: this.name,
          failures: this.failures,
          threshold: this.failureThreshold,
        });
      }
    }
  }
}

/**
 * Create a circuit breaker instance with default options
 */
export function createCircuitBreaker(options: CircuitBreakerOptions = {}): CircuitBreaker {
  return new CircuitBreaker(options);
}

/**
 * Pre-configured circuit breakers for common services
 */
export const circuitBreakers = {
  dynamoDB: createCircuitBreaker({
    name: 'DynamoDB',
    failureThreshold: 5,
    timeout: 60000,
  }),
  
  s3: createCircuitBreaker({
    name: 'S3',
    failureThreshold: 5,
    timeout: 60000,
  }),
  
  cognito: createCircuitBreaker({
    name: 'Cognito',
    failureThreshold: 5,
    timeout: 60000,
  }),
};
