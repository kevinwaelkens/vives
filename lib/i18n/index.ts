// Enhanced i18n exports with dynamic translation support (fallback)

export { default as i18n } from "./config";
export {
  useTranslation,
  useDynamicTranslationHook,
  useT,
} from "./enhanced-hook";
export { useDynamicTranslation } from "./dynamic-hook";
export type { TranslationKey, CategoryKey } from "./types";
