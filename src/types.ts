/**
 * Type definitions for the VerifyForge SDK
 */

/**
 * Configuration for VerifyForge client
 */
export interface VerifyForgeConfig {
  /**
   * Your VerifyForge API key
   */
  apiKey: string;

  /**
   * Base URL for the API
   * @default "https://verifyforge.com"
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;
}

/**
 * Email syntax validation details
 */
export interface SyntaxValidation {
  valid: boolean;
  username?: string;
  domain?: string;
}

/**
 * MX record information
 */
export interface MXRecord {
  exchange: string;
  priority: number;
}

/**
 * SMTP server analysis results
 */
export interface SMTPAnalysis {
  host?: string;
  port?: number;
  connectionSuccessful: boolean;
  acceptsMail: boolean;
  error?: string;
}

/**
 * Gravatar profile information
 */
export interface Gravatar {
  hasGravatar: boolean;
  avatarUrl?: string;
  profileUrl?: string;
}

/**
 * Complete validation result for a single email
 */
export interface ValidationResult {
  email: string;
  isValid: boolean;
  syntax: SyntaxValidation;
  mxRecordsList: MXRecord[];
  smtp: SMTPAnalysis;
  disposable: boolean;
  roleAccount: boolean;
  freeProvider: boolean;
  reachability: 'safe' | 'risky' | 'invalid' | 'unknown';
  suggestion?: string;
  gravatar?: Gravatar;
}

/**
 * Response from single email validation
 */
export interface ValidationResponse {
  success: boolean;
  data: ValidationResult;
  creditsUsed: number;
  remainingCredits: number;
  validationDuration?: number;
  meta?: {
    apiVersion?: string;
  };
}

/**
 * Validation result for a single email in bulk validation
 */
export interface BulkValidationResult {
  email: string;
  isValid: boolean;
  disposable: boolean;
  roleAccount: boolean;
  freeProvider: boolean;
  reachable: string;
  syntax?: SyntaxValidation;
  error?: string;
}

/**
 * Summary statistics for bulk validation
 */
export interface BulkValidationSummary {
  total: number;
  duplicatesRemoved: number;
}

/**
 * Response from bulk email validation
 */
export interface BulkValidationResponse {
  success: boolean;
  data: {
    results: BulkValidationResult[];
    summary: BulkValidationSummary;
  };
  creditsUsed: number;
  remainingCredits: number;
  duration?: number;
  meta?: {
    apiVersion?: string;
  };
}

/**
 * API error response structure
 */
export interface APIErrorResponse {
  success: false;
  error: string;
  details?: Record<string, unknown>;
}
