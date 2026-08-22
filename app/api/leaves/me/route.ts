import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const leaves = await prisma.leaveRequest.findMany({
      where: { employeeId: session.id },
      include: {
        reviewedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ leaves });
  } catch (error) {
    console.error("GET /api/leaves/me error:", error);
    return NextResponse.json(
      { error: "Failed to fetch your leave requests" },
      { status: 500 }
    );
  }
}
