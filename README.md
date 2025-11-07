# VerifyForge TypeScript SDK

[![npm version](https://badge.fury.io/js/@verifyforge%2Fsdk.svg)](https://badge.fury.io/js/@verifyforge%2Fsdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Official TypeScript/JavaScript client library for the [VerifyForge](https://verifyforge.com) Email Validation API.

## Features

- 🔍 **Hybrid Validation** - Syntax, MX records, SMTP verification, and disposable detection
- ⚡ **Fast & Reliable** - Optimized for speed with smart caching
- 🚀 **Bulk Processing** - Validate up to 100 emails in a single request
- 💯 **Type Safe** - Full TypeScript support with comprehensive type definitions
- 🛡️ **Error Handling** - Comprehensive error handling with custom error classes
- 🔐 **Secure** - API key authentication
- 📦 **Universal** - Works in Node.js and modern browsers
- 🌳 **Tree-shakeable** - ESM and CommonJS builds

## Installation

```bash
npm install @verifyforge/sdk
```

Or using yarn:

```bash
yarn add @verifyforge/sdk
```

Or using pnpm:

```bash
pnpm add @verifyforge/sdk
```

## Quick Start

```typescript
import { VerifyForge } from '@verifyforge/sdk';

// Initialize the client
const client = new VerifyForge({ apiKey: 'your_api_key_here' });

// Validate a single email
const result = await client.validate('user@example.com');

if (result.data.isValid) {
  console.log('✓ Email is valid!');
  console.log(`Reachability: ${result.data.reachability}`);
} else {
  console.log('✗ Email is invalid');
}

console.log(`Credits remaining: ${result.remainingCredits}`);
```

## Usage Examples

### Single Email Validation

```typescript
import { VerifyForge } from '@verifyforge/sdk';

const client = new VerifyForge({ apiKey: 'your_api_key' });

// Validate an email
const result = await client.validate('test@example.com');

// Access validation details
console.log(`Email: ${result.data.email}`);
console.log(`Valid: ${result.data.isValid}`);
console.log(`Disposable: ${result.data.disposable}`);
console.log(`Role Account: ${result.data.roleAccount}`);
console.log(`Free Provider: ${result.data.freeProvider}`);
console.log(`Reachability: ${result.data.reachability}`);

// Check MX records
for (const mx of result.data.mxRecordsList) {
  console.log(`MX: ${mx.exchange} (priority: ${mx.priority})`);
}

// SMTP analysis
const smtp = result.data.smtp;
if (smtp.connectionSuccessful) {
  console.log(`SMTP accepts mail: ${smtp.acceptsMail}`);
}
```

### Bulk Email Validation

```typescript
import { VerifyForge } from '@verifyforge/sdk';

const client = new VerifyForge({ apiKey: 'your_api_key' });

// Validate multiple emails
const emails = [
  'user1@example.com',
  'user2@example.com',
  'user3@example.com',
];

const result = await client.validateBulk(emails);

// Summary statistics
console.log(`Total validated: ${result.data.summary.total}`);
console.log(`Duplicates removed: ${result.data.summary.duplicatesRemoved}`);
console.log(`Credits used: ${result.creditsUsed}`);

// Individual results
for (const item of result.data.results) {
  const status = item.isValid ? '✓' : '✗';
  console.log(`${status} ${item.email} - ${item.reachable}`);
}
```

### Error Handling

```typescript
import {
  VerifyForge,
  VerifyForgeError,
  AuthenticationError,
  InsufficientCreditsError,
  ValidationError,
} from '@verifyforge/sdk';

const client = new VerifyForge({ apiKey: 'your_api_key' });

try {
  const result = await client.validate('test@example.com');
  console.log(result);
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof InsufficientCreditsError) {
    console.error('Not enough credits');
  } else if (error instanceof ValidationError) {
    console.error(`Validation error: ${error.message}`);
    console.error(`Details: ${JSON.stringify(error.details)}`);
  } else if (error instanceof VerifyForgeError) {
    console.error(`API error: ${error.toString()}`);
  } else {
    console.error('Unknown error:', error);
  }
}
```

### Advanced Configuration

```typescript
import { VerifyForge } from '@verifyforge/sdk';

// Custom base URL and timeout
const client = new VerifyForge({
  apiKey: 'your_api_key',
  baseUrl: 'https://custom-domain.com', // Optional
  timeout: 60000, // Request timeout in milliseconds (default: 30000)
});
```

### TypeScript Usage

The SDK is written in TypeScript and provides full type definitions:

```typescript
import {
  VerifyForge,
  ValidationResponse,
  BulkValidationResponse,
  ValidationResult,
} from '@verifyforge/sdk';

const client = new VerifyForge({ apiKey: 'your_api_key' });

// Type-safe responses
const result: ValidationResponse = await client.validate('test@example.com');
const bulkResult: BulkValidationResponse = await client.validateBulk([
  'test1@example.com',
  'test2@example.com',
]);

// Access typed properties
const validation: ValidationResult = result.data;
console.log(validation.isValid); // TypeScript knows this is a boolean
console.log(validation.reachability); // TypeScript knows this is 'safe' | 'risky' | 'invalid' | 'unknown'
```

### Browser Usage

The SDK works in modern browsers with native `fetch` support:

```html
<script type="module">
  import { VerifyForge } from 'https://unpkg.com/@verifyforge/sdk';

  const client = new VerifyForge({ apiKey: 'your_api_key' });

  const result = await client.validate('test@example.com');
  console.log(result);
</script>
```

## API Reference

### `VerifyForge`

Main client class for interacting with the VerifyForge API.

#### Constructor

```typescript
new VerifyForge(config: VerifyForgeConfig)
```

**Parameters:**

- `config.apiKey` (string, required): Your VerifyForge API key
- `config.baseUrl` (string, optional): Base URL for the API. Defaults to `"https://verifyforge.com"`
- `config.timeout` (number, optional): Request timeout in milliseconds. Defaults to `30000`

#### Methods

##### `validate(email: string): Promise<ValidationResponse>`

Validate a single email address.

**Parameters:**

- `email` (string): Email address to validate

**Returns:**

- `Promise<ValidationResponse>`: Complete validation results

**Throws:**

- `ValidationError`: If email format is invalid
- `InsufficientCreditsError`: If account has insufficient credits
- `APIError`: If validation fails

##### `validateBulk(emails: string[]): Promise<BulkValidationResponse>`

Validate multiple email addresses (up to 100).

**Parameters:**

- `emails` (string[]): Array of email addresses to validate

**Returns:**

- `Promise<BulkValidationResponse>`: Results for all emails with summary

**Throws:**

- `ValidationError`: If email list is invalid or exceeds 100 emails
- `InsufficientCreditsError`: If account has insufficient credits
- `APIError`: If validation fails

##### `getBaseUrl(): string`

Get the configured base URL.

##### `getTimeout(): number`

Get the configured timeout in milliseconds.

### Response Types

#### `ValidationResponse`

```typescript
interface ValidationResponse {
  success: boolean;
  data: ValidationResult;
  creditsUsed: number;
  remainingCredits: number;
  validationDuration?: number;
  meta?: {
    apiVersion?: string;
  };
}
```

#### `ValidationResult`

```typescript
interface ValidationResult {
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
```

#### `BulkValidationResponse`

```typescript
interface BulkValidationResponse {
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
```

### Error Classes

All errors extend `VerifyForgeError`:

- `AuthenticationError`: Invalid API key (401)
- `InsufficientCreditsError`: Insufficient credits (402)
- `ValidationError`: Request validation failed (400)
- `RateLimitError`: Rate limit exceeded (429)
- `APIError`: General API error (5xx)
- `NetworkError`: Network request failed

## Requirements

- Node.js 16.0.0 or higher
- Modern browser with `fetch` support

## Development

```bash
# Clone the repository
git clone https://github.com/verifyforge/typescript-sdk.git
cd typescript-sdk

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format

# Type checking
npm run typecheck

# Watch mode for development
npm run dev
```

## Support

- 📧 Email: support@verifyforge.com
- 📚 Documentation: https://verifyforge.com/api-docs
- 🐛 Bug Reports: https://github.com/verifyforge/typescript-sdk/issues

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Links

- [VerifyForge Website](https://verifyforge.com)
- [API Documentation](https://verifyforge.com/api-docs)
- [Get API Key](https://verifyforge.com/api-keys)
- [npm Package](https://www.npmjs.com/package/@verifyforge/sdk)
