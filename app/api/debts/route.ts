import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { debts, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { publicUser, readSessionUserId, SESSION_COOKIE } from '@/lib/auth/session';

export async function GET() {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    const userId = await readSessionUserId(token);

    if (!userId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const borrower = await db.select().from(users).where(eq(users.id, userId)).get();
    
    if (!borrower) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userDebts = await db.select().from(debts).where(eq(debts.borrowerId, borrower.id)).all();

    return NextResponse.json({
      user: publicUser(borrower),
      debts: userDebts
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
