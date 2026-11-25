import crypto from 'crypto';

let argon2: any = null;
try {
  argon2 = require('@node-rs/argon2');
} catch (e) {
  // Native binary not available in some environments, use scrypt fallback
}

/**
 * Hash a password using Argon2id with scrypt fallback
 */
export async function hashPassword(plainTextPassword: string): Promise<string> {
  if (argon2 && typeof argon2.hash === 'function') {
    try {
      return await argon2.hash(plainTextPassword, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1
      });
    } catch (e) {
      // Fall through to scrypt
    }
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(plainTextPassword, salt, 32);
  return `$scrypt$${salt}$${derivedKey.toString('hex')}`;
}

/**
 * Verify password against an Argon2id or scrypt hash
 */
export async function verifyPassword(passwordHash: string, plainTextPassword: string): Promise<boolean> {
  if (!passwordHash || !plainTextPassword) return false;

  try {
    if (passwordHash.startsWith('$scrypt$')) {
      const parts = passwordHash.split('$');
      const salt = parts[2];
      const expectedHash = parts[3];
      const checkKey = crypto.scryptSync(plainTextPassword, salt, 32);
      return crypto.timingSafeEqual(
        Buffer.from(checkKey.toString('hex')),
        Buffer.from(expectedHash)
      );
    }

    if (argon2 && typeof argon2.verify === 'function') {
      return await argon2.verify(passwordHash, plainTextPassword);
    }

    return false;
  } catch (err) {
    return false;
  }
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
