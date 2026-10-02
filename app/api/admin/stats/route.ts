import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, debts, negotiations } from '@/lib/db/schema';
import { sql, eq, count, sum } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { isAdminSession } from '@/lib/auth/admin';

export async function GET() {
  try {
    if (!isAdminSession((await cookies()).get('admin_session')?.value)) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }
    // Total users by role
    const usersByRole = await db
      .select({ role: users.role, count: count() })
      .from(users)
      .groupBy(users.role);

    // Total debts by status
    const debtsByStatus = await db
      .select({ status: debts.status, count: count(), total: sum(debts.amount) })
      .from(debts)
      .groupBy(debts.status);

    // Total debts sum
    const totalDebtResult = await db
      .select({ total: sum(debts.amount), count: count() })
      .from(debts);

    // Total resolved amount
    const resolvedResult = await db
      .select({ total: sum(debts.amount), count: count() })
      .from(debts)
      .where(eq(debts.status, 'resolved'));

    // Total users
    const totalUsersResult = await db.select({ count: count() }).from(users);

    // Total negotiations
    const totalNegotiationsResult = await db.select({ count: count() }).from(negotiations);

    // Recent 10 debts
    const recentDebts = await db
      .select({
        id: debts.id,
        amount: debts.amount,
        status: debts.status,
        description: debts.description,
        currency: debts.currency,
        createdAt: debts.createdAt,
      })
      .from(debts)
      .orderBy(sql`${debts.createdAt} desc`)
      .limit(10);

    // Recent users
    const recentUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(sql`${users.createdAt} desc`)
      .limit(10);

    return NextResponse.json({
      summary: {
        totalUsers: totalUsersResult[0]?.count ?? 0,
        totalDebts: totalDebtResult[0]?.count ?? 0,
        totalAmount: totalDebtResult[0]?.total ?? 0,
        resolvedAmount: resolvedResult[0]?.total ?? 0,
        resolvedCount: resolvedResult[0]?.count ?? 0,
        totalNegotiations: totalNegotiationsResult[0]?.count ?? 0,
      },
      usersByRole,
      debtsByStatus,
      recentDebts,
      recentUsers,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Ошибка получения статистики' }, { status: 500 });
  }
}
