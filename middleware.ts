import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Admin only routes
    const adminRoutes = ['/admin', '/settings', '/cms']
    const isAdminRoute = adminRoutes.some(route => path.startsWith(route))
    
    if (isAdminRoute && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    // Tutor and Admin routes
    const tutorRoutes = ['/students', '/groups', '/tasks', '/assessments']
    const isTutorRoute = tutorRoutes.some(route => path.startsWith(route))
    
    if (isTutorRoute && !['ADMIN', 'TUTOR'].includes(token?.role as string)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/students/:path*',
    '/groups/:path*',
    '/tasks/:path*',
    '/assessments/:path*',
    '/attendance/:path*',
    '/analytics/:path*',
    '/settings/:path*',
    '/admin/:path*',
    '/cms/:path*',
  ],
}
