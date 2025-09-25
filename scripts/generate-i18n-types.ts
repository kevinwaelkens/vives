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

// This function is now replaced by createMinimalTypeScriptFiles
// Keeping for backward compatibility but not used

async function createMinimalTypeDefinitions() {
  const outputDir = path.join(process.cwd(), "lib", "i18n");
  const typesPath = path.join(outputDir, "types.ts");

  const typesContent = `// Auto-generated i18n types (fallback)
export interface TranslationResources {
  common: any;
  navigation: any;
  dashboard: any;
  auth: any;
  tasks: any;
  students: any;
  groups: any;
  attendance: any;
  assessments: any;
  analytics: any;
  cms: any;
  forms: any;
  settings: any;
}

export type TranslationNamespace = keyof TranslationResources;
export type TranslationKey = TranslationNamespace;
export type CategoryKey = TranslationNamespace;
`;

  await fs.writeFile(typesPath, typesContent);
}

async function createMinimalHook() {
  const outputDir = path.join(process.cwd(), "lib", "i18n");
  const hookPath = path.join(outputDir, "hook.ts");

  const hookContent = `// Auto-generated i18n hook (fallback)
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

  await fs.writeFile(hookPath, hookContent);
}

async function createMinimalEnhancedHook() {
  const outputDir = path.join(process.cwd(), "lib", "i18n");
  const enhancedHookPath = path.join(outputDir, "enhanced-hook.ts");

  const enhancedHookContent = `// Enhanced useTranslation hook that supports both static and dynamic translations (fallback)
import { useTranslation as useI18nTranslation } from "react-i18next";
import { useDynamicTranslation, TranslationNamespace } from "./dynamic-hook";
import type { TranslationKey } from "./types";

interface UseTranslationOptions {
  useDynamic?: boolean;
  fallbackToStatic?: boolean;
  showLoadingFallback?: boolean;
}

export function useTranslation<T extends TranslationKey = "common">(
  ns?: T,
  options: UseTranslationOptions = {},
): any {
  const {
    useDynamic = true, // Default to dynamic in hybrid system
    fallbackToStatic = true,
    showLoadingFallback = true,
  } = options;

  // Static translation (fallback behavior)
  const staticTranslation = useI18nTranslation(ns);

  // Dynamic translation (preferred behavior)
  const dynamicTranslation = useDynamicTranslation(ns as TranslationNamespace, {
    fallbackToStatic,
    enabled: useDynamic,
  });

  // In hybrid system, always try dynamic first, fall back to static
  if (useDynamic) {
    return {
      ...dynamicTranslation,
      // Maintain compatibility with react-i18next interface
      i18n: staticTranslation.i18n,
      // Enhanced loading information
      showLoadingFallback,
    };
  }

  return staticTranslation;
}

// Convenience hook for always using dynamic translations
export function useDynamicTranslationHook<T extends TranslationKey = "common">(
  ns?: T,
  options: Omit<UseTranslationOptions, "useDynamic"> = {},
) {
  return useTranslation(ns, { ...options, useDynamic: true });
}

// Legacy hook for backward compatibility
export function useT() {
  const { t } = useI18nTranslation();
  return t;
}
`;

  await fs.writeFile(enhancedHookPath, enhancedHookContent);
}

async function createMinimalDynamicHook() {
  const outputDir = path.join(process.cwd(), "lib", "i18n");
  const dynamicHookPath = path.join(outputDir, "dynamic-hook.ts");

  const dynamicHookContent = `// Dynamic translation hook (fallback)
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useEffect } from "react";
import i18n from "./config";

// Available namespaces
export type TranslationNamespace =
  | "analytics"
  | "assessments"
  | "attendance"
  | "auth"
  | "cms"
  | "common"
  | "dashboard"
  | "forms"
  | "groups"
  | "navigation"
  | "settings"
  | "students"
  | "tasks";

interface TranslationOptions {
  fallbackToStatic?: boolean;
  enabled?: boolean;
}

// Dynamic translation implementation for build environments
export function useDynamicTranslation(
  namespace: TranslationNamespace = "common",
  options: TranslationOptions = {},
) {
  const { fallbackToStatic = false, enabled = true } = options;
  const currentLanguage = i18n.language || "en";
  const baseLanguage = currentLanguage.split("-")[0];

  const queryClient = useQueryClient();
  const queryKey = ["translations", namespace, baseLanguage];

  const fetchTranslations = async (ns: string, lang: string) => {
    const response = await fetch(\`/api/translations/namespace/\${ns}?language=\${lang}\`);
    if (!response.ok) {
      throw new Error(\`Failed to fetch translations for \${ns}\`);
    }
    return response.json();
  };

  const {
    data: dynamicTranslations,
    isLoading,
    error,
    isSuccess,
  } = useQuery({
    queryKey,
    queryFn: () => fetchTranslations(namespace, baseLanguage),
    enabled: enabled && typeof window !== "undefined",
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const translations = useMemo(() => {
    return dynamicTranslations || {};
  }, [dynamicTranslations]);

  const t = useCallback(
    (key: string, params?: Record<string, unknown>): string => {
      const keyParts = key.split(".");
      let value: unknown = translations;

      for (const part of keyParts) {
        if (value && typeof value === "object" && part in value) {
          value = (value as any)[part];
        } else {
          return key; // Return key if not found
        }
      }

      if (typeof value === "string") {
        if (params) {
          return value.replace(/\\{\\{(\\w+)\\}\\}/g, (match, paramKey) => {
            return params[paramKey]?.toString() || match;
          });
        }
        return value;
      }

      return key;
    },
    [translations, namespace],
  );

  const invalidateTranslations = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const invalidateAllTranslations = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["translations"],
    });
  }, [queryClient]);

  return {
    t,
    isLoading,
    error,
    isSuccess,
    translations,
    invalidateTranslations,
    invalidateAllTranslations,
    ready: isSuccess,
    i18n,
  };
}
`;

  await fs.writeFile(dynamicHookPath, dynamicHookContent);
}

async function createMinimalIndex() {
  const outputDir = path.join(process.cwd(), "lib", "i18n");
  const indexPath = path.join(outputDir, "index.ts");

  const indexContent = `// Enhanced i18n exports with dynamic translation support (fallback)

export { default as i18n } from "./config";
export {
  useTranslation,
  useDynamicTranslationHook,
  useT,
} from "./enhanced-hook";
export { useDynamicTranslation } from "./dynamic-hook";
export type { TranslationKey, CategoryKey } from "./types";
`;

  await fs.writeFile(indexPath, indexContent);
}

async function createMinimalConfig() {
  const outputDir = path.join(process.cwd(), "lib", "i18n");
  const configPath = path.join(outputDir, "config.ts");

  const configContent = `// Auto-generated i18n configuration (fallback)
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: process.env.NODE_ENV === "development",

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },

    defaultNS: "common",
    ns: [
      "analytics", "assessments", "attendance", "auth", "cms", "common",
      "dashboard", "forms", "groups", "navigation", "settings", "students", "tasks"
    ],
  });

export default i18n;
`;

  await fs.writeFile(configPath, configContent);
}

async function createMinimalTranslationProvider() {
  const outputDir = path.join(process.cwd(), "lib", "i18n");
  const providerPath = path.join(outputDir, "translation-provider.tsx");

  const providerContent = `"use client";

import { I18nextProvider } from "react-i18next";
import i18n from "./config";

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

// Fallback implementation for translation invalidation
export function useTranslationInvalidation() {
  return {
    invalidateTranslations: (category?: string) => {},
    invalidateAllTranslations: () => {},
    onTranslationKeyUpdated: (category?: string) => {},
  };
}
`;

  await fs.writeFile(providerPath, providerContent);
}

async function createMinimalTranslationLoadingContext() {
  const outputDir = path.join(process.cwd(), "lib", "i18n");
  const contextPath = path.join(outputDir, "translation-loading-context.tsx");

  const contextContent = `"use client";

import React, { createContext, useContext, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { TranslationNamespace } from "./dynamic-hook";

interface TranslationLoadingContextType {
  preloadNamespaces: (namespaces: TranslationNamespace[]) => void;
}

const TranslationLoadingContext = createContext<TranslationLoadingContextType | undefined>(undefined);

export function TranslationLoadingProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const preloadNamespaces = useCallback((namespaces: TranslationNamespace[]) => {
    // Fallback implementation - do nothing
  }, [queryClient]);

  const contextValue: TranslationLoadingContextType = {
    preloadNamespaces,
  };

  return (
    <TranslationLoadingContext.Provider value={contextValue}>
      {children}
    </TranslationLoadingContext.Provider>
  );
}

export function useTranslationLoading() {
  const context = useContext(TranslationLoadingContext);
  if (context === undefined) {
    throw new Error("useTranslationLoading must be used within a TranslationLoadingProvider");
  }
  return context;
}
`;

  await fs.writeFile(contextPath, contextContent);
}

async function createHybridI18nFiles() {
  console.log(
    "📁 Creating hybrid static/dynamic i18n files for build environment...",
  );

  const outputDir = path.join(process.cwd(), "lib", "i18n");
  const localesDir = path.join(outputDir, "locales");

  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(localesDir, { recursive: true });

  // Check if we have existing JSON files from previous builds
  const hasExistingFiles = await checkForExistingTranslationFiles();

  if (hasExistingFiles) {
    console.log("✅ Using existing translation files from previous build");
  } else {
    console.log(
      "⚠️  No existing translation files found, creating minimal fallbacks",
    );
    await createMinimalTranslationFiles();
  }

  // Always create the TypeScript infrastructure
  await createMinimalTypeDefinitions();
  await createHybridConfig();
  await createMinimalEnhancedHook();
  await createMinimalDynamicHook();
  await createMinimalTranslationProvider();
  await createMinimalTranslationLoadingContext();
  await createMinimalIndex();
}

async function checkForExistingTranslationFiles(): Promise<boolean> {
  const outputDir = path.join(process.cwd(), "lib", "i18n");
  const localesDir = path.join(outputDir, "locales");

  try {
    const enDir = path.join(localesDir, "en");
    await fs.access(path.join(enDir, "common.json"));
    await fs.access(path.join(enDir, "navigation.json"));
    return true;
  } catch {
    return false;
  }
}

async function createMinimalTranslationFiles() {
  const outputDir = path.join(process.cwd(), "lib", "i18n");
  const localesDir = path.join(outputDir, "locales");

  const fallbackLanguages = ["en", "fr", "de", "it", "nl", "es"];
  const fallbackCategories = [
    "common",
    "navigation",
    "dashboard",
    "auth",
    "tasks",
    "students",
    "groups",
    "attendance",
    "assessments",
    "analytics",
    "cms",
    "forms",
    "settings",
  ];

  for (const lang of fallbackLanguages) {
    const langDir = path.join(localesDir, lang);
    await fs.mkdir(langDir, { recursive: true });

    for (const category of fallbackCategories) {
      const filePath = path.join(langDir, `${category}.json`);
      // Create minimal fallback with key structure but no content
      await fs.writeFile(
        filePath,
        JSON.stringify(
          {
            title: `${category.charAt(0).toUpperCase() + category.slice(1)}`,
            loading: "Loading...",
          },
          null,
          2,
        ),
      );
    }
  }
}

async function createHybridConfig() {
  const outputDir = path.join(process.cwd(), "lib", "i18n");
  const configPath = path.join(outputDir, "config.ts");

  const configContent = `// Hybrid i18n configuration - supports both static and dynamic
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import static files as fallbacks
import common_en from './locales/en/common.json';
import navigation_en from './locales/en/navigation.json';
import dashboard_en from './locales/en/dashboard.json';
import auth_en from './locales/en/auth.json';
import tasks_en from './locales/en/tasks.json';
import students_en from './locales/en/students.json';
import groups_en from './locales/en/groups.json';
import attendance_en from './locales/en/attendance.json';
import assessments_en from './locales/en/assessments.json';
import analytics_en from './locales/en/analytics.json';
import cms_en from './locales/en/cms.json';
import forms_en from './locales/en/forms.json';
import settings_en from './locales/en/settings.json';

import common_fr from './locales/fr/common.json';
import navigation_fr from './locales/fr/navigation.json';
import dashboard_fr from './locales/fr/dashboard.json';
import auth_fr from './locales/fr/auth.json';
import tasks_fr from './locales/fr/tasks.json';
import students_fr from './locales/fr/students.json';
import groups_fr from './locales/fr/groups.json';
import attendance_fr from './locales/fr/attendance.json';
import assessments_fr from './locales/fr/assessments.json';
import analytics_fr from './locales/fr/analytics.json';
import cms_fr from './locales/fr/cms.json';
import forms_fr from './locales/fr/forms.json';
import settings_fr from './locales/fr/settings.json';

const resources = {
  en: {
    common: common_en,
    navigation: navigation_en,
    dashboard: dashboard_en,
    auth: auth_en,
    tasks: tasks_en,
    students: students_en,
    groups: groups_en,
    attendance: attendance_en,
    assessments: assessments_en,
    analytics: analytics_en,
    cms: cms_en,
    forms: forms_en,
    settings: settings_en,
  },
  fr: {
    common: common_fr,
    navigation: navigation_fr,
    dashboard: dashboard_fr,
    auth: auth_fr,
    tasks: tasks_fr,
    students: students_fr,
    groups: groups_fr,
    attendance: attendance_fr,
    assessments: assessments_fr,
    analytics: analytics_fr,
    cms: cms_fr,
    forms: forms_fr,
    settings: settings_fr,
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    debug: process.env.NODE_ENV === "development",

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },

    defaultNS: "common",
    ns: [
      "analytics", "assessments", "attendance", "auth", "cms", "common",
      "dashboard", "forms", "groups", "navigation", "settings", "students", "tasks"
    ],
  });

export default i18n;
export { resources };
`;

  await fs.writeFile(configPath, configContent);
}

async function createMinimalBuildConfig() {
  const outputDir = path.join(process.cwd(), "lib", "i18n");
  const configPath = path.join(outputDir, "config.ts");

  // Config that works without static JSON files - relies entirely on dynamic API
  const configContent = `// Dynamic-only i18n configuration for build environments
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: process.env.NODE_ENV === "development",

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },

    defaultNS: "common",
    ns: [
      "analytics", "assessments", "attendance", "auth", "cms", "common",
      "dashboard", "forms", "groups", "navigation", "settings", "students", "tasks"
    ],
    
    // No static resources - everything will be loaded dynamically
    resources: {},
  });

export default i18n;
`;

  await fs.writeFile(configPath, configContent);
}

async function generateI18nFiles() {
  console.log("🌍 Generating i18n types and files...");

  // Check if we have existing static files (from CMS publish)
  const hasStaticFiles = await checkForExistingTranslationFiles();

  if (hasStaticFiles && (process.env.VERCEL || process.env.CI)) {
    console.log(
      "✅ Found existing static files in build environment, using hybrid system",
    );
    await createHybridI18nFiles();
    console.log("🎉 Hybrid i18n files created for build!");
    return;
  }

  // Check if we're in a build environment without database access and no static files
  if (process.env.VERCEL || process.env.CI) {
    console.log(
      "⚠️  Build environment detected with no static files, creating minimal fallbacks",
    );
    await createHybridI18nFiles();
    console.log("🎉 Minimal hybrid i18n files created for build!");
    return;
  }

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
          (currentTypeLevel as any)[part] = {};
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
            (currentTranslationLevel as any)[part] = {};
          }
          currentTranslationLevel = currentTranslationLevel[part] as any;
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

    // In build environments, fall back to creating minimal files
    if (process.env.VERCEL || process.env.CI) {
      console.log("🔄 Falling back to minimal i18n files for build...");
      await createMinimalTypeScriptFiles();
      console.log("🎉 Fallback i18n files generated successfully!");
    } else {
      process.exit(1);
    }
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
  return `// Enhanced i18n exports with dynamic translation support

export { default as i18n } from "./config";
export {
  useTranslation,
  useDynamicTranslationHook,
  useT,
} from "./enhanced-hook";
export { useDynamicTranslation } from "./dynamic-hook";
export type { TranslationKey, CategoryKey } from "./types";
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
