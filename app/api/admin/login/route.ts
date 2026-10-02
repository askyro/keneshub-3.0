import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Пароль обязателен' }, { status: 400 });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminSessionSecret = process.env.ADMIN_SESSION_SECRET;
    if (!adminPassword || !adminSessionSecret) {
      return NextResponse.json({ error: 'Админ-панель не настроена' }, { status: 503 });
    }

    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_session', adminSessionSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
