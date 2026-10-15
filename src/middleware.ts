import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_NAME, verifySessionEdge } from './lib/session-edge';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Exclude public static files, icons, and unlock screen
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/unlock' ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Check session cookie
  const sessionToken = request.cookies.get(COOKIE_NAME)?.value;
  const isValid = await verifySessionEdge(sessionToken);

  if (!isValid) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'PIN_REQUIRED', message: 'Sesi belum dibuka. Silakan masukkan PIN.' },
        { status: 401 }
      );
    }

    const unlockUrl = new URL('/unlock', request.url);
    if (pathname !== '/') {
      unlockUrl.searchParams.set('from', pathname);
    }
    return NextResponse.redirect(unlockUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};
