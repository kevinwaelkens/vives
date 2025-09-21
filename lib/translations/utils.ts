// Translation utility functions

interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
  isActive: boolean;
  isDefault: boolean;
}

/**
 * Get translation key from nested object notation
 * Example: getNestedValue({ auth: { login: { title: "Login" } } }, "auth.login.title")
 */
export function getNestedValue(
  obj: Record<string, unknown>,
  path: string,
): string | undefined {
  return path.split(".").reduce((current: any, key) => current?.[key], obj) as
    | string
    | undefined;
}

/**
 * Set translation value in nested object notation
 * Example: setNestedValue({}, "auth.login.title", "Login")
 */
export function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: string,
): void {
  const keys = path.split(".");
  const lastKey = keys.pop();
  if (!lastKey) return;

  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key] as Record<string, unknown>;
  }, obj);
  target[lastKey] = value;
}

/**
 * Convert flat translation object to nested structure
 * Example: { "auth.login.title": "Login" } -> { auth: { login: { title: "Login" } } }
 */
export function flatToNested(
  flat: Record<string, string>,
): Record<string, unknown> {
  const nested: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(flat)) {
    setNestedValue(nested, key, value);
  }
  return nested;
}

/**
 * Convert nested translation object to flat structure
 * Example: { auth: { login: { title: "Login" } } } -> { "auth.login.title": "Login" }
 */
export function nestedToFlat(
  nested: Record<string, unknown>,
  prefix = "",
): Record<string, string> {
  const flat: Record<string, string> = {};

  for (const [key, value] of Object.entries(nested)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "string") {
      flat[newKey] = value;
    } else if (typeof value === "object" && value !== null) {
      Object.assign(
        flat,
        nestedToFlat(value as Record<string, unknown>, newKey),
      );
    }
  }

  return flat;
}

/**
 * Get browser language preference
 */
export function getBrowserLanguage(): string {
  if (typeof window === "undefined") return "en";

  const language =
    navigator.language || (navigator as { userLanguage?: string }).userLanguage;
  return language?.split("-")[0] || "en"; // Get language code without region
}

/**
 * Store language preference in localStorage
 */
export function storeLanguagePreference(languageCode: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("preferred-language", languageCode);
}

/**
 * Get stored language preference from localStorage
 */
export function getStoredLanguagePreference(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("preferred-language");
}

/**
 * Find language by code from available languages
 */
export function findLanguageByCode(
  languages: Language[],
  code: string,
): Language | undefined {
  return languages.find((lang) => lang.code === code && lang.isActive);
}

/**
 * Get default language from available languages
 */
export function getDefaultLanguage(
  languages: Language[],
): Language | undefined {
  return (
    languages.find((lang) => lang.isDefault && lang.isActive) ||
    languages.find((lang) => lang.code === "en" && lang.isActive) ||
    languages.find((lang) => lang.isActive)
  );
}

/**
 * Validate translation key format
 */
export function isValidTranslationKey(key: string): boolean {
  // Key should be dot-separated, alphanumeric with underscores/hyphens
  const keyRegex = /^[a-zA-Z][a-zA-Z0-9_-]*(\.[a-zA-Z][a-zA-Z0-9_-]*)*$/;
  return keyRegex.test(key);
}

/**
 * Generate translation key suggestions based on category
 */
export function generateKeySuggestions(category: string): string[] {
  const suggestions: Record<string, string[]> = {
    auth: [
      "auth.login.title",
      "auth.login.email",
      "auth.login.password",
      "auth.login.submit",
      "auth.logout.title",
      "auth.register.title",
      "auth.forgot_password.title",
    ],
    dashboard: [
      "dashboard.welcome",
      "dashboard.overview",
      "dashboard.statistics",
      "dashboard.recent_activity",
    ],
    forms: [
      "forms.save",
      "forms.cancel",
      "forms.submit",
      "forms.reset",
      "forms.required_field",
      "forms.validation_error",
    ],
    navigation: [
      "navigation.home",
      "navigation.dashboard",
      "navigation.settings",
      "navigation.profile",
      "navigation.logout",
    ],
    common: [
      "common.yes",
      "common.no",
      "common.ok",
      "common.cancel",
      "common.delete",
      "common.edit",
      "common.view",
      "common.loading",
      "common.error",
      "common.success",
    ],
  };

  return suggestions[category] || [];
}
