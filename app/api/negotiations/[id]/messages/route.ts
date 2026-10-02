import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { debts, messages, negotiations } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth/request';

async function getAccess(id: string, userId: string) {
  const negotiation = await db.select().from(negotiations).where(eq(negotiations.id, id)).get();
  if (!negotiation) return null;
  const debt = await db.select().from(debts).where(eq(debts.id, negotiation.debtId)).get();
  if (!debt || ![debt.borrowerId, debt.creditorId, debt.collectorId].includes(userId)) return null;
  return negotiation;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  const { id } = await context.params;
  if (!(await getAccess(id, user.id))) return NextResponse.json({ error: 'Диалог не найден' }, { status: 404 });
  return NextResponse.json({ messages: await db.select().from(messages).where(eq(messages.negotiationId, id)).all() });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    const { id } = await context.params;
    if (!(await getAccess(id, user.id))) return NextResponse.json({ error: 'Диалог не найден' }, { status: 404 });
    const { content } = await request.json();
    if (typeof content !== 'string' || !content.trim()) return NextResponse.json({ error: 'Сообщение пустое' }, { status: 400 });
    const [message] = await db.insert(messages).values({ negotiationId: id, senderId: user.id, content: content.trim() }).returning();
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Create message error:', error);
    return NextResponse.json({ error: 'Не удалось отправить сообщение' }, { status: 500 });
  }
}
