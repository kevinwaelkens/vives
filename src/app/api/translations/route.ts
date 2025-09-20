import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/translations?language=en - Get translations for a specific language
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const languageCode = searchParams.get("language") || "en";

    // Get the language
    const language = await prisma.language.findFirst({
      where: {
        code: languageCode,
        isActive: true,
      },
    });

    if (!language) {
      return NextResponse.json(
        { error: "Language not found" },
        { status: 404 },
      );
    }

    // Get all translations for this language
    const translations = await prisma.translation.findMany({
      where: {
        languageId: language.id,
        isApproved: true,
      },
      include: {
        translationKey: true,
      },
    });

    // Convert to flat key-value structure
    const translationMap: Record<string, string> = {};
    translations.forEach((translation) => {
      translationMap[translation.translationKey.key] = translation.text;
    });

    return NextResponse.json(translationMap);
  } catch (error) {
    console.error("Failed to fetch translations:", error);
    return NextResponse.json(
      { error: "Failed to fetch translations" },
      { status: 500 },
    );
  }
}
