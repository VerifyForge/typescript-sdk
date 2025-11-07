/**
 * Custom error classes for the VerifyForge SDK
 */

/**
 * Base error class for all VerifyForge SDK errors
 */
export class VerifyForgeError extends Error {
  public readonly statusCode?: number;
  public readonly errorCode?: string;
  public readonly details?: Record<string, unknown>;
  public readonly docsUrl: string;

  constructor(
    message: string,
    options?: {
      statusCode?: number;
      errorCode?: string;
      details?: Record<string, unknown>;
      docsUrl?: string;
    }
  ) {
    super(message);
    this.name = 'VerifyForgeError';
    this.statusCode = options?.statusCode;
    this.errorCode = options?.errorCode;
    this.details = options?.details;
    this.docsUrl = options?.docsUrl || 'https://verifyforge.com/api-docs';

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * String representation of the error
   */
  toString(): string {
    const parts = [`${this.name}: ${this.message}`];

    if (this.statusCode) {
      parts.push(`Status Code: ${this.statusCode}`);
    }

    if (this.errorCode) {
      parts.push(`Error Code: ${this.errorCode}`);
    }

    if (this.details && Object.keys(this.details).length > 0) {
      parts.push(`Details: ${JSON.stringify(this.details)}`);
    }

    if (this.docsUrl) {
      parts.push(`Docs: ${this.docsUrl}`);
    }

    return parts.join(' | ');
  }

  /**
   * JSON representation of the error
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      errorCode: this.errorCode,
      details: this.details,
      docsUrl: this.docsUrl,
      stack: this.stack,
    };
  }
}

/**
 * Thrown when API key authentication fails
 */
export class AuthenticationError extends VerifyForgeError {
  constructor(message: string = 'Invalid API key') {
    super(message, {
      statusCode: 401,
      errorCode: 'AUTHENTICATION_ERROR',
    });
    this.name = 'AuthenticationError';
  }
}

/**
 * Thrown when rate limit is exceeded
 */
export class RateLimitError extends VerifyForgeError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, {
      statusCode: 429,
      errorCode: 'RATE_LIMIT_ERROR',
    });
    this.name = 'RateLimitError';
  }
}

/**
 * Thrown when account has insufficient credits
 */
export class InsufficientCreditsError extends VerifyForgeError {
  constructor(message: string = 'Insufficient credits') {
    super(message, {
      statusCode: 402,
      errorCode: 'INSUFFICIENT_CREDITS',
    });
    this.name = 'InsufficientCreditsError';
  }
}

/**
 * Thrown when request validation fails
 */
export class ValidationError extends VerifyForgeError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, {
      statusCode: 400,
      errorCode: 'VALIDATION_ERROR',
      details,
    });
    this.name = 'ValidationError';
  }
}

/**
 * Thrown when the API returns an unexpected error
 */
export class APIError extends VerifyForgeError {
  constructor(message: string, statusCode: number = 500) {
    super(message, {
      statusCode,
      errorCode: 'API_ERROR',
    });
    this.name = 'APIError';
  }
}

/**
 * Thrown when network request fails
 */
export class NetworkError extends VerifyForgeError {
  constructor(message: string) {
    super(message, {
      errorCode: 'NETWORK_ERROR',
    });
    this.name = 'NetworkError';
  }
}
