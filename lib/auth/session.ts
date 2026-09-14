import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

export const SESSION_COOKIE = 'session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function getSecret() {
  return process.env.AUTH_SECRET || process.env.ADMIN_SESSION_SECRET || 'dev-auth-secret-change-me';
}

function sign(payload: string) {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

export function createSessionToken(userId: string) {
  const payload = Buffer.from(
    JSON.stringify({ userId, exp: Date.now() + MAX_AGE_SECONDS * 1000 }),
    'utf8'
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function readSessionUserId(token: string | undefined): string | null {
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const actualBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (actualBuf.length !== expectedBuf.length || !timingSafeEqual(actualBuf, expectedBuf)) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      userId?: string;
      exp?: number;
    };
    if (!data.userId || typeof data.exp !== 'number' || data.exp < Date.now()) {
      return null;
    }
    return data.userId;
  } catch {
    return null;
  }
}

export function applySessionCookie(response: NextResponse, userId: string) {
  response.cookies.set(SESSION_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE_SECONDS,
    path: '/',
  });
}

export function publicUser<T extends { id: string; name: string; email: string; role: string }>(user: T) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
