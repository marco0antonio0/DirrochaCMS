import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './services/auth';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value; 

  if (!token || !verifyToken(token)) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/protected/:path*'],
};
