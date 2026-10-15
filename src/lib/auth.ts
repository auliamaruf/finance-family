import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export const COOKIE_NAME = 'keuangan_kita_session_v2';
const SECRET_KEY = process.env.AUTH_SECRET || 'keuangan-kita-family-finance-v2-secret-2026';
const DATA_DIR = path.join(process.cwd(), 'data');
const SECURITY_FILE = path.join(DATA_DIR, 'security.json');

interface SecurityConfig {
  pin: string;
  pinEnabled: boolean;
  updatedAt: string;
}

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    console.error('Failed to create data directory:', e);
  }
}

export function getSecurityConfig(): SecurityConfig {
  ensureDataDir();
  const defaultPin = process.env.APP_PIN || '123456';

  try {
    if (fs.existsSync(SECURITY_FILE)) {
      const content = fs.readFileSync(SECURITY_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed.pin) {
        return {
          pin: String(parsed.pin),
          pinEnabled: parsed.pinEnabled !== false,
          updatedAt: parsed.updatedAt || new Date().toISOString(),
        };
      }
    }
  } catch (e) {
    console.error('Error reading security.json:', e);
  }

  return {
    pin: defaultPin,
    pinEnabled: true,
    updatedAt: new Date().toISOString(),
  };
}

export function saveSecurityConfig(newPin: string, pinEnabled: boolean = true): boolean {
  ensureDataDir();
  try {
    const trimmed = newPin.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      return false;
    }
    const config: SecurityConfig = {
      pin: trimmed,
      pinEnabled,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(SECURITY_FILE, JSON.stringify(config, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Error saving security.json:', e);
    return false;
  }
}

export function verifyPin(enteredPin: string): boolean {
  const config = getSecurityConfig();
  if (!config.pinEnabled) return true;
  return String(enteredPin).trim() === config.pin.trim();
}

/**
 * Creates a signed token: v2_auth:expiresAt:signature
 */
export function createSessionToken(rememberSession: boolean = false): { token: string; maxAge: number } {
  // If rememberSession is true: 24 hours. If false: 4 hours of active window.
  const maxAge = rememberSession ? 24 * 60 * 60 : 4 * 60 * 60;
  const expiresAt = Date.now() + maxAge * 1000;
  const payload = `v2_auth:${expiresAt}`;
  const hmac = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
  const token = `${payload}:${hmac}`;
  return { token, maxAge };
}

export function verifySessionToken(token: string | null | undefined): boolean {
  if (!token) return false;
  try {
    const parts = token.split(':');
    if (parts.length !== 3) return false;

    const [prefix, expiresAtStr, receivedHmac] = parts;
    if (prefix !== 'v2_auth') return false;

    const expiresAt = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return false; // Expired
    }

    const payload = `${prefix}:${expiresAtStr}`;
    const expectedHmac = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(receivedHmac, 'utf-8'),
      Buffer.from(expectedHmac, 'utf-8')
    );
  } catch (e) {
    return false;
  }
}
