import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword } from "@/lib/generatePassword";
import { COOKIE_NAME, signJwt } from "@/lib/jwt";
import { z } from "zod";

const loginSchema = z.object({
  identifier: z.string().min(1, "Login ID or Email is required"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { identifier, password } = result.data;
    const cleanId = identifier.trim();

    // Look up user by loginId or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { loginId: { equals: cleanId, mode: "insensitive" } },
          { email: { equals: cleanId, mode: "insensitive" } },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid login credentials" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Your account is deactivated. Please contact HR." },
        { status: 403 }
      );
    }

    let isMatch = await comparePassword(password, user.password);
    if (!isMatch && password !== password.trim()) {
      isMatch = await comparePassword(password.trim(), user.password);
    }
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid login credentials" },
        { status: 401 }
      );
    }

    const tokenPayload = {
      id: user.id,
      loginId: user.loginId,
      email: user.email,
      name: user.name,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      department: user.department,
      company: user.company,
      profilePicture: user.profilePicture,
    };

    const token = signJwt(tokenPayload);

    const response = NextResponse.json({
      success: true,
      user: tokenPayload,
      mustChangePassword: user.mustChangePassword,
    });

    // Set secure httpOnly cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
