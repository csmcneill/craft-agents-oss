#!/usr/bin/env bun
/**
 * Diagnostic script to check Claude OAuth credentials
 * Run with: bun run scripts/check-credentials.ts
 */

import { getCredentialManager } from '@craft-agent/shared/credentials';
import { getExistingClaudeCredentials, isTokenExpired } from '@craft-agent/shared/auth';

async function main() {
  console.log('=== Claude OAuth Credentials Diagnostic ===\n');

  // Check CLI keychain
  console.log('1. Checking CLI keychain...');
  const cliCreds = getExistingClaudeCredentials();
  if (cliCreds) {
    console.log('   ✅ Found credentials in CLI keychain');
    console.log('   - Access token:', cliCreds.accessToken ? `${cliCreds.accessToken.substring(0, 20)}...` : 'missing');
    console.log('   - Refresh token:', cliCreds.refreshToken ? `${cliCreds.refreshToken.substring(0, 20)}...` : 'missing');
    console.log('   - Expires at:', cliCreds.expiresAt ? new Date(cliCreds.expiresAt).toISOString() : 'not set');
    console.log('   - Is expired:', isTokenExpired(cliCreds.expiresAt));
  } else {
    console.log('   ❌ No credentials found in CLI keychain');
  }

  console.log('\n2. Checking credential store...');
  const manager = getCredentialManager();
  const storedCreds = await manager.getClaudeOAuthCredentials();
  if (storedCreds) {
    console.log('   ✅ Found credentials in store');
    console.log('   - Access token:', storedCreds.accessToken ? `${storedCreds.accessToken.substring(0, 20)}...` : 'missing');
    console.log('   - Refresh token:', storedCreds.refreshToken ? `${storedCreds.refreshToken.substring(0, 20)}...` : 'missing');
    console.log('   - Expires at:', storedCreds.expiresAt ? new Date(storedCreds.expiresAt).toISOString() : 'not set');
    console.log('   - Is expired:', isTokenExpired(storedCreds.expiresAt));
  } else {
    console.log('   ❌ No credentials found in store');
  }

  console.log('\n3. Comparison:');
  if (cliCreds && storedCreds) {
    const refreshTokenMatch = cliCreds.refreshToken === storedCreds.refreshToken;
    const expiresAtMatch = cliCreds.expiresAt === storedCreds.expiresAt;
    console.log('   - Refresh tokens match:', refreshTokenMatch);
    console.log('   - Expiry times match:', expiresAtMatch);
    if (!refreshTokenMatch) {
      console.log('   ⚠️  WARNING: Refresh tokens do not match!');
    }
    if (!storedCreds.refreshToken) {
      console.log('   ⚠️  WARNING: Stored credentials missing refresh token!');
    }
  }

  console.log('\n=== Diagnostic Complete ===');
}

main().catch(console.error);
