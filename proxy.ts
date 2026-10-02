import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { readSession, SESSION_COOKIE } from '@/lib/auth/session';
import { isAdminSession } from '@/lib/auth/request';

const userProtectedRoutes = ['/dashboard', '/creditor', '/collector'];
const authRoutes = ['/auth/login', '/auth/register'];
const roleHome: Record<string, string> = {
  borrower: '/dashboard',
  creditor: '/creditor',
  collector: '/collector',
  lawyer: '/dashboard/legal',
  ombudsman: '/dashboard',
};
const roleProtectedRoutes = [
  { route: '/creditor', roles: ['creditor'] },
  { route: '/collector', roles: ['collector'] },
];

function startsWithRoute(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;

  const isAdminSubdomain = hostname.startsWith('admin.');

  if (isAdminSubdomain && !pathname.startsWith('/admin')) {
    const url = request.nextUrl.clone();
    url.pathname = `/admin${pathname === '/' ? '' : pathname}`;
    return NextResponse.rewrite(url);
  }

  if (pathname.startsWith('/admin')) {
    const isLoginPage = pathname === '/admin/login';
    const adminSession = request.cookies.get('admin_session');

    if (isLoginPage) {
      if (isAdminSession(adminSession?.value)) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    if (!isAdminSession(adminSession?.value)) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return NextResponse.next();
  }

  const session = await readSession(request.cookies.get(SESSION_COOKIE)?.value);
  const isUserProtectedRoute = startsWithRoute(pathname, userProtectedRoutes);
  const isAuthRoute = startsWithRoute(pathname, authRoutes);

  if (isUserProtectedRoute && !session?.userId) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (isUserProtectedRoute && session?.role) {
    const requirement = roleProtectedRoutes.find(({ route }) => startsWithRoute(pathname, [route]));
    if (requirement && !requirement.roles.includes(session.role)) {
      return NextResponse.redirect(new URL(roleHome[session.role] || '/dashboard', request.url));
    }
  }

  if (isAuthRoute && session?.userId) {
    return NextResponse.redirect(new URL(roleHome[session.role || ''] || '/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/dashboard/:path*', '/creditor/:path*', '/collector/:path*', '/auth/:path*'],
};
