import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { calculateSalaryBreakdown } from "@/lib/calculateSalary";
import { WageType } from "@prisma/client";
import { z } from "zod";

const updateSalarySchema = z.object({
  wageType: z.nativeEnum(WageType).default(WageType.FIXED),
  monthlyWage: z.number().min(0, "Monthly wage must be positive"),
  yearlyWage: z.number().min(0).optional(),
  workingDaysPerWeek: z.number().min(1).max(7).default(5),
  breakTimeHours: z.number().min(0).max(8).default(1),
  basicSalaryPercent: z.number().min(0).max(100),
  hraPercent: z.number().min(0).max(100),
  standardAllowancePercent: z.number().min(0).max(100),
  performanceBonusPercent: z.number().min(0).max(100),
  leaveTravelAllowancePercent: z.number().min(0).max(100),
  fixedAllowancePercent: z.number().min(0).max(100),
  employeePfPercent: z.number().min(0).max(100).default(12),
  employerPfPercent: z.number().min(0).max(100).default(12),
  professionalTax: z.number().min(0).default(200),
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

    if (!isAdmin && !isSelf) {
      return NextResponse.json(
        { error: "Forbidden. Access to salary information is restricted." },
        { status: 403 }
      );
    }

    const salaryInfo = await prisma.salaryInfo.findUnique({
      where: { userId: id },
    });

    if (!salaryInfo) {
      return NextResponse.json(
        { error: "Salary record not found for this employee" },
        { status: 404 }
      );
    }

    const breakdown = calculateSalaryBreakdown(salaryInfo);

    return NextResponse.json({
      salaryInfo,
      breakdown,
    });
  } catch (error) {
    console.error("GET /api/employees/[id]/salary error:", error);
    return NextResponse.json(
      { error: "Failed to fetch salary information" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;

    const { id } = params;
    const body = await request.json();
    const result = updateSalarySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = result.data;

    // Validate percentage sum <= 100%
    const totalPercent =
      data.basicSalaryPercent +
      data.hraPercent +
      data.standardAllowancePercent +
      data.performanceBonusPercent +
      data.leaveTravelAllowancePercent +
      data.fixedAllowancePercent;

    if (totalPercent > 100.001) {
      return NextResponse.json(
        {
          error: `Total component percentage (${totalPercent.toFixed(
            2
          )}%) cannot exceed 100%. Please adjust percentages.`,
        },
        { status: 400 }
      );
    }

    const yearlyWage = data.yearlyWage || data.monthlyWage * 12;

    const updated = await prisma.salaryInfo.upsert({
      where: { userId: id },
      create: {
        userId: id,
        wageType: data.wageType,
        monthlyWage: data.monthlyWage,
        yearlyWage,
        workingDaysPerWeek: data.workingDaysPerWeek,
        breakTimeHours: data.breakTimeHours,
        basicSalaryPercent: data.basicSalaryPercent,
        hraPercent: data.hraPercent,
        standardAllowancePercent: data.standardAllowancePercent,
        performanceBonusPercent: data.performanceBonusPercent,
        leaveTravelAllowancePercent: data.leaveTravelAllowancePercent,
        fixedAllowancePercent: data.fixedAllowancePercent,
        employeePfPercent: data.employeePfPercent,
        employerPfPercent: data.employerPfPercent,
        professionalTax: data.professionalTax,
      },
      update: {
        wageType: data.wageType,
        monthlyWage: data.monthlyWage,
        yearlyWage,
        workingDaysPerWeek: data.workingDaysPerWeek,
        breakTimeHours: data.breakTimeHours,
        basicSalaryPercent: data.basicSalaryPercent,
        hraPercent: data.hraPercent,
        standardAllowancePercent: data.standardAllowancePercent,
        performanceBonusPercent: data.performanceBonusPercent,
        leaveTravelAllowancePercent: data.leaveTravelAllowancePercent,
        fixedAllowancePercent: data.fixedAllowancePercent,
        employeePfPercent: data.employeePfPercent,
        employerPfPercent: data.employerPfPercent,
        professionalTax: data.professionalTax,
      },
    });

    const breakdown = calculateSalaryBreakdown(updated);

    return NextResponse.json({
      success: true,
      message: "Salary details updated successfully",
      salaryInfo: updated,
      breakdown,
    });
  } catch (error) {
    console.error("PUT /api/employees/[id]/salary error:", error);
    return NextResponse.json(
      { error: "Failed to update salary details" },
      { status: 500 }
    );
  }
}
