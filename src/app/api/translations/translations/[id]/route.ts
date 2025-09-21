import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateTranslationSchema = z.object({
  text: z.string().min(1),
  isApproved: z.boolean().optional(),
});

// PUT /api/translations/translations/[id] - Update a specific translation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateTranslationSchema.parse(body);

    const { id } = await params;
    const translation = await prisma.translation.update({
      where: { id },
      data: validatedData,
      include: {
        language: true,
        translationKey: true,
      },
    });

    return NextResponse.json(translation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 },
      );
    }

    console.error("Failed to update translation:", error);
    return NextResponse.json(
      { error: "Failed to update translation" },
      { status: 500 },
    );
  }
}

// DELETE /api/translations/translations/[id] - Delete a specific translation
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.translation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete translation:", error);
    return NextResponse.json(
      { error: "Failed to delete translation" },
      { status: 500 },
    );
  }
}
