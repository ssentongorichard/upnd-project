import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/register', '/success'];
    if (publicRoutes.includes(path)) {
      return NextResponse.next();
    }

    // If user is not authenticated, redirect to home
    if (!token) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Admin routes require Admin role
    if (path.startsWith('/admin')) {
      const role = token.role as string;
      if (!role || !role.includes('Admin')) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Dashboard routes require authentication (already handled above)
    if (path.startsWith('/dashboard')) {
      return NextResponse.next();
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        const publicRoutes = ['/', '/register', '/success'];
        
        // Allow access to public routes
        if (publicRoutes.includes(path)) {
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
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
