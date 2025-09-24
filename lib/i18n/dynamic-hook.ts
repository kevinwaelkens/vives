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
    staleTime: 1 * 60 * 1000, // 1 minute - shorter stale time for development
    gcTime: 5 * 60 * 1000, // 5 minutes - shorter cache time
    retry: 1,
    retryDelay: 500,
    refetchOnMount: "always", // Always refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch on window focus to avoid unnecessary requests
  });

  // Get static translations as fallback
  const staticTranslations = useMemo(
    () => getStaticTranslations(namespace, baseLanguage),
    [namespace, baseLanguage],
  );

  // Merge dynamic and static translations (dynamic takes priority)
  const translations = useMemo(() => {
    console.log(`🔄 Translation state for ${namespace}:`, {
      isLoading,
      isSuccess,
      hasData: !!dynamicTranslations,
      dataKeys: dynamicTranslations
        ? Object.keys(dynamicTranslations).length
        : 0,
      error: error?.message,
    });

    if (isSuccess && dynamicTranslations) {
      console.log(
        `✅ Using dynamic translations for ${namespace}:`,
        Object.keys(dynamicTranslations),
      );
      return fallbackToStatic
        ? { ...staticTranslations, ...dynamicTranslations }
        : dynamicTranslations;
    }

    console.log(
      `⚠️ No dynamic translations for ${namespace}, fallback:`,
      fallbackToStatic,
    );
    return fallbackToStatic ? staticTranslations : {};
  }, [
    dynamicTranslations,
    staticTranslations,
    isSuccess,
    fallbackToStatic,
    isLoading,
    error,
    namespace,
  ]);

  // Translation function with nested key support
  const t = useCallback(
    (key: string, params?: Record<string, unknown>): string => {
      // If translations are still loading and we have no data, return the key
      if (isLoading && !translations) {
        return key;
      }

      const keyParts = key.split(".");
      let value: unknown = translations;

      // Navigate through nested object
      for (const part of keyParts) {
        if (value && typeof value === "object" && part in value) {
          value = (value as any)[part];
        } else {
          // Return the key if not found (don't fallback to broken static system)
          console.warn(`Translation key not found: ${namespace}:${key}`);
          return key;
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
      console.warn(
        `Translation value is not a string: ${namespace}:${key}`,
        value,
      );
      return key;
    },
    [translations, namespace, isLoading],
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
