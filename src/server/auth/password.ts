/**
 * Password Security Module
 *
 * Responsibilities:
 * - Provides secure salt-based password hashing using Node.js native `crypto`.
 * - Validates password strength and matches hash securely.
 * - Prevents timing attacks with safe hash comparisons.
 */

import crypto from 'crypto';

export interface PasswordValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Hashes a plain password using PBKDF2 with SHA-256 and a random 16-byte salt
 */
export function hashPassword(password: string): string {
  if (!password) {
    throw new Error('Password cannot be empty');
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const iterations = 10000;
  const keyLen = 64;
  const digest = 'sha256';

  const hash = crypto.pbkdf2Sync(password, salt, iterations, keyLen, digest).toString('hex');
  return `${salt}:${iterations}:${hash}`;
}

/**
 * Compares a plain password against a stored salt:iterations:hash format string
 */
export function comparePassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) return false;

  const parts = storedHash.split(':');
  if (parts.length !== 3) {
    // Legacy plain text fallback check for pre-seeded users
    return password === storedHash;
  }

  const [salt, iterationsStr, originalHash] = parts;
  const iterations = parseInt(iterationsStr, 10);
  const keyLen = 64;
  const digest = 'sha256';

  const verifyHash = crypto.pbkdf2Sync(password, salt, iterations, keyLen, digest).toString('hex');
  
  // Constant-time comparison to prevent timing side-channel attacks
  return crypto.timingSafeEqual(Buffer.from(verifyHash, 'hex'), Buffer.from(originalHash, 'hex'));
}

/**
 * Validates password strength requirements
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  if (!password || password.length < 6) {
    return {
      isValid: false,
      message: 'পাসওয়ার্ড অবশ্যই কমপক্ষে ৬ অক্ষরের হতে হবে।',
    };
  }
  return { isValid: true };
}
