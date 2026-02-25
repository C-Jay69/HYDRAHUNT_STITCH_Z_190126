import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Public routes that don't require authentication
        const publicRoutes = ['/', '/login', '/api/auth'];
        const isPublicRoute = publicRoutes.some(
          (route) => pathname === route || pathname.startsWith(route + '/')
        );

        // Allow public routes
        if (isPublicRoute) {
          return true;
        }

        // API routes for unauthenticated access (analyze demo, etc.)
        const publicApiRoutes = ['/api/analyze', '/api/demo'];
        const isPublicApi = publicApiRoutes.some(
          (route) => pathname === route || pathname.startsWith(route)
        );

        if (isPublicApi) {
          return true;
        }

        // Require authentication for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
