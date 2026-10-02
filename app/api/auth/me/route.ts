import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { publicUser, readSessionUserId, SESSION_COOKIE } from '@/lib/auth/session';

export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const userId = await readSessionUserId(token);

  if (!userId) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const user = await db.select().from(users).where(eq(users.id, userId)).get();

  if (!user) {
    return NextResponse.json({ error: 'Пользователь не найден' }, { status: 401 });
  }

  return NextResponse.json({ user: publicUser(user) });
}
