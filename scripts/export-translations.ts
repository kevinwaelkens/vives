#!/usr/bin/env tsx

/**
 * Export translations from database to static JSON files
 * Used by the CMS publish system to create deployable static files
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs/promises";
import * as path from "path";

const prisma = new PrismaClient();

interface TranslationExport {
  [namespace: string]: {
    [key: string]: string;
  };
}

async function exportTranslations() {
  console.log("📤 Exporting translations from database to static files...");

  try {
    // Fetch all active languages
    const languages = await prisma.language.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
    });

    console.log(
      `🌍 Found ${languages.length} active languages: ${languages.map((l) => l.code).join(", ")}`,
    );

    // Fetch all translations
    const translations = await prisma.translation.findMany({
      include: {
        language: true,
        translationKey: true,
      },
      orderBy: [
        { translationKey: { category: "asc" } },
        { translationKey: { key: "asc" } },
      ],
    });

    console.log(`📝 Found ${translations.length} translation entries`);

    // Create output directory
    const outputDir = path.join(process.cwd(), "lib", "i18n", "locales");
    await fs.mkdir(outputDir, { recursive: true });

    // Group translations by language and namespace
    const translationsByLang: Record<string, TranslationExport> = {};

    for (const translation of translations) {
      const langCode = translation.language.code;
      const namespace = translation.translationKey.category || "common";
      const key = translation.translationKey.key;

      if (!translationsByLang[langCode]) {
        translationsByLang[langCode] = {};
      }

      if (!translationsByLang[langCode][namespace]) {
        translationsByLang[langCode][namespace] = {};
      }

      translationsByLang[langCode][namespace][key] = translation.text;
    }

    // Write JSON files for each language and namespace
    let filesWritten = 0;

    for (const language of languages) {
      const langCode = language.code;
      const langDir = path.join(outputDir, langCode);
      await fs.mkdir(langDir, { recursive: true });

      const langTranslations = translationsByLang[langCode] || {};

      // Get all namespaces (from all languages to ensure consistency)
      const allNamespaces = new Set<string>();
      Object.values(translationsByLang).forEach((langData) => {
        Object.keys(langData).forEach((ns) => allNamespaces.add(ns));
      });

      for (const namespace of Array.from(allNamespaces).sort()) {
        const namespaceTranslations = langTranslations[namespace] || {};
        const filePath = path.join(langDir, `${namespace}.json`);

        await fs.writeFile(
          filePath,
          JSON.stringify(namespaceTranslations, null, 2),
        );

        filesWritten++;
        console.log(
          `✓ Exported ${langCode}/${namespace}.json (${Object.keys(namespaceTranslations).length} keys)`,
        );
      }
    }

    console.log(`🎉 Successfully exported ${filesWritten} translation files!`);
    console.log(`📁 Output directory: ${outputDir}`);

    // Generate summary report
    const summary = {
      timestamp: new Date().toISOString(),
      languages: languages.length,
      namespaces: Array.from(
        new Set(translations.map((t) => t.translationKey.category || "common")),
      ).length,
      totalKeys: translations.length,
      filesGenerated: filesWritten,
      languageCodes: languages.map((l) => l.code),
    };

    const summaryPath = path.join(outputDir, "_export-summary.json");
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`📊 Export summary saved to ${summaryPath}`);

    return summary;
  } catch (error) {
    console.error("❌ Error exporting translations:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  exportTranslations()
    .then(() => {
      console.log("✅ Translation export completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Translation export failed:", error);
      process.exit(1);
    });
}

export { exportTranslations };
