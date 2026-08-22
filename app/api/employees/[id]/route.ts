import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { calculateSalaryBreakdown } from "@/lib/calculateSalary";
import { z } from "zod";

const updateEmployeeSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(5).optional(),
  department: z.string().min(1).optional(),
  location: z.string().optional(),
  company: z.string().optional(),
  profilePicture: z.string().nullable().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { id } = params;
    const isSelf = session.id === id;
    const isAdmin = session.role === "ADMIN";

    const employee = await prisma.user.findUnique({
      where: { id },
      include: {
        privateInfo: true,
        resume: true,
        salaryInfo: isAdmin || isSelf, // Visible to ADMIN or employee viewing own profile
        manager: {
          select: { id: true, name: true, email: true, department: true },
        },
        leaveAllocations: isSelf || isAdmin,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    // Omit password hash and sensitive salary details from response
    const { password, ...safeEmployee } = employee;

    let salaryWithCalculations = null;
    if ((isAdmin || isSelf) && safeEmployee.salaryInfo) {
      const breakdown = calculateSalaryBreakdown(safeEmployee.salaryInfo);
      salaryWithCalculations = {
        ...safeEmployee.salaryInfo,
        breakdown,
      };
    }

    return NextResponse.json({
      employee: {
        ...safeEmployee,
        salaryInfo: salaryWithCalculations,
        isSelf,
        isAdmin,
        canEdit: isSelf || isAdmin,
      },
    });
  } catch (error) {
    console.error("GET /api/employees/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch employee profile" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { id } = params;
    const isSelf = session.id === id;
    const isAdmin = session.role === "ADMIN";

    if (!isSelf && !isAdmin) {
      return NextResponse.json(
        { error: "You are not authorized to update this profile" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = updateEmployeeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    // Only admin can update department/company/location
    const updateData: any = {};
    if (result.data.name) updateData.name = result.data.name.trim();
    if (result.data.phone) updateData.phone = result.data.phone.trim();
    if (result.data.profilePicture !== undefined) updateData.profilePicture = result.data.profilePicture;

    if (isAdmin) {
      if (result.data.department) updateData.department = result.data.department.trim();
      if (result.data.location) updateData.location = result.data.location.trim();
      if (result.data.company) updateData.company = result.data.company.trim();
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        loginId: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        department: true,
        location: true,
        company: true,
        profilePicture: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      employee: updated,
    });
  } catch (error) {
    console.error("PUT /api/employees/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update employee details" },
      { status: 500 }
    );
  }
}
