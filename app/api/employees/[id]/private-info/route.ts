import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const updatePrivateInfoSchema = z.object({
  dateOfBirth: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  maritalStatus: z.string().nullable().optional(),
  residingAddress: z.string().nullable().optional(),
  nationality: z.string().nullable().optional(),
  personalEmail: z.string().email("Invalid email").nullable().or(z.literal("")).optional(),
  panNo: z.string().nullable().optional(),
  uanNo: z.string().nullable().optional(),
  expCode: z.string().nullable().optional(),
  bankAccountNumber: z.string().nullable().optional(),
  bankName: z.string().nullable().optional(),
  ifscCode: z.string().nullable().optional(),
});

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
        { error: "Unauthorized to update private information" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = updatePrivateInfoSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = result.data;
    const dob = data.dateOfBirth ? new Date(data.dateOfBirth) : null;

    const updated = await prisma.privateInfo.upsert({
      where: { userId: id },
      create: {
        userId: id,
        dateOfBirth: dob,
        gender: data.gender || null,
        maritalStatus: data.maritalStatus || null,
        residingAddress: data.residingAddress || null,
        nationality: data.nationality || "Indian",
        personalEmail: data.personalEmail || null,
        panNo: data.panNo || null,
        uanNo: data.uanNo || null,
        expCode: data.expCode || null,
        bankAccountNumber: data.bankAccountNumber || null,
        bankName: data.bankName || null,
        ifscCode: data.ifscCode || null,
      },
      update: {
        dateOfBirth: dob,
        gender: data.gender !== undefined ? data.gender : undefined,
        maritalStatus: data.maritalStatus !== undefined ? data.maritalStatus : undefined,
        residingAddress: data.residingAddress !== undefined ? data.residingAddress : undefined,
        nationality: data.nationality !== undefined ? data.nationality : undefined,
        personalEmail: data.personalEmail !== undefined ? (data.personalEmail || null) : undefined,
        panNo: data.panNo !== undefined ? data.panNo : undefined,
        uanNo: data.uanNo !== undefined ? data.uanNo : undefined,
        expCode: data.expCode !== undefined ? data.expCode : undefined,
        bankAccountNumber: data.bankAccountNumber !== undefined ? data.bankAccountNumber : undefined,
        bankName: data.bankName !== undefined ? data.bankName : undefined,
        ifscCode: data.ifscCode !== undefined ? data.ifscCode : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Private details updated successfully",
      privateInfo: updated,
    });
  } catch (error) {
    console.error("PUT /api/employees/[id]/private-info error:", error);
    return NextResponse.json(
      { error: "Failed to update private info" },
      { status: 500 }
    );
  }
}
