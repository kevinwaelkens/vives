import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createTranslationKeySchema = z.object({
  key: z
    .string()
    .min(1)
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_-]*(\.[a-zA-Z][a-zA-Z0-9_-]*)*$/,
      "Invalid key format",
    ),
  englishText: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
});

// const updateTranslationKeySchema = createTranslationKeySchema.partial();

// GET /api/translations/keys - Get all translation keys with their translations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const where: Record<string, unknown> = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { key: { contains: search, mode: "insensitive" } },
        { englishText: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [translationKeys, total] = await Promise.all([
      prisma.translationKey.findMany({
        where,
        include: {
          translations: {
            include: {
              language: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { key: "asc" },
      }),
      prisma.translationKey.count({ where }),
    ]);

    return NextResponse.json({
      data: translationKeys,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Failed to fetch translation keys:", error);
    return NextResponse.json(
      { error: "Failed to fetch translation keys" },
      { status: 500 },
    );
  }
}

// POST /api/translations/keys - Create a new translation key
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createTranslationKeySchema.parse(body);

    // Check if key already exists
    const existingKey = await prisma.translationKey.findUnique({
      where: { key: validatedData.key },
    });

    if (existingKey) {
      return NextResponse.json(
        { error: "Translation key already exists" },
        { status: 409 },
      );
    }

    const translationKey = await prisma.translationKey.create({
      data: validatedData,
      include: {
        translations: {
          include: {
            language: true,
          },
        },
      },
    });

    return NextResponse.json(translationKey, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 },
      );
    }

    console.error("Failed to create translation key:", error);
    return NextResponse.json(
      { error: "Failed to create translation key" },
      { status: 500 },
    );
  }
}
