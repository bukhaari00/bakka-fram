import { db, LocalAuthSession } from '../db';

/**
 * Offline Authentication Service
 * Securely verifies credentials offline using Web Crypto PBKDF2
 * Never stores plaintext passwords.
 */

export async function hashOfflineCredential(pinOrPassword: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(pinOrPassword),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const saltBytes = new Uint8Array(
    saltHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
  );

  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );

  return Array.from(new Uint8Array(derivedBits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyOfflineLogin(password: string): Promise<{ success: boolean; session?: LocalAuthSession; error?: string }> {
  const session = await db.auth.get('current_session');

  if (!session) {
    return {
      success: false,
      error: 'No enrolled account found on this device. You must sign in online first to enroll this device.'
    };
  }

  if (session.isRevoked) {
    return {
      success: false,
      error: 'This device has been revoked by the farm administrator. Offline access denied.'
    };
  }

  // Check offline expiry
  const now = new Date();
  const offlineExpiry = new Date(session.offlineExpiresAt);
  if (now > offlineExpiry) {
    return {
      success: false,
      error: 'Offline session expired. Please connect to the internet and sign in again to refresh your credentials.'
    };
  }

  const computedHash = await hashOfflineCredential(password, session.offlineVerifierSalt);
  if (computedHash !== session.offlineVerifierHash) {
    return {
      success: false,
      error: 'Invalid offline password.'
    };
  }

  return {
    success: true,
    session
  };
}
