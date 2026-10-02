import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { debts, users } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth/request';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const condition = user.role === 'creditor'
      ? eq(debts.creditorId, user.id)
      : user.role === 'collector'
        ? eq(debts.collectorId, user.id)
        : eq(debts.borrowerId, user.id);
    const userDebts = await db.select().from(debts).where(condition).all();
    const debtsWithBorrowers = await Promise.all(userDebts.map(async (debt) => ({
      ...debt,
      borrower: await db.select({ id: users.id, name: users.name, email: users.email })
        .from(users).where(eq(users.id, debt.borrowerId)).get(),
    })));

    return NextResponse.json({
      user: user.public,
      debts: debtsWithBorrowers
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    if (user.role !== 'borrower') {
      return NextResponse.json({ error: 'Создавать дело может только заёмщик' }, { status: 403 });
    }

    const body = await request.json();
    const amount = Number(body.amount);
    const creditorId = typeof body.creditorId === 'string' ? body.creditorId : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    if (!Number.isFinite(amount) || amount <= 0 || !creditorId || !description) {
      return NextResponse.json({ error: 'Укажите сумму, кредитора и описание' }, { status: 400 });
    }

    const creditor = await db.select({ id: users.id }).from(users)
      .where(and(eq(users.id, creditorId), eq(users.role, 'creditor'))).get();
    if (!creditor) return NextResponse.json({ error: 'Кредитор не найден' }, { status: 404 });

    const [created] = await db.insert(debts).values({
      borrowerId: user.id,
      creditorId,
      amount,
      currency: typeof body.currency === 'string' ? body.currency : 'KZT',
      description,
      status: 'active',
    }).returning();

    return NextResponse.json({ debt: created }, { status: 201 });
  } catch (error) {
    console.error('Create debt error:', error);
    return NextResponse.json({ error: 'Не удалось создать дело' }, { status: 500 });
  }
}
