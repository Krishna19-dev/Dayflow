import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month"); // e.g. "2026-08" or index 0-11
    const yearParam = searchParams.get("year");

    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth(); // 0-indexed

    if (monthParam) {
      if (monthParam.includes("-")) {
        const parts = monthParam.split("-");
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
      } else {
        month = parseInt(monthParam, 10);
      }
    }
    if (yearParam) {
      year = parseInt(yearParam, 10);
    }

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const attendances = await prisma.attendance.findMany({
      where: {
        employeeId: session.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: "asc" },
    });

    // Compute total working days (Mon-Fri) in this month
    let totalWorkingDays = 0;
    const daysInMonth = endDate.getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        totalWorkingDays++;
      }
    }

    const daysPresent = attendances.filter(
      (a) => a.status === "PRESENT" || a.status === "HALF_DAY"
    ).length;
    const leavesCount = attendances.filter((a) => a.status === "LEAVE").length;
    const absentCount = attendances.filter((a) => a.status === "ABSENT").length;
    const totalWorkHours = +attendances
      .reduce((sum, a) => sum + (a.workHours || 0), 0)
      .toFixed(2);
    const totalExtraHours = +attendances
      .reduce((sum, a) => sum + (a.extraHours || 0), 0)
      .toFixed(2);

    // Also get today's record for quick header widget
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayRecord = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: session.id,
          date: today,
        },
      },
    });

    return NextResponse.json({
      month: month + 1,
      year,
      summary: {
        daysPresent,
        leavesCount,
        absentCount,
        totalWorkingDays,
        totalWorkHours,
        totalExtraHours,
      },
      todayRecord,
      attendances,
    });
  } catch (error) {
    console.error("GET /api/attendance/me error:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance history" },
      { status: 500 }
    );
  }
}
