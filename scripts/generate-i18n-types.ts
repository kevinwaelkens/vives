#!/usr/bin/env tsx

/**
 * Generate TypeScript types and JSON files from database translations
 * This script should be run during the build process to ensure type safety
 */

import { PrismaClient } from "@prisma/client";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

interface TranslationData {
  [languageCode: string]: {
    [category: string]: {
      [key: string]: string;
    };
  };
}

interface TypeDefinition {
  [category: string]: {
    [key: string]: string;
  };
}

async function generateI18nFiles() {
  console.log("🌍 Generating i18n types and files from database...");

  try {
    // Fetch all languages
    const languages = await prisma.language.findMany({
      where: { isActive: true },
      orderBy: { isDefault: "desc" },
    });

    if (languages.length === 0) {
      console.error("❌ No active languages found in database");
      process.exit(1);
    }

    // Fetch all translation keys with their translations
    const translationKeys = await prisma.translationKey.findMany({
      include: {
        translations: {
          include: {
            language: true,
          },
          where: {
            language: {
              isActive: true,
            },
          },
        },
      },
      orderBy: [{ category: "asc" }, { key: "asc" }],
    });

    console.log(
      `📊 Found ${translationKeys.length} translation keys for ${languages.length} languages`,
    );

    // Organize translations by language and category
    const translationData: TranslationData = {};
    const typeDefinition: TypeDefinition = {};

    // Initialize structure
    for (const language of languages) {
      translationData[language.code] = {};
    }

    // Process each translation key
    for (const translationKey of translationKeys) {
      const category = translationKey.category || "common";
      const keyParts = translationKey.key.split(".");

      // Build nested key structure for TypeScript types
      if (!typeDefinition[category]) {
        typeDefinition[category] = {};
      }

      // Create nested structure for the key
      let currentTypeLevel = typeDefinition[category];
      for (let i = 1; i < keyParts.length - 1; i++) {
        const part = keyParts[i];
        if (typeof currentTypeLevel[part] !== "object") {
          currentTypeLevel[part] = {};
        }
        currentTypeLevel = currentTypeLevel[part] as any;
      }

      const finalKey = keyParts[keyParts.length - 1];
      currentTypeLevel[finalKey] = "string";

      // Process translations for each language
      for (const language of languages) {
        if (!translationData[language.code][category]) {
          translationData[language.code][category] = {};
        }

        // Find translation for this language
        const translation = translationKey.translations.find(
          (t) => t.language.code === language.code && t.isApproved,
        );

        // Create nested structure for the translation
        let currentTranslationLevel = translationData[language.code][category];
        for (let i = 1; i < keyParts.length - 1; i++) {
          const part = keyParts[i];
          if (!currentTranslationLevel[part]) {
            currentTranslationLevel[part] = {};
          }
          currentTranslationLevel = currentTranslationLevel[part];
        }

        // Set the translation text (fallback to English text if no translation)
        currentTranslationLevel[finalKey] =
          translation?.text || translationKey.englishText;
      }
    }

    // Create output directories
    const outputDir = path.join(process.cwd(), "lib", "i18n");
    const localesDir = path.join(outputDir, "locales");

    await fs.mkdir(outputDir, { recursive: true });
    await fs.mkdir(localesDir, { recursive: true });

    // Generate JSON files for each language
    for (const language of languages) {
      const langDir = path.join(localesDir, language.code);
      await fs.mkdir(langDir, { recursive: true });

      const langData = translationData[language.code];

      // Write category-based JSON files
      for (const [category, categoryData] of Object.entries(langData)) {
        const filePath = path.join(langDir, `${category}.json`);
        await fs.writeFile(filePath, JSON.stringify(categoryData, null, 2));
        console.log(`✓ Generated ${language.code}/${category}.json`);
      }
    }

    // Generate TypeScript type definitions
    const typeDefinitions = generateTypeDefinitions(typeDefinition);
    const typesFilePath = path.join(outputDir, "types.ts");
    await fs.writeFile(typesFilePath, typeDefinitions);
    console.log("✓ Generated TypeScript type definitions");

    // Generate i18n configuration
    const configContent = generateI18nConfig(
      languages,
      Object.keys(typeDefinition),
    );
    const configFilePath = path.join(outputDir, "config.ts");
    await fs.writeFile(configFilePath, configContent);
    console.log("✓ Generated i18n configuration");

    // Generate hook for easy usage
    const hookContent = generateI18nHook();
    const hookFilePath = path.join(outputDir, "hook.ts");
    await fs.writeFile(hookFilePath, hookContent);
    console.log("✓ Generated useTranslation hook");

    // Generate index file
    const indexContent = generateIndexFile();
    const indexFilePath = path.join(outputDir, "index.ts");
    await fs.writeFile(indexFilePath, indexContent);
    console.log("✓ Generated index file");

    console.log("🎉 i18n files generated successfully!");
    console.log(`📁 Output directory: ${outputDir}`);
  } catch (error) {
    console.error("❌ Error generating i18n files:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

function generateTypeDefinitions(typeDefinition: TypeDefinition): string {
  const categories = Object.keys(typeDefinition);

  let content = `// Auto-generated TypeScript definitions for i18n
// Do not edit this file manually - it will be overwritten

import 'react-i18next';

`;

  // Generate interface for each category
  for (const [category, categoryTypes] of Object.entries(typeDefinition)) {
    content += `interface ${capitalize(category)}Translations {\n`;
    content += generateInterfaceContent(categoryTypes, 1);
    content += `}\n\n`;
  }

  // Generate main resources interface
  content += `interface Resources {\n`;
  for (const category of categories) {
    content += `  ${category}: ${capitalize(category)}Translations;\n`;
  }
  content += `}\n\n`;

  // Extend react-i18next module
  content += `declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: Resources;
  }
}

export type TranslationKey = keyof Resources;
export type CategoryKey<T extends TranslationKey> = keyof Resources[T];
`;

  return content;
}

function generateInterfaceContent(obj: any, indent: number): string {
  let content = "";
  const spaces = "  ".repeat(indent);

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      content += `${spaces}${key}: string;\n`;
    } else if (typeof value === "object") {
      content += `${spaces}${key}: {\n`;
      content += generateInterfaceContent(value, indent + 1);
      content += `${spaces}};\n`;
    }
  }

  return content;
}

function generateI18nConfig(languages: any[], categories: string[]): string {
  const defaultLang = languages.find((lang) => lang.isDefault)?.code || "en";

  return `// Auto-generated i18n configuration
// Do not edit this file manually - it will be overwritten

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all translation files
${languages
  .map((lang) =>
    categories
      .map(
        (category) =>
          `import ${category}_${lang.code} from './locales/${lang.code}/${category}.json';`,
      )
      .join("\n"),
  )
  .join("\n")}

const resources = {
${languages
  .map(
    (lang) => `  ${lang.code}: {
${categories.map((category) => `    ${category}: ${category}_${lang.code},`).join("\n")}
  },`,
  )
  .join("\n")}
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: '${defaultLang}',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    defaultNS: 'common',
    ns: [${categories.map((c) => `'${c}'`).join(", ")}],
  });

export default i18n;
export { resources };
`;
}

function generateI18nHook(): string {
  return `// Auto-generated useTranslation hook with type safety
// Do not edit this file manually - it will be overwritten

import { useTranslation as useI18nTranslation } from 'react-i18next';
import type { TranslationKey } from './types';

export function useTranslation<T extends TranslationKey = 'common'>(ns?: T) {
  return useI18nTranslation(ns);
}

export function useT() {
  const { t } = useI18nTranslation();
  return t;
}
`;
}

function generateIndexFile(): string {
  return `// Auto-generated i18n exports
// Do not edit this file manually - it will be overwritten

export { default as i18n } from './config';
export { useTranslation, useT } from './hook';
export type { TranslationKey, CategoryKey } from './types';
`;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Run the script
if (require.main === module) {
  generateI18nFiles().catch(console.error);
}

export default generateI18nFiles;
