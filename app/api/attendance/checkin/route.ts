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

    // Check if attendance already exists for today
    const existing = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: session.id,
          date: today,
        },
      },
    });

    if (existing && existing.checkInTime) {
      return NextResponse.json(
        {
          error: "You have already checked in today at " +
            new Date(existing.checkInTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          attendance: existing,
        },
        { status: 400 }
      );
    }

    const attendance = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: session.id,
          date: today,
        },
      },
      create: {
        employeeId: session.id,
        date: today,
        checkInTime: now,
        status: AttendanceStatus.PRESENT,
      },
      update: {
        checkInTime: now,
        status: AttendanceStatus.PRESENT,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Checked in successfully",
      attendance,
    });
  } catch (error) {
    console.error("POST /api/attendance/checkin error:", error);
    return NextResponse.json(
      { error: "Failed to process check-in" },
      { status: 500 }
    );
  }
}
