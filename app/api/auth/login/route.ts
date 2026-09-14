import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { applySessionCookie, publicUser } from '@/lib/auth/session';

let dummyPasswordHash: string | null = null;

async function dummyHash() {
  if (!dummyPasswordHash) {
    dummyPasswordHash = await hashPassword('invalid-password-placeholder');
  }
  return dummyPasswordHash;
}

function isStoredPasswordHash(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  const [saltHex, keyHex] = value.split(':');
  return Boolean(saltHex && keyHex);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'Email и пароль обязательны' }, { status: 400 });
    }

    const user = await db.select().from(users).where(eq(users.email, email)).get();

    if (!user || !isStoredPasswordHash(user.passwordHash)) {
      await verifyPassword(password, await dummyHash());
      return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, user: publicUser(user) });
    applySessionCookie(response, user.id);
    return response;
  } catch (error) {
    console.error('Ошибка входа:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
