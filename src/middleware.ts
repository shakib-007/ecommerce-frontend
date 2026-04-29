import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Protected routes — require login
  const protectedRoutes  = ['/dashboard', '/checkout'];
  const adminRoutes      = ['/admin'];
  const authRoutes       = ['/login', '/register'];

  const isProtected = protectedRoutes.some(r => pathname.startsWith(r));
  const isAdmin     = adminRoutes.some(r => pathname.startsWith(r));
  const isAuthPage  = authRoutes.some(r => pathname.startsWith(r));

  // Redirect to login if not authenticated
  if ((isProtected || isAdmin) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect away from login/register if already authenticated
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/checkout/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
};