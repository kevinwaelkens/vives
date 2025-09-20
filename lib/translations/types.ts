// Translation system types

export interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
  isActive: boolean;
  isDefault: boolean;
}

export interface TranslationKey {
  id: string;
  key: string;
  englishText: string;
  description?: string;
  category?: string;
}

export interface Translation {
  id: string;
  translationKeyId: string;
  languageId: string;
  text: string;
  isApproved: boolean;
}

export interface TranslationWithKey extends Translation {
  translationKey: TranslationKey;
  language: Language;
}

export interface TranslationContextType {
  currentLanguage: Language;
  availableLanguages: Language[];
  translations: Record<string, string>;
  isLoading: boolean;
  setLanguage: (languageCode: string) => void;
  t: (key: string, fallback?: string) => string;
  refreshTranslations: () => Promise<void>;
}

export interface CreateTranslationKeyData {
  key: string;
  englishText: string;
  description?: string;
  category?: string;
}

export interface UpdateTranslationData {
  text: string;
  isApproved?: boolean;
}

export interface CreateTranslationData extends UpdateTranslationData {
  translationKeyId: string;
  languageId: string;
}
