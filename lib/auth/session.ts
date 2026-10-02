import { NextResponse } from 'next/server';

export const SESSION_COOKIE = 'session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type SessionData = {
  userId: string;
  role?: string;
  exp: number;
};

function getSecret() {
  return process.env.AUTH_SECRET || process.env.ADMIN_SESSION_SECRET || 'dev-auth-secret-change-me';
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function base64UrlEncode(value: string) {
  return bytesToBase64Url(new TextEncoder().encode(value));
}

function base64UrlDecode(value: string) {
  return new TextDecoder().decode(base64UrlToBytes(value));
}

async function sign(payload: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return bytesToBase64Url(new Uint8Array(signature));
}

function secureCompare(a: string, b: string) {
  if (a.length !== b.length) return false;

  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function createSessionToken(userId: string, role?: string) {
  const payload = base64UrlEncode(JSON.stringify({ userId, role, exp: Date.now() + MAX_AGE_SECONDS * 1000 }));
  return `${payload}.${await sign(payload)}`;
}

export async function readSession(token: string | undefined): Promise<SessionData | null> {
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expected = await sign(payload);
  if (!secureCompare(signature, expected)) {
    return null;
  }

  try {
    const data = JSON.parse(base64UrlDecode(payload)) as Partial<SessionData>;
    if (!data.userId || typeof data.exp !== 'number' || data.exp < Date.now()) {
      return null;
    }
    return {
      userId: data.userId,
      role: typeof data.role === 'string' ? data.role : undefined,
      exp: data.exp,
    };
  } catch {
    return null;
  }
}

export async function readSessionUserId(token: string | undefined): Promise<string | null> {
  return (await readSession(token))?.userId || null;
}

export async function applySessionCookie(response: NextResponse, userId: string, role?: string) {
  response.cookies.set(SESSION_COOKIE, await createSessionToken(userId, role), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE_SECONDS,
    path: '/',
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
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
