import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasToken = request.cookies.has('refresh_token') || request.cookies.has('access_token');

  // If going to dashboard without token, redirect to login
  if (pathname.startsWith('/dashboard') && !hasToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If going to login/register with a token, redirect to dashboard
  if ((pathname === '/login' || pathname === '/register' || pathname === '/') && hasToken) {
    return NextResponse.redirect(new URL('/dashboard/overview', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
