import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  try {
    const res = await fetch(`${apiUrl}/api/redirect?from=${encodeURIComponent(pathname)}`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.to) {
        return NextResponse.redirect(new URL(data.to, request.url), data.statusCode || 301);
      }
    }
  } catch {}

  return NextResponse.next();
}

export const config = {
  matcher: ['/category/:path*', '/tags/:path*'],
};
