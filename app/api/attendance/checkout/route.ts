import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { AttendanceStatus } from "@prisma/client";

export async function POST() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const existing = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: session.id,
          date: today,
        },
      },
    });

    if (!existing || !existing.checkInTime) {
      return NextResponse.json(
        { error: "You must check in first before checking out." },
        { status: 400 }
      );
    }

    if (existing.checkOutTime) {
      return NextResponse.json(
        {
          error: "You have already checked out today at " +
            new Date(existing.checkOutTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          attendance: existing,
        },
        { status: 400 }
      );
    }

    const checkInMs = new Date(existing.checkInTime).getTime();
    const checkOutMs = now.getTime();
    const totalHours = Math.max(0, +((checkOutMs - checkInMs) / (1000 * 60 * 60)).toFixed(2));

    // Standard work day is 8 hours
    const standardHours = Math.min(totalHours, 8.0);
    const extraHours = Math.max(0, +(totalHours - 8.0).toFixed(2));

    // If worked less than 4.5 hours, mark as HALF_DAY
    let status: AttendanceStatus = AttendanceStatus.PRESENT;
    if (totalHours < 4.5) {
      status = AttendanceStatus.HALF_DAY;
    }

    const attendance = await prisma.attendance.update({
      where: {
        employeeId_date: {
          employeeId: session.id,
          date: today,
        },
      },
      data: {
        checkOutTime: now,
        workHours: totalHours,
        extraHours: extraHours,
        status: status,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Checked out successfully",
      attendance,
      summary: {
        totalHours,
        standardHours,
        extraHours,
      },
    });
  } catch (error) {
    console.error("POST /api/attendance/checkout error:", error);
    return NextResponse.json(
      { error: "Failed to process check-out" },
      { status: 500 }
    );
  }
}
