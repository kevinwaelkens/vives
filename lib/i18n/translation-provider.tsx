"use client";

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
