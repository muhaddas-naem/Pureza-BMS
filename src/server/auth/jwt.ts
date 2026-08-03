/**
 * JWT Authentication & Token Management Engine
 *
 * Responsibilities:
 * - Signs HMAC-SHA256 JWT tokens for Access, Refresh, and Password Reset.
 * - Decodes and verifies token signatures and expiration timestamps.
 * - Extracts user payload safely.
 */

import crypto from 'crypto';
import { config } from '../../config';

export interface JwtUserPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  type?: 'access' | 'refresh' | 'reset';
  iat?: number;
  exp?: number;
}

export interface DecodedJwt {
  header: Record<string, any>;
  payload: JwtUserPayload;
  signature: string;
}

function base64UrlEncode(str: string | Buffer): string {
  const buf = typeof str === 'string' ? Buffer.from(str) : str;
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * Parses duration string (e.g. '24h', '7d', '15m') into seconds
 */
export function parseDurationToSeconds(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])?$/i);
  if (!match) return 86400; // default 24h

  const value = parseInt(match[1], 10);
  const unit = (match[2] || 's').toLowerCase();

  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 3600;
    case 'd': return value * 86400;
    default: return value;
  }
}

/**
 * Signs a payload into a valid JWT token string
 */
export function signJwtToken(
  payload: JwtUserPayload,
  expiresInStr: string = config.jwtExpiresIn,
  secretKey: string = config.jwtSecret
): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const expiresInSec = parseDurationToSeconds(expiresInStr);

  const fullPayload: JwtUserPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSec,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();

  const encodedSignature = base64UrlEncode(signature);
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

/**
 * Verifies JWT token signature and expiration
 */
export function verifyJwtToken(
  token: string,
  secretKey: string = config.jwtSecret
): JwtUserPayload {
  if (!token) {
    throw new Error('Token string is required');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT token structure');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;

  const expectedSignature = base64UrlEncode(
    crypto
      .createHmac('sha256', secretKey)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest()
  );

  if (encodedSignature !== expectedSignature) {
    throw new Error('Invalid JWT signature');
  }

  const payloadJson = base64UrlDecode(encodedPayload);
  const payload: JwtUserPayload = JSON.parse(payloadJson);

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new Error('JWT token has expired');
  }

  return payload;
}
