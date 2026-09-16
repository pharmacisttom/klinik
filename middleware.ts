import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/security/rate-limit';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.ip ?? request.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';

  // 1. Rate Limiting Check
  if (pathname.startsWith('/api/login') || pathname.startsWith('/api/auth')) {
    const rateLimit = await checkRateLimit(ip, 'LOGIN');
    if (!rateLimit.success) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many login attempts. Please try again in 1 minute.' }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '60' } }
      );
    }
  } else if (pathname.startsWith('/api/otp')) {
    const rateLimit = await checkRateLimit(ip, 'OTP');
    if (!rateLimit.success) {
      return new NextResponse(
        JSON.stringify({ error: 'OTP request rate limit exceeded.' }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '300' } }
      );
    }
  } else if (pathname.startsWith('/api/')) {
    const rateLimit = await checkRateLimit(ip, 'API');
    if (!rateLimit.success) {
      return new NextResponse(
        JSON.stringify({ error: 'API rate limit exceeded.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // 2. CSRF Protection for mutating methods (POST, PUT, DELETE, PATCH)
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const originHeader = request.headers.get('origin');
    const hostHeader = request.headers.get('host');
    if (originHeader && hostHeader) {
      const originHost = new URL(originHeader).host;
      if (originHost !== hostHeader) {
        return new NextResponse(
          JSON.stringify({ error: 'Cross-Site Request Forgery (CSRF) blocked.' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }

  // 3. Authentication Check for Frontend and Protected Routes
  const publicRoutes = ['/login', '/pdpa/data-request', '/admin/license'];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const sessionCookie = request.cookies.get('tomvis_session');

  if (!sessionCookie && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (sessionCookie && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const response = NextResponse.next();

  // 4. Security Headers Hardening
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self' data:; connect-src 'self' https:;"
  );

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};

