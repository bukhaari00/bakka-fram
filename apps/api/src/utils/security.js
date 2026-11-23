import { hash, verify } from '@node-rs/argon2';
import crypto from 'crypto';

/**
 * Hash a password using Argon2id
 */
export async function hashPassword(plainTextPassword) {
  return await hash(plainTextPassword, {
    memoryCost: 19456, // 19 MiB
    timeCost: 2,
    outputLen: 32,
    parallelism: 1
  });
}

/**
 * Verify a plain text password against an Argon2id hash
 */
export async function verifyPassword(passwordHash, plainTextPassword) {
  try {
    return await verify(passwordHash, plainTextPassword);
  } catch (err) {
    return false;
  }
}

/**
 * Generate a local verifier for offline-first enrolled devices
 */
export function generateOfflineVerifier(pinOrSecret, salt = crypto.randomBytes(16).toString('hex')) {
  const verifierHash = crypto.pbkdf2Sync(pinOrSecret, salt, 100000, 32, 'sha256').toString('hex');
  return { verifierHash, salt };
}

/**
 * Verify local credentials offline on an enrolled device
 */
export function verifyOfflineCredentials(pinOrSecret, salt, expectedHash) {
  const check = crypto.pbkdf2Sync(pinOrSecret, salt, 100000, 32, 'sha256').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(check, 'hex'), Buffer.from(expectedHash, 'hex'));
}
