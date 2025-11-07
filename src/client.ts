/**
 * Main VerifyForge client class
 */

import type {
  VerifyForgeConfig,
  ValidationResponse,
  BulkValidationResponse,
  APIErrorResponse,
} from './types';
import {
  VerifyForgeError,
  AuthenticationError,
  RateLimitError,
  InsufficientCreditsError,
  ValidationError,
  APIError,
  NetworkError,
} from './errors';

/**
 * VerifyForge API client for email validation
 *
 * This is the main class for interacting with the VerifyForge API.
 * It provides methods for validating single emails and bulk validation.
 *
 * @example
 * ```typescript
 * import { VerifyForge } from '@verifyforge/sdk';
 *
 * const client = new VerifyForge({ apiKey: 'your_api_key' });
 *
 * const result = await client.validate('test@example.com');
 * console.log(result.data.isValid);
 * ```
 */
export class VerifyForge {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

  /**
   * Create a new VerifyForge client instance
   *
   * @param config - Client configuration
   * @throws {Error} If API key is not provided
   */
  constructor(config: VerifyForgeConfig) {
    if (!config.apiKey) {
      throw new Error('API key is required');
    }

    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl?.replace(/\/$/, '') || 'https://verifyforge.com';
    this.timeout = config.timeout || 30000;
  }

  /**
   * Make an HTTP request to the API
   *
   * @param method - HTTP method
   * @param endpoint - API endpoint path
   * @param params - Query parameters for GET requests or body for POST requests
   * @returns Response data
   * @throws {VerifyForgeError} If the request fails
   */
  private async makeRequest<T>(
    method: 'GET' | 'POST',
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<T> {
    let url = `${this.baseUrl}${endpoint}`;

    // For GET requests, add query parameters
    if (method === 'GET' && params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      url = `${url}?${searchParams.toString()}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'VerifyForge-TypeScript-SDK/1.0.0',
        },
        body: method === 'POST' && params ? JSON.stringify(params) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (response.status === 401) {
        throw new AuthenticationError('Invalid API key');
      }

      if (response.status === 402) {
        throw new InsufficientCreditsError('Insufficient credits');
      }

      if (response.status === 429) {
        throw new RateLimitError('Rate limit exceeded');
      }

      if (response.status === 400) {
        const errorData = (await response.json()) as APIErrorResponse;
        throw new ValidationError(
          errorData.error || 'Validation failed',
          errorData.details
        );
      }

      if (response.status >= 500) {
        throw new APIError('Internal server error', response.status);
      }

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({
          error: 'Request failed',
        }))) as APIErrorResponse;
        throw new APIError(
          errorData.error || 'Request failed',
          response.status
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(timeoutId);

      // Re-throw our custom errors
      if (error instanceof VerifyForgeError) {
        throw error;
      }

      // Handle abort/timeout
      if (error instanceof Error && error.name === 'AbortError') {
        throw new NetworkError('Request timed out');
      }

      // Handle network errors
      if (error instanceof TypeError) {
        throw new NetworkError('Network request failed');
      }

      // Handle unknown errors
      throw new VerifyForgeError(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }

  /**
   * Validate a single email address
   *
   * Performs comprehensive validation including syntax, MX records,
   * SMTP verification, and disposable/role account detection.
   *
   * @param email - Email address to validate
   * @returns Validation response with complete results
   * @throws {ValidationError} If email format is invalid
   * @throws {InsufficientCreditsError} If account has insufficient credits
   * @throws {APIError} If validation fails
   *
   * @example
   * ```typescript
   * const result = await client.validate('user@example.com');
   *
   * if (result.data.isValid) {
   *   console.log('Email is valid!');
   * }
   *
   * console.log(`Credits remaining: ${result.remainingCredits}`);
   * ```
   */
  async validate(email: string): Promise<ValidationResponse> {
    if (!email || typeof email !== 'string') {
      throw new ValidationError('Email must be a non-empty string');
    }

    return this.makeRequest<ValidationResponse>('GET', '/api/validate', {
      email,
    });
  }

  /**
   * Validate multiple email addresses in bulk
   *
   * Validates up to 100 emails in a single request. Automatically
   * deduplicates emails and filters out invalid formats.
   *
   * @param emails - Array of email addresses to validate (max 100)
   * @returns Bulk validation response with results for all emails
   * @throws {ValidationError} If email list is invalid or exceeds 100 emails
   * @throws {InsufficientCreditsError} If account has insufficient credits
   * @throws {APIError} If validation fails
   *
   * @example
   * ```typescript
   * const emails = ['user1@example.com', 'user2@example.com'];
   * const result = await client.validateBulk(emails);
   *
   * console.log(`Validated ${result.data.summary.total} emails`);
   *
   * for (const item of result.data.results) {
   *   console.log(`${item.email}: ${item.isValid}`);
   * }
   * ```
   */
  async validateBulk(emails: string[]): Promise<BulkValidationResponse> {
    if (!Array.isArray(emails) || emails.length === 0) {
      throw new ValidationError('Emails must be a non-empty array');
    }

    if (emails.length > 100) {
      throw new ValidationError('Maximum 100 emails allowed per request', {
        provided: emails.length,
        maximum: 100,
      });
    }

    return this.makeRequest<BulkValidationResponse>(
      'POST',
      '/api/validate/bulk',
      { emails }
    );
  }

  /**
   * Get the configured base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Get the configured timeout
   */
  getTimeout(): number {
    return this.timeout;
  }
}
