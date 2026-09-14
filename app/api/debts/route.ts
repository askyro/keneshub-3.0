import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { debts, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    // For now, let's fetch debts for our main mock borrower (Alibek)
    const borrower = await db.select().from(users).where(eq(users.email, 'alibek@example.kz')).get();
    
    if (!borrower) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userDebts = await db.select().from(debts).where(eq(debts.borrowerId, borrower.id)).all();
    
    const { passwordHash: _passwordHash, ...publicBorrower } = borrower;

    return NextResponse.json({
      user: publicBorrower,
      debts: userDebts
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
