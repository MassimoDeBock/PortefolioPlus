#!/usr/bin/env tsx
/**
 * Generate a bcrypt hash for ADMIN_PASSWORD_HASH.
 * Usage: npx tsx scripts/hash-password.ts <your-password>
 */
import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
  console.error('Usage: npx tsx scripts/hash-password.ts <password>');
  process.exit(1);
}

bcrypt.hash(password, 12).then(hash => {
  console.log('\nADMIN_PASSWORD_HASH=' + hash + '\n');
  console.log('Add this to your .env.local file.');
});
