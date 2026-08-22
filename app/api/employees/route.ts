import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { generateLoginId } from "@/lib/generateLoginId";
import { generateTemporaryPassword, hashPassword } from "@/lib/generatePassword";
import { Role, WageType, LeaveType } from "@prisma/client";
import { z } from "zod";

const createEmployeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number is required"),
  department: z.string().min(1, "Department is required"),
  role: z.enum(["EMPLOYEE", "ADMIN"]).default("EMPLOYEE"),
  company: z.string().optional().default("Dayflow Technologies"),
  location: z.string().optional().default("Headquarters"),
  dateOfJoining: z.string().optional(),
  monthlyWage: z.number().optional().default(50000),
});

export async function GET(request: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const department = searchParams.get("department")?.trim() || "";

    const today = new Date();
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const whereClause: any = {
      isActive: true,
    };

    if (department && department !== "All") {
      whereClause.department = { equals: department, mode: "insensitive" };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { loginId: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    const employees = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        loginId: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        company: true,
        department: true,
        location: true,
        profilePicture: true,
        dateOfJoining: true,
        attendances: {
          where: {
            date: todayOnly,
          },
          select: {
            status: true,
            checkInTime: true,
            checkOutTime: true,
            workHours: true,
          },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedEmployees = employees.map((emp) => {
      const todayAttendance = emp.attendances[0];
      return {
        id: emp.id,
        loginId: emp.loginId,
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        role: emp.role,
        company: emp.company,
        department: emp.department,
        location: emp.location,
        profilePicture: emp.profilePicture,
        dateOfJoining: emp.dateOfJoining,
        attendanceStatus: todayAttendance ? todayAttendance.status : "ABSENT",
        checkInTime: todayAttendance?.checkInTime || null,
        checkOutTime: todayAttendance?.checkOutTime || null,
      };
    });

    return NextResponse.json({ employees: formattedEmployees });
  } catch (error) {
    console.error("GET /api/employees error:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const result = createEmployeeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      phone,
      department,
      role,
      company,
      location,
      dateOfJoining,
      monthlyWage,
    } = result.data;

    // Check email uniqueness
    const existingEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "An employee with this email already exists." },
        { status: 400 }
      );
    }

    const joiningDate = dateOfJoining ? new Date(dateOfJoining) : new Date();
    const loginId = await generateLoginId(name, joiningDate);
    const plainPassword = generateTemporaryPassword(9);
    const hashedPassword = await hashPassword(plainPassword);

    const yearlyWage = monthlyWage * 12;

    // Run transaction to create User + 1:1 records + default Leave Allocations
    const newEmployee = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          loginId,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone.trim(),
          password: hashedPassword,
          mustChangePassword: true,
          role: role as Role,
          company: company || "Dayflow Technologies",
          department: department.trim(),
          location: location || "Headquarters",
          dateOfJoining: joiningDate,
          isActive: true,
          privateInfo: {
            create: {
              nationality: "Indian",
            },
          },
          resume: {
            create: {
              skills: [],
              certifications: [],
            },
          },
          salaryInfo: {
            create: {
              wageType: WageType.FIXED,
              monthlyWage,
              yearlyWage,
              workingDaysPerWeek: 5,
              breakTimeHours: 1.0,
              basicSalaryPercent: 50.0,
              hraPercent: 20.0,
              standardAllowancePercent: 10.0,
              performanceBonusPercent: 10.0,
              leaveTravelAllowancePercent: 5.0,
              fixedAllowancePercent: 5.0,
              employeePfPercent: 12.0,
              employerPfPercent: 12.0,
              professionalTax: 200.0,
            },
          },
          leaveAllocations: {
            create: [
              { leaveType: LeaveType.PAID_TIME_OFF, totalAllocated: 24, used: 0 },
              { leaveType: LeaveType.SICK_LEAVE, totalAllocated: 7, used: 0 },
              { leaveType: LeaveType.UNPAID_LEAVE, totalAllocated: 0, used: 0 },
            ],
          },
        },
        select: {
          id: true,
          loginId: true,
          name: true,
          email: true,
          role: true,
          department: true,
        },
      });

      return user;
    });

    return NextResponse.json({
      success: true,
      message: "Employee created successfully",
      employee: newEmployee,
      credentials: {
        loginId,
        email: newEmployee.email,
        temporaryPassword: plainPassword, // Return plain temp password ONCE for admin display
      },
    });
  } catch (error) {
    console.error("POST /api/employees error:", error);
    return NextResponse.json(
      { error: "Failed to create employee. Please try again." },
      { status: 500 }
    );
  }
}
