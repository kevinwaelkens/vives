import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// GET /api/translations/languages - Get all active languages
export async function GET() {
  try {
    const languages = await prisma.language.findMany({
      where: { isActive: true },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });

    return NextResponse.json(languages);
  } catch (error) {
    console.error("Failed to fetch languages:", error);
    return NextResponse.json(
      { error: "Failed to fetch languages" },
      { status: 500 },
    );
  }
}

const createLanguageSchema = z.object({
  code: z.string().min(2).max(5),
  name: z.string().min(1),
  nativeName: z.string().min(1),
  flag: z.string().optional(),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});

// POST /api/translations/languages - Create a new language (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createLanguageSchema.parse(body);

    // If setting as default, unset other defaults
    if (validatedData.isDefault) {
      await prisma.language.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const language = await prisma.language.create({
      data: validatedData,
    });

    return NextResponse.json(language, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Failed to create language:", error);
    return NextResponse.json(
      { error: "Failed to create language" },
      { status: 500 },
    );
  }
}
