/**
 * Basic usage examples for the VerifyForge TypeScript SDK
 */

import {
  VerifyForge,
  VerifyForgeError,
  AuthenticationError,
  InsufficientCreditsError,
} from '@verifyforge/sdk';

async function main() {
  // Initialize the client
  const client = new VerifyForge({ apiKey: 'your_api_key_here' });

  // Example 1: Single email validation
  console.log('='.repeat(50));
  console.log('Example 1: Single Email Validation');
  console.log('='.repeat(50));

  try {
    const result = await client.validate('user@example.com');

    console.log(`\nEmail: ${result.data.email}`);
    console.log(`Valid: ${result.data.isValid}`);
    console.log(`Disposable: ${result.data.disposable}`);
    console.log(`Role Account: ${result.data.roleAccount}`);
    console.log(`Free Provider: ${result.data.freeProvider}`);
    console.log(`Reachability: ${result.data.reachability}`);
    console.log(`\nCredits Used: ${result.creditsUsed}`);
    console.log(`Credits Remaining: ${result.remainingCredits}`);

    // MX Records
    if (result.data.mxRecordsList.length > 0) {
      console.log('\nMX Records:');
      for (const mx of result.data.mxRecordsList) {
        console.log(`  - ${mx.exchange} (priority: ${mx.priority})`);
      }
    }

    // SMTP Analysis
    const smtp = result.data.smtp;
    console.log(`\nSMTP Connection: ${smtp.connectionSuccessful}`);
    if (smtp.connectionSuccessful) {
      console.log(`SMTP Accepts Mail: ${smtp.acceptsMail}`);
    }

    // Suggestion
    if (result.data.suggestion) {
      console.log(`\nDid you mean: ${result.data.suggestion}`);
    }
  } catch (error) {
    if (error instanceof AuthenticationError) {
      console.error('Error: Invalid API key');
    } else if (error instanceof InsufficientCreditsError) {
      console.error('Error: Insufficient credits');
    } else if (error instanceof VerifyForgeError) {
      console.error(`Error: ${error.toString()}`);
    } else {
      console.error('Unknown error:', error);
    }
  }

  // Example 2: Bulk email validation
  console.log('\n' + '='.repeat(50));
  console.log('Example 2: Bulk Email Validation');
  console.log('='.repeat(50));

  const emails = [
    'user1@example.com',
    'user2@example.com',
    'user3@example.com',
    'invalid-email',
    'user1@example.com', // Duplicate
  ];

  try {
    const result = await client.validateBulk(emails);

    console.log(`\nTotal Validated: ${result.data.summary.total}`);
    console.log(
      `Duplicates Removed: ${result.data.summary.duplicatesRemoved}`
    );
    console.log(`Credits Used: ${result.creditsUsed}`);
    console.log(`Credits Remaining: ${result.remainingCredits}`);

    console.log('\nResults:');
    for (const item of result.data.results) {
      const status = item.isValid ? '✓' : '✗';
      console.log(
        `${status} ${item.email.padEnd(30)} ${item.reachable.padStart(10)}`
      );
    }
  } catch (error) {
    if (error instanceof VerifyForgeError) {
      console.error(`Error: ${error.toString()}`);
    } else {
      console.error('Unknown error:', error);
    }
  }

  // Example 3: Advanced configuration
  console.log('\n' + '='.repeat(50));
  console.log('Example 3: Advanced Configuration');
  console.log('='.repeat(50));

  const customClient = new VerifyForge({
    apiKey: 'your_api_key_here',
    baseUrl: 'https://verifyforge.com',
    timeout: 60000, // 60 seconds
  });

  console.log(`Base URL: ${customClient.getBaseUrl()}`);
  console.log(`Timeout: ${customClient.getTimeout()}ms`);

  console.log('\n✨ Examples completed!');
}

// Run the examples
main().catch(console.error);
