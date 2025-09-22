import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateTranslationKeySchema = z.object({
  key: z
    .string()
    .min(1)
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_-]*(\.[a-zA-Z][a-zA-Z0-9_-]*)*$/,
      "Invalid key format",
    )
    .optional(),
  englishText: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
});

const createTranslationSchema = z.object({
  languageId: z.string().cuid(),
  text: z.string().min(1),
  isApproved: z.boolean().default(false),
});

// GET /api/translations/keys/[id] - Get a specific translation key with all translations
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const translationKey = await prisma.translationKey.findUnique({
      where: { id },
      include: {
        translations: {
          include: {
            language: true,
          },
        },
      },
    });

    if (!translationKey) {
      return NextResponse.json(
        { error: "Translation key not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(translationKey);
  } catch (error) {
    console.error("Failed to fetch translation key:", error);
    return NextResponse.json(
      { error: "Failed to fetch translation key" },
      { status: 500 },
    );
  }
}

// PUT /api/translations/keys/[id] - Update a translation key
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateTranslationKeySchema.parse(body);

    // Check if key already exists (if updating key)
    if (validatedData.key) {
      const existingKey = await prisma.translationKey.findFirst({
        where: {
          key: validatedData.key,
          id: { not: id },
        },
      });

      if (existingKey) {
        return NextResponse.json(
          { error: "Translation key already exists" },
          { status: 409 },
        );
      }
    }

    const translationKey = await prisma.translationKey.update({
      where: { id: id },
      data: validatedData,
      include: {
        translations: {
          include: {
            language: true,
          },
        },
      },
    });

    return NextResponse.json(translationKey);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Failed to update translation key:", error);
    return NextResponse.json(
      { error: "Failed to update translation key" },
      { status: 500 },
    );
  }
}

// DELETE /api/translations/keys/[id] - Delete a translation key and all its translations
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.translationKey.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete translation key:", error);
    return NextResponse.json(
      { error: "Failed to delete translation key" },
      { status: 500 },
    );
  }
}

// POST /api/translations/keys/[id] - Add a translation for this key
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createTranslationSchema.parse(body);

    // Check if translation already exists for this key and language
    const existingTranslation = await prisma.translation.findUnique({
      where: {
        translationKeyId_languageId: {
          translationKeyId: id,
          languageId: validatedData.languageId,
        },
      },
    });

    if (existingTranslation) {
      return NextResponse.json(
        { error: "Translation already exists for this language" },
        { status: 409 },
      );
    }

    const translation = await prisma.translation.create({
      data: {
        ...validatedData,
        translationKeyId: id,
      },
      include: {
        language: true,
        translationKey: true,
      },
    });

    return NextResponse.json(translation, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Failed to create translation:", error);
    return NextResponse.json(
      { error: "Failed to create translation" },
      { status: 500 },
    );
  }
}
