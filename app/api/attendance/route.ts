import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date"); // e.g. "2026-08-22"
    const search = searchParams.get("search")?.trim() || "";

    const targetDate = dateParam ? new Date(dateParam) : new Date();
    const dateOnly = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate()
    );

    const whereClause: any = {
      isActive: true,
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { loginId: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
      ];
    }

    const employees = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        loginId: true,
        name: true,
        email: true,
        department: true,
        location: true,
        profilePicture: true,
        attendances: {
          where: {
            date: dateOnly,
          },
          take: 1,
        },
      },
      orderBy: { name: "asc" },
    });

    const records = employees.map((emp) => {
      const att = emp.attendances[0];
      return {
        employeeId: emp.id,
        loginId: emp.loginId,
        name: emp.name,
        email: emp.email,
        department: emp.department,
        location: emp.location,
        profilePicture: emp.profilePicture,
        status: att ? att.status : "ABSENT",
        checkInTime: att?.checkInTime || null,
        checkOutTime: att?.checkOutTime || null,
        workHours: att?.workHours || 0,
        extraHours: att?.extraHours || 0,
      };
    });

    // Summary counts for this date
    const totalEmployees = records.length;
    const presentCount = records.filter(
      (r) => r.status === "PRESENT" || r.status === "HALF_DAY"
    ).length;
    const leaveCount = records.filter((r) => r.status === "LEAVE").length;
    const absentCount = records.filter((r) => r.status === "ABSENT").length;

    return NextResponse.json({
      date: dateOnly.toISOString(),
      summary: {
        totalEmployees,
        presentCount,
        leaveCount,
        absentCount,
      },
      records,
    });
  } catch (error) {
    console.error("GET /api/attendance error:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance records" },
      { status: 500 }
    );
  }
}
