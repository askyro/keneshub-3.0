import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { USER_ROLES, users, type UserRole } from '@/lib/db/schema';
import { hashPassword } from '@/lib/auth/password';
import { applySessionCookie, publicUser } from '@/lib/auth/session';
import { v4 as uuidv4 } from 'uuid';

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const role = body.role as UserRole;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Все поля обязательны' }, { status: 400 });
    }

    if (!USER_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Недопустимая роль' }, { status: 400 });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ error: 'Пароль должен содержать минимум 8 символов' }, { status: 400 });
    }

    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).get();
    if (existing) {
      return NextResponse.json({ error: 'Пользователь с таким email уже существует' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const newUser = await db.insert(users).values({
      id: uuidv4(),
      name,
      email,
      passwordHash,
      role,
    }).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    }).get();

    const response = NextResponse.json({ success: true, user: publicUser(newUser) });
    applySessionCookie(response, newUser.id);
    return response;
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
