export const COOKIE_NAME = 'keuangan_kita_session_v2';
export const SECRET_KEY = process.env.AUTH_SECRET || 'keuangan-kita-family-finance-v2-secret-2026';

/**
 * Edge-compatible session verifier using Web Crypto API (no Node fs/crypto required)
 */
export async function verifySessionEdge(token: string | null | undefined): Promise<boolean> {
  if (!token) return false;

  try {
    const parts = token.split(':');
    if (parts.length !== 3) return false;

    const [prefix, expiresAtStr, hexHmac] = parts;
    if (prefix !== 'v2_auth') return false;

    const expiresAt = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return false; // Expired
    }

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(SECRET_KEY),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const data = encoder.encode(`${prefix}:${expiresAtStr}`);
    const match = hexHmac.match(/.{1,2}/g);
    if (!match) return false;
    const signature = new Uint8Array(match.map((byte) => parseInt(byte, 16)));

    return await crypto.subtle.verify('HMAC', key, signature, data);
  } catch (e) {
    return false;
  }
}
