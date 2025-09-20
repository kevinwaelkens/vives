"use client";

import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { Language, TranslationContextType } from "./types";
import {
  getBrowserLanguage,
  getStoredLanguagePreference,
  storeLanguagePreference,
  findLanguageByCode,
  getDefaultLanguage,
  getNestedValue,
} from "./utils";

const TranslationContext = createContext<TranslationContextType | undefined>(
  undefined,
);

interface TranslationProviderProps {
  children: ReactNode;
  initialLanguage?: string;
}

export function TranslationProvider({
  children,
  initialLanguage,
}: TranslationProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language | null>(null);
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch available languages
  const fetchLanguages = useCallback(async () => {
    try {
      const response = await fetch("/api/translations/languages");
      if (response.ok) {
        const languages: Language[] = await response.json();
        setAvailableLanguages(languages);
        return languages;
      }
    } catch (error) {
      console.error("Failed to fetch languages:", error);
    }
    return [];
  }, []);

  // Fetch translations for a specific language
  const fetchTranslations = useCallback(async (languageCode: string) => {
    try {
      const response = await fetch(
        `/api/translations?language=${languageCode}`,
      );
      if (response.ok) {
        const translationsData: Record<string, string> = await response.json();
        setTranslations(translationsData);
        return translationsData;
      }
    } catch (error) {
      console.error("Failed to fetch translations:", error);
    }
    return {};
  }, []);

  // Initialize language and translations
  useEffect(() => {
    const initializeTranslations = async () => {
      setIsLoading(true);

      const languages = await fetchLanguages();
      if (languages.length === 0) {
        setIsLoading(false);
        return;
      }

      // Determine which language to use
      let targetLanguage: Language | undefined;

      if (initialLanguage) {
        targetLanguage = findLanguageByCode(languages, initialLanguage);
      }

      if (!targetLanguage) {
        const storedLanguage = getStoredLanguagePreference();
        if (storedLanguage) {
          targetLanguage = findLanguageByCode(languages, storedLanguage);
        }
      }

      if (!targetLanguage) {
        const browserLanguage = getBrowserLanguage();
        targetLanguage = findLanguageByCode(languages, browserLanguage);
      }

      if (!targetLanguage) {
        targetLanguage = getDefaultLanguage(languages);
      }

      if (targetLanguage) {
        setCurrentLanguage(targetLanguage);
        await fetchTranslations(targetLanguage.code);
        storeLanguagePreference(targetLanguage.code);
      }

      setIsLoading(false);
    };

    initializeTranslations();
  }, [initialLanguage, fetchLanguages, fetchTranslations]);

  // Change language
  const setLanguage = useCallback(
    async (languageCode: string) => {
      const language = findLanguageByCode(availableLanguages, languageCode);
      if (!language) return;

      setIsLoading(true);
      setCurrentLanguage(language);
      await fetchTranslations(languageCode);
      storeLanguagePreference(languageCode);
      setIsLoading(false);
    },
    [availableLanguages, fetchTranslations],
  );

  // Translation function
  const t = useCallback(
    (key: string, fallback?: string): string => {
      // First try to get the translation
      const translation = translations[key];
      if (translation) {
        return translation;
      }

      // If no translation found, try to get nested value
      const nestedTranslation = getNestedValue(translations, key);
      if (nestedTranslation) {
        return nestedTranslation;
      }

      // Return fallback or key
      return fallback || key;
    },
    [translations],
  );

  // Refresh translations
  const refreshTranslations = useCallback(async () => {
    if (currentLanguage) {
      await fetchTranslations(currentLanguage.code);
    }
  }, [currentLanguage, fetchTranslations]);

  const value: TranslationContextType = {
    currentLanguage: currentLanguage || {
      id: "",
      code: "en",
      name: "English",
      nativeName: "English",
      isActive: true,
      isDefault: true,
    },
    availableLanguages,
    translations,
    isLoading,
    setLanguage,
    t,
    refreshTranslations,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation(): TranslationContextType {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
}

// Hook for getting translation function only
export function useT() {
  const { t } = useTranslation();
  return t;
}
