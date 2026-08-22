import { cookies } from "next/headers";
import { COOKIE_NAME, TokenPayload, verifyJwt } from "./jwt";
import { prisma } from "./prisma";
import { NextResponse } from "next/server";

/**
 * Gets the current authenticated session payload from cookies
 */
export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyJwt(token);
}

/**
 * Gets the current user with latest details from the database
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      loginId: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      company: true,
      department: true,
      location: true,
      profilePicture: true,
      dateOfJoining: true,
      mustChangePassword: true,
      isActive: true,
      createdAt: true,
    },
  });

  return user;
}

/**
 * Guard for route handlers requiring authentication
 */
export async function requireAuth(): Promise<{ session: TokenPayload; error?: never } | { session?: never; error: NextResponse }> {
  const session = await getSession();
  if (!session) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      ),
    };
  }
  return { session };
}

/**
 * Guard for route handlers requiring ADMIN role
 */
export async function requireAdmin(): Promise<{ session: TokenPayload; error?: never } | { session?: never; error: NextResponse }> {
  const { session, error } = await requireAuth();
  if (error) return { error };

  if (session.role !== "ADMIN") {
    return {
      error: NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      ),
    };
  }

  return { session };
}
