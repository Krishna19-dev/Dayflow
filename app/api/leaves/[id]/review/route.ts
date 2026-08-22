import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { LeaveStatus, AttendanceStatus } from "@prisma/client";
import { z } from "zod";

const reviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  reviewComment: z.string().optional().nullable(),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;

    const { id } = params;
    const body = await request.json();
    const result = reviewSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { status, reviewComment } = result.data;

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!leaveRequest) {
      return NextResponse.json(
        { error: "Leave request not found" },
        { status: 404 }
      );
    }

    if (leaveRequest.status !== LeaveStatus.PENDING) {
      return NextResponse.json(
        { error: `This leave request has already been ${leaveRequest.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Execute in a transaction
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update the leave request status and reviewer
      const updatedReq = await tx.leaveRequest.update({
        where: { id },
        data: {
          status: status as LeaveStatus,
          reviewedById: session.id,
          reviewComment: reviewComment || null,
        },
      });

      // 2. If approved, increment LeaveAllocation.used and generate LEAVE attendance records for dates
      if (status === "APPROVED") {
        await tx.leaveAllocation.updateMany({
          where: {
            employeeId: leaveRequest.employeeId,
            leaveType: leaveRequest.leaveType,
          },
          data: {
            used: {
              increment: leaveRequest.allocationDays,
            },
          },
        });

        // Generate attendance records for weekdays in the date range
        const curDate = new Date(leaveRequest.startDate);
        const endDate = new Date(leaveRequest.endDate);

        while (curDate <= endDate) {
          const dayOfWeek = curDate.getDay();
          // Exclude weekends (Sunday=0, Saturday=6)
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            const dateOnly = new Date(
              curDate.getFullYear(),
              curDate.getMonth(),
              curDate.getDate()
            );

            await tx.attendance.upsert({
              where: {
                employeeId_date: {
                  employeeId: leaveRequest.employeeId,
                  date: dateOnly,
                },
              },
              create: {
                employeeId: leaveRequest.employeeId,
                date: dateOnly,
                status: AttendanceStatus.LEAVE,
                workHours: 0,
                extraHours: 0,
              },
              update: {
                status: AttendanceStatus.LEAVE,
                workHours: 0,
                extraHours: 0,
              },
            });
          }
          curDate.setDate(curDate.getDate() + 1);
        }
      }

      return updatedReq;
    });

    return NextResponse.json({
      success: true,
      message: `Leave request ${status.toLowerCase()} successfully`,
      leaveRequest: updated,
    });
  } catch (error) {
    console.error("PUT /api/leaves/[id]/review error:", error);
    return NextResponse.json(
      { error: "Failed to review leave request" },
      { status: 500 }
    );
  }
}
