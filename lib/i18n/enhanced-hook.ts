// Enhanced useTranslation hook that supports both static and dynamic translations (fallback)
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

  // In hybrid system: use dynamic if ready, otherwise fall back to static
  if (useDynamic) {
    // Create a hybrid translation function that falls back to static
    const hybridT = (key: string, params?: any) => {
      // If dynamic translations are ready and have the key, use them
      if (
        dynamicTranslation.ready &&
        dynamicTranslation.translations &&
        dynamicTranslation.translations[key]
      ) {
        return dynamicTranslation.t(key, params);
      }

      // Otherwise, fall back to static translations
      return staticTranslation.t(key, params);
    };

    return {
      ...dynamicTranslation,
      t: hybridT, // Use hybrid translation function
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
