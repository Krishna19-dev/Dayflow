import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { LeaveType } from "@prisma/client";

export async function GET() {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    let allocations = await prisma.leaveAllocation.findMany({
      where: { employeeId: session.id },
    });

    // If user doesn't have allocations yet, initialize default ones
    if (allocations.length === 0) {
      await prisma.leaveAllocation.createMany({
        data: [
          { employeeId: session.id, leaveType: LeaveType.PAID_TIME_OFF, totalAllocated: 24, used: 0 },
          { employeeId: session.id, leaveType: LeaveType.SICK_LEAVE, totalAllocated: 7, used: 0 },
          { employeeId: session.id, leaveType: LeaveType.UNPAID_LEAVE, totalAllocated: 0, used: 0 },
        ],
        skipDuplicates: true,
      });

      allocations = await prisma.leaveAllocation.findMany({
        where: { employeeId: session.id },
      });
    }

    const formatted = allocations.map((alloc) => ({
      id: alloc.id,
      leaveType: alloc.leaveType,
      totalAllocated: alloc.totalAllocated,
      used: alloc.used,
      remaining: Math.max(0, alloc.totalAllocated - alloc.used),
    }));

    return NextResponse.json({ allocations: formatted });
  } catch (error) {
    console.error("GET /api/leaves/allocations/me error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leave allocations" },
      { status: 500 }
    );
  }
}
