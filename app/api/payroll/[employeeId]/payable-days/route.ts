import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { calculatePayableDays } from "@/lib/calculatePayableDays";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { employeeId: string } }
) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { employeeId } = params;
    if (!employeeId) {
      return NextResponse.json(
        { error: "Employee ID is required" },
        { status: 400 }
      );
    }

    const isSelf = session.id === employeeId;
    const isAdmin = session.role === "ADMIN";

    if (!isAdmin && !isSelf) {
      return NextResponse.json(
        { error: "Forbidden. Access to payable days record is restricted." },
        { status: 403 }
      );
    }

    // Verify employee exists
    const employee = await prisma.user.findUnique({
      where: { id: employeeId },
      select: { id: true, name: true, loginId: true, email: true },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month") || undefined;
    const yearParam = searchParams.get("year")
      ? parseInt(searchParams.get("year")!, 10)
      : undefined;

    const payableDaysData = await calculatePayableDays(
      employeeId,
      monthParam,
      yearParam
    );

    return NextResponse.json({
      success: true,
      employee: {
        id: employee.id,
        name: employee.name,
        loginId: employee.loginId,
        email: employee.email,
      },
      ...payableDaysData,
    });
  } catch (error) {
    console.error("GET /api/payroll/[employeeId]/payable-days error:", error);
    return NextResponse.json(
      { error: "Failed to calculate payable days for employee" },
      { status: 500 }
    );
  }
}
