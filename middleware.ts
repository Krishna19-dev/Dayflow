import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "dayflow-super-secret-hrms-key-2026-secure";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);
const COOKIE_NAME = "dayflow_token";

interface EdgeTokenPayload {
  id: string;
  loginId: string;
  email: string;
  role: "EMPLOYEE" | "ADMIN";
  mustChangePassword: boolean;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  let session: EdgeTokenPayload | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      session = payload as unknown as EdgeTokenPayload;
    } catch {
      session = null;
    }
  }

  // Public asset or API routes pass through
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/logout") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // If user is accessing login page
  if (pathname === "/login") {
    if (session) {
      if (session.mustChangePassword) {
        return NextResponse.redirect(new URL("/change-password", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Root path redirect
  if (pathname === "/") {
    if (session) {
      if (session.mustChangePassword) {
        return NextResponse.redirect(new URL("/change-password", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Protected application routes
  if (pathname.startsWith("/dashboard") || pathname === "/change-password") {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Force password change rule
    if (session.mustChangePassword && pathname !== "/change-password") {
      return NextResponse.redirect(new URL("/change-password", request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
