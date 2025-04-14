import { createRouteMatcher } from '@clerk/nextjs/server';
import { errorMessage } from '@/lib/util/general/string-util';
import { NextRequest, NextResponse } from 'next/server';
import { decodeToken } from '@/lib/util/server/middleware-util';

const allowedOrigins: string[] = ['https://sunkist-studio-next.vercel.app'];
const protectedRoutes = createRouteMatcher(['/api/v1(.*)']);

export default function middleware(req: NextRequest) {
  try {
    const origin = req.headers.get('origin') ?? '';
    const allowOrigin = process.env.NODE_ENV === 'development' ? '*' : allowedOrigins.includes(origin) ? origin : '';

    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': allowOrigin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, x-app-id, x-app-code, Authorization',
        },
      });
    }

    const response = NextResponse.next();

    if (protectedRoutes(req)) {
      const authHeader: string | null = req.headers.get('Authorization');
      if (!authHeader) throw new Error('Unauthorized access');

      const decoded = decodeToken(authHeader);
      response.headers.set('x-org-id', decoded?.org_id);
      response.headers.set('x-org-role', decoded?.org_role);
    }

    response.headers.set('Access-Control-Allow-Origin', allowOrigin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    return response;
  } catch (error) {
    console.error(errorMessage(error));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
