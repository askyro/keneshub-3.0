import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { publicUser, readSession, SESSION_COOKIE } from '@/lib/auth/session';
import { isAdminSession } from '@/lib/auth/admin';

export { isAdminSession };

export async function getCurrentUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await readSession(token);
  if (!session?.userId) return null;

  const user = await db.select().from(users).where(eq(users.id, session.userId)).get();
  return user ? { ...user, public: publicUser(user) } : null;
}
