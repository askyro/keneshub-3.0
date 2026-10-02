import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { publicUser, readSession, SESSION_COOKIE } from '@/lib/auth/session';

export async function getCurrentUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await readSession(token);
  if (!session?.userId) return null;

  const user = await db.select().from(users).where(eq(users.id, session.userId)).get();
  return user ? { ...user, public: publicUser(user) } : null;
}

export function isAdminSession(value: string | undefined) {
  const expected = process.env.ADMIN_SESSION_SECRET;
  if (!value || !expected || value.length !== expected.length) return false;

  let mismatch = 0;
  for (let index = 0; index < value.length; index += 1) {
    mismatch |= value.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return mismatch === 0;
}
