// Dynamic translation hook (fallback)
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
    const response = await fetch(`/api/translations/namespace/${ns}?language=${lang}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch translations for ${ns}`);
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
          return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
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
