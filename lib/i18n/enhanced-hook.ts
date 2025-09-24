// Enhanced useTranslation hook that supports both static and dynamic translations
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
    useDynamic = false,
    fallbackToStatic = true,
    showLoadingFallback = true,
  } = options;

  // Static translation (original behavior)
  const staticTranslation = useI18nTranslation(ns);

  // Dynamic translation (new behavior)
  const dynamicTranslation = useDynamicTranslation(ns as TranslationNamespace, {
    fallbackToStatic,
    enabled: useDynamic,
  });

  // Return the appropriate translation system
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
