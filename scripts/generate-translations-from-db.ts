#!/usr/bin/env tsx
/**
 * Generate Translation Files from Database
 *
 * This script fetches published translations from the database and generates
 * static JSON files for deployment. This is run during the build process
 * or when translations are published.
 */

import { PrismaClient } from "@prisma/client";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

interface TranslationData {
  [key: string]: string | TranslationData;
}

async function generateTranslationFiles() {
  console.log("🌍 Generating translation files from database...");

  try {
    // Get all active languages
    const languages = await prisma.language.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
    });

    console.log(
      `📋 Found ${languages.length} active languages: ${languages.map((l) => l.code).join(", ")}`,
    );

    // Get all translations (with backward compatibility)
    // Try to get published translations first, fall back to approved if isPublished doesn't exist
    let translations;
    try {
      translations = await prisma.translation.findMany({
        where: {
          isPublished: true,
          isApproved: true,
        },
        include: {
          translationKey: true,
          language: true,
        },
        orderBy: [
          { language: { code: "asc" } },
          { translationKey: { category: "asc" } },
          { translationKey: { key: "asc" } },
        ],
      });
    } catch (error: any) {
      // If isPublished column doesn't exist, fall back to just approved translations
      if (error.code === 'P2022' && error.meta?.column?.includes('isPublished')) {
        console.log("⚠️  isPublished column not found, using approved translations only");
        translations = await prisma.translation.findMany({
          where: {
            isApproved: true,
          },
          include: {
            translationKey: true,
            language: true,
          },
          orderBy: [
            { language: { code: "asc" } },
            { translationKey: { category: "asc" } },
            { translationKey: { key: "asc" } },
          ],
        });
      } else {
        throw error;
      }
    }

    console.log(`📝 Found ${translations.length} published translations`);

    // Group translations by language and category
    const translationsByLanguage: Record<
      string,
      Record<string, TranslationData>
    > = {};

    for (const translation of translations) {
      const langCode = translation.language.code;
      const category = translation.translationKey.category || "common";
      const key = translation.translationKey.key;

      if (!translationsByLanguage[langCode]) {
        translationsByLanguage[langCode] = {};
      }

      if (!translationsByLanguage[langCode][category]) {
        translationsByLanguage[langCode][category] = {};
      }

      // Handle nested keys (e.g., "empty_state.tutor_title")
      setNestedValue(
        translationsByLanguage[langCode][category],
        key,
        translation.text,
      );
    }

    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), "lib", "i18n", "locales");
    await fs.mkdir(outputDir, { recursive: true });

    // Generate files for each language
    for (const language of languages) {
      const langCode = language.code;
      const langDir = path.join(outputDir, langCode);
      await fs.mkdir(langDir, { recursive: true });

      const langTranslations = translationsByLanguage[langCode] || {};

      // Get all categories that should exist
      const allCategories = new Set<string>();
      for (const langData of Object.values(translationsByLanguage)) {
        for (const category of Object.keys(langData)) {
          allCategories.add(category);
        }
      }

      // Generate a file for each category
      for (const category of allCategories) {
        const categoryData = langTranslations[category] || {};
        const filePath = path.join(langDir, `${category}.json`);

        await fs.writeFile(
          filePath,
          JSON.stringify(categoryData, null, 2) + "\n",
        );

        console.log(
          `✅ Generated ${langCode}/${category}.json (${Object.keys(categoryData).length} keys)`,
        );
      }
    }

    // Generate TypeScript types
    await generateTypeDefinitions(translationsByLanguage);

    console.log("🎉 Translation files generated successfully!");
  } catch (error) {
    console.error("❌ Failed to generate translation files:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function setNestedValue(obj: TranslationData, key: string, value: string) {
  const keys = key.split(".");
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!(k in current) || typeof current[k] !== "object") {
      current[k] = {};
    }
    current = current[k];
  }

  current[keys[keys.length - 1]] = value;
}

async function generateTypeDefinitions(
  translationsByLanguage: Record<string, Record<string, TranslationData>>,
) {
  console.log("📝 Generating TypeScript type definitions...");

  // Get English translations as the base for types
  const englishTranslations = translationsByLanguage["en"] || {};

  let typeDefinitions = "// Auto-generated translation types\n\n";

  for (const [category, translations] of Object.entries(englishTranslations)) {
    const typeName = `${category.charAt(0).toUpperCase()}${category.slice(1)}Translations`;
    typeDefinitions += `export interface ${typeName} {\n`;
    typeDefinitions += generateInterfaceProperties(translations, "  ");
    typeDefinitions += "}\n\n";
  }

  // Generate main translations interface
  typeDefinitions += "export interface Translations {\n";
  for (const category of Object.keys(englishTranslations)) {
    const typeName = `${category.charAt(0).toUpperCase()}${category.slice(1)}Translations`;
    typeDefinitions += `  ${category}: ${typeName};\n`;
  }
  typeDefinitions += "}\n";

  const typesPath = path.join(process.cwd(), "lib", "i18n", "types.ts");
  await fs.writeFile(typesPath, typeDefinitions);

  console.log("✅ Generated TypeScript types");
}

function generateInterfaceProperties(
  obj: TranslationData,
  indent: string,
): string {
  let result = "";

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      result += `${indent}${key}: string;\n`;
    } else if (typeof value === "object" && value !== null) {
      result += `${indent}${key}: {\n`;
      result += generateInterfaceProperties(value, indent + "  ");
      result += `${indent}};\n`;
    }
  }

  return result;
}

// Run the script
if (require.main === module) {
  generateTranslationFiles().catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
}

export { generateTranslationFiles };
