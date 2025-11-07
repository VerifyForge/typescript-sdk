/**
 * VerifyForge TypeScript SDK
 *
 * Official TypeScript/JavaScript client library for the VerifyForge Email Validation API.
 * Provides powerful email validation with hybrid validation and batch processing.
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
 *
 * @packageDocumentation
 */

export { VerifyForge } from './client';
export * from './errors';
export * from './types';
