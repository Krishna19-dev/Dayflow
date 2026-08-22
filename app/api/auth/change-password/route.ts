import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { comparePassword, hashPassword } from "@/lib/generatePassword";
import { COOKIE_NAME, signJwt } from "@/lib/jwt";
import { z } from "zod";

const changePasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters long"),
});

export async function POST(request: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const result = changePasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = result.data;

    // Fetch existing user to verify current password if provided and not in forced reset state
    const user = await prisma.user.findUnique({
      where: { id: session.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (currentPassword) {
      const isMatch = await comparePassword(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await hashPassword(newPassword);

    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    });

    const updatedPayload = {
      id: updatedUser.id,
      loginId: updatedUser.loginId,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      mustChangePassword: false,
      department: updatedUser.department,
      company: updatedUser.company,
      profilePicture: updatedUser.profilePicture,
    };

    const token = signJwt(updatedPayload);

    const response = NextResponse.json({
      success: true,
      message: "Password updated successfully",
      user: updatedPayload,
    });

    // Update cookie with updated mustChangePassword = false
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    );
  }
}
