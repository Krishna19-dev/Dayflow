import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const updateResumeSchema = z.object({
  about: z.string().nullable().optional(),
  skills: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  interestsAndHobbies: z.string().nullable().optional(),
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
        { error: "Unauthorized to update resume details" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = updateResumeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = result.data;

    const updated = await prisma.resume.upsert({
      where: { userId: id },
      create: {
        userId: id,
        about: data.about || null,
        skills: data.skills || [],
        certifications: data.certifications || [],
        interestsAndHobbies: data.interestsAndHobbies || null,
      },
      update: {
        about: data.about !== undefined ? data.about : undefined,
        skills: data.skills !== undefined ? data.skills : undefined,
        certifications: data.certifications !== undefined ? data.certifications : undefined,
        interestsAndHobbies: data.interestsAndHobbies !== undefined ? data.interestsAndHobbies : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Resume details updated successfully",
      resume: updated,
    });
  } catch (error) {
    console.error("PUT /api/employees/[id]/resume error:", error);
    return NextResponse.json(
      { error: "Failed to update resume details" },
      { status: 500 }
    );
  }
}
