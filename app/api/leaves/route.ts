import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { LeaveType, LeaveStatus } from "@prisma/client";
import { z } from "zod";

const createLeaveSchema = z.object({
  leaveType: z.nativeEnum(LeaveType),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  allocationDays: z.number().min(0.5, "Minimum leave duration is 0.5 days"),
  attachmentUrl: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status")?.trim();
    const search = searchParams.get("search")?.trim();

    const whereClause: any = {};

    if (status && status !== "ALL") {
      whereClause.status = status as LeaveStatus;
    }

    if (search) {
      whereClause.employee = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { loginId: { contains: search, mode: "insensitive" } },
          { department: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const leaves = await prisma.leaveRequest.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            id: true,
            loginId: true,
            name: true,
            email: true,
            department: true,
            profilePicture: true,
          },
        },
        reviewedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ leaves });
  } catch (error) {
    console.error("GET /api/leaves error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leave requests" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const result = createLeaveSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { leaveType, startDate, endDate, allocationDays, attachmentUrl } =
      result.data;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return NextResponse.json(
        { error: "End date cannot be earlier than start date." },
        { status: 400 }
      );
    }

    // Check remaining allocation for this leave type (unless unpaid)
    if (leaveType !== LeaveType.UNPAID_LEAVE) {
      const allocation = await prisma.leaveAllocation.findUnique({
        where: {
          employeeId_leaveType: {
            employeeId: session.id,
            leaveType,
          },
        },
      });

      const remaining = allocation
        ? allocation.totalAllocated - allocation.used
        : 0;

      if (remaining < allocationDays) {
        return NextResponse.json(
          {
            error: `Insufficient leave balance. You have ${remaining} days remaining for ${leaveType.replace(
              /_/g,
              " "
            )}, but requested ${allocationDays} days.`,
          },
          { status: 400 }
        );
      }
    }

    // Create the leave request
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId: session.id,
        leaveType,
        startDate: start,
        endDate: end,
        allocationDays,
        attachmentUrl: attachmentUrl || null,
        status: LeaveStatus.PENDING,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Leave request submitted successfully",
      leaveRequest,
    });
  } catch (error) {
    console.error("POST /api/leaves error:", error);
    return NextResponse.json(
      { error: "Failed to submit leave request" },
      { status: 500 }
    );
  }
}
