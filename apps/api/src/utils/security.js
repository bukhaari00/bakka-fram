import crypto from 'crypto';

let argon2 = null;
try {
  argon2 = await import('@node-rs/argon2');
} catch (err) {
  console.warn('[Security] Native @node-rs/argon2 not available in current environment. Using scrypt fallback.');
}

/**
 * Hash a password using Argon2id (with scrypt fallback if native binary unavailable)
 */
export async function hashPassword(plainTextPassword) {
  if (argon2 && typeof argon2.hash === 'function') {
    return await argon2.hash(plainTextPassword, {
      memoryCost: 19456, // 19 MiB
      timeCost: 2,
      outputLen: 32,
      parallelism: 1
    });
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(plainTextPassword, salt, 32);
  return `$scrypt$${salt}$${derivedKey.toString('hex')}`;
}

/**
 * Verify a plain text password against an Argon2id or scrypt hash
 */
export async function verifyPassword(passwordHash, plainTextPassword) {
  if (!passwordHash || !plainTextPassword) return false;
  try {
    if (passwordHash.startsWith('$scrypt$')) {
      const parts = passwordHash.split('$');
      const salt = parts[2];
      const expectedHash = parts[3];
      const checkKey = crypto.scryptSync(plainTextPassword, salt, 32);
      return crypto.timingSafeEqual(Buffer.from(checkKey.toString('hex')), Buffer.from(expectedHash));
    }
    if (argon2 && typeof argon2.verify === 'function') {
      return await argon2.verify(passwordHash, plainTextPassword);
    }
    return false;
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
