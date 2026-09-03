import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasCookie = req.cookies.has('access_token');
  const isLogin = pathname === '/admin/login' || pathname === '/admin/login/';

  // Guard /admin/* : redirect unauthenticated users to the login page.
  // /admin/login itself is excluded so it never redirects to itself.
  if (!isLogin && !hasCookie) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
