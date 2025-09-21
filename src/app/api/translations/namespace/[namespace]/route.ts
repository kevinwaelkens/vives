import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/translations/namespace/[namespace]?language=en - Get translations for a specific namespace and language
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ namespace: string }> },
) {
  try {
    const { namespace } = await params;
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

    // Get all translations for this namespace and language
    const translations = await prisma.translation.findMany({
      where: {
        languageId: language.id,
        isApproved: true,
        translationKey: {
          category: namespace,
        },
      },
      include: {
        translationKey: true,
      },
    });

    // Convert to nested key-value structure
    const translationMap: Record<string, unknown> = {};

    translations.forEach((translation) => {
      const key = translation.translationKey.key;

      // For keys that start with the namespace, remove the namespace prefix
      // e.g., "dashboard.stats.total_users" -> "stats.total_users"
      // But keep keys that don't start with namespace as-is
      const namespacedKey = key.startsWith(`${namespace}.`)
        ? key.substring(namespace.length + 1)
        : key;

      // Create nested object structure
      const keyParts = namespacedKey.split(".");
      let current = translationMap;

      // Navigate/create the nested structure
      for (let i = 0; i < keyParts.length - 1; i++) {
        const part = keyParts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part] as Record<string, unknown>;
      }

      // Set the final value
      const finalKey = keyParts[keyParts.length - 1];
      current[finalKey] = translation.text;
    });

    // Set cache headers for better performance
    const response = NextResponse.json(translationMap);
    response.headers.set(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate=30",
    );

    return response;
  } catch (error) {
    console.error("Failed to fetch namespace translations:", error);
    return NextResponse.json(
      { error: "Failed to fetch translations" },
      { status: 500 },
    );
  }
}
