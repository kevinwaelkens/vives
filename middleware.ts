import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Skip middleware for API routes and auth pages
    if (
      path.startsWith("/api/") ||
      path.startsWith("/login") ||
      path.startsWith("/register")
    ) {
      return NextResponse.next();
    }

    // If no token, let NextAuth handle the redirect
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Admin only routes
    const adminRoutes = ["/admin", "/settings", "/cms"];
    const isAdminRoute = adminRoutes.some((route) => path.startsWith(route));

    if (isAdminRoute && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Tutor and Admin routes
    const tutorRoutes = ["/students", "/groups", "/tasks", "/assessments"];
    const isTutorRoute = tutorRoutes.some((route) => path.startsWith(route));

    if (isTutorRoute && !["ADMIN", "TUTOR"].includes(token?.role as string)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login/register pages without token
        const path = req.nextUrl.pathname;
        if (path.startsWith("/login") || path.startsWith("/register")) {
          return true;
        }
        // For protected routes, require a valid token
        return !!token;
      },
    },
  },
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/students/:path*",
    "/groups/:path*",
    "/tasks/:path*",
    "/assessments/:path*",
    "/attendance/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/cms/:path*",
  ],
};
