import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { debts, negotiations, users, messages } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth/request';

async function getVisibleNegotiations(userId: string) {
  const visibleDebts = await db.select().from(debts).where(eq(debts.borrowerId, userId)).all();
  const creditorDebts = await db.select().from(debts).where(eq(debts.creditorId, userId)).all();
  const collectorDebts = await db.select().from(debts).where(eq(debts.collectorId, userId)).all();
  const debtMap = new Map([...visibleDebts, ...creditorDebts, ...collectorDebts].map((debt) => [debt.id, debt]));
  const rows = await db.select().from(negotiations).orderBy(desc(negotiations.createdAt)).all();
  const result = [];

  for (const negotiation of rows) {
    const debt = debtMap.get(negotiation.debtId);
    if (!debt) continue;
    const borrower = await db.select({ id: users.id, name: users.name, role: users.role }).from(users).where(eq(users.id, debt.borrowerId)).get();
    const creditor = await db.select({ id: users.id, name: users.name, role: users.role }).from(users).where(eq(users.id, debt.creditorId)).get();
    const lastMessage = await db.select().from(messages).where(eq(messages.negotiationId, negotiation.id)).orderBy(desc(messages.createdAt)).limit(1).get();
    const partner = debt.borrowerId === userId ? creditor : borrower;
    result.push({ ...negotiation, debt, partner, lastMessage });
  }
  return result;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  return NextResponse.json({ negotiations: await getVisibleNegotiations(user.id) });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    const { debtId } = await request.json();
    const debt = await db.select().from(debts).where(eq(debts.id, debtId)).get();
    if (!debt || ![debt.borrowerId, debt.creditorId, debt.collectorId].includes(user.id)) {
      return NextResponse.json({ error: 'Дело не найдено' }, { status: 404 });
    }
    const existing = await db.select().from(negotiations).where(eq(negotiations.debtId, debt.id)).get();
    if (existing) return NextResponse.json({ negotiation: existing });
    const [negotiation] = await db.insert(negotiations).values({ debtId: debt.id, status: 'open' }).returning();
    await db.update(debts).set({ status: 'negotiation' }).where(eq(debts.id, debt.id));
    return NextResponse.json({ negotiation }, { status: 201 });
  } catch (error) {
    console.error('Create negotiation error:', error);
    return NextResponse.json({ error: 'Не удалось открыть переговоры' }, { status: 500 });
  }
}
