import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
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

// Fetch translations from API
async function fetchTranslations(
  namespace: string,
  language: string,
): Promise<Record<string, unknown>> {
  try {
    const url = `/api/translations/namespace/${namespace}?language=${language}`;
    console.log(`🌐 Fetching from: ${url}`);

    const response = await fetch(url);
    console.log(`📡 Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error ${response.status}:`, errorText);
      throw new Error(
        `Failed to fetch translations for ${namespace}: ${response.status}`,
      );
    }

    const data = await response.json();
    console.log(`✅ Got ${Object.keys(data).length} keys for ${namespace}`);
    return data;
  } catch (error) {
    console.error(`❌ Fetch failed for ${namespace}:`, error);
    throw error;
  }
}

// Get static fallback translations
function getStaticTranslations(
  namespace: string,
  language: string,
): Record<string, unknown> {
  const resources = i18n.getResourceBundle(language, namespace);
  return resources || {};
}

export function useDynamicTranslation(
  namespace: TranslationNamespace = "common",
  options: TranslationOptions = {},
) {
  const { fallbackToStatic = true, enabled = true } = options;
  const currentLanguage = i18n.language || "en";
  // Handle regional language codes (e.g., en-BE -> en, nl-BE -> nl)
  const baseLanguage = currentLanguage.split("-")[0];

  const queryClient = useQueryClient();

  // Query for dynamic translations
  const queryKey = ["translations", namespace, baseLanguage];

  const {
    data: dynamicTranslations,
    isLoading,
    error,
    isSuccess,
  } = useQuery({
    queryKey,
    queryFn: () => fetchTranslations(namespace, baseLanguage),
    enabled: enabled && typeof window !== "undefined", // Only run on client side
    staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer
    retry: 2,
    retryDelay: 1000,
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch on window focus to avoid unnecessary requests
  });

  // Get static translations as fallback
  const staticTranslations = useMemo(
    () => getStaticTranslations(namespace, baseLanguage),
    [namespace, baseLanguage],
  );

  // Merge dynamic and static translations (dynamic takes priority)
  const translations = useMemo(() => {
    if (isSuccess && dynamicTranslations) {
      return fallbackToStatic
        ? { ...staticTranslations, ...dynamicTranslations }
        : dynamicTranslations;
    }

    return fallbackToStatic ? staticTranslations : {};
  }, [dynamicTranslations, staticTranslations, isSuccess, fallbackToStatic]);

  // Translation function with nested key support
  const t = useCallback(
    (key: string, params?: Record<string, unknown>): string => {
      const keyParts = key.split(".");
      let value: unknown = translations;

      // Navigate through nested object
      for (const part of keyParts) {
        if (value && typeof value === "object" && part in value) {
          value = (value as any)[part];
        } else {
          // Fallback to i18next for complex interpolation or missing keys
          return i18n.t(`${namespace}:${key}`, params) || key;
        }
      }

      if (typeof value === "string") {
        // Simple parameter interpolation
        if (params) {
          return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
            return params[paramKey]?.toString() || match;
          });
        }
        return value;
      }

      // Fallback to original key if not found
      return key;
    },
    [translations, namespace],
  );

  // Function to invalidate translations cache
  const invalidateTranslations = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["translations", namespace],
    });
  }, [queryClient, namespace]);

  // Function to invalidate all translation caches
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
    // Compatibility with react-i18next
    ready: isSuccess || fallbackToStatic,
    i18n,
  };
}

// Utility function to invalidate multiple namespaces
export function useMultipleTranslationInvalidation() {
  const queryClient = useQueryClient();

  const invalidateNamespaces = useCallback(
    (namespaces: TranslationNamespace[]) => {
      namespaces.forEach((namespace) => {
        queryClient.invalidateQueries({
          queryKey: ["translations", namespace],
        });
      });
    },
    [queryClient],
  );

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["translations"],
    });
  }, [queryClient]);

  return {
    invalidateNamespaces,
    invalidateAll,
  };
}
