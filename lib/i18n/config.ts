// Dynamic-only i18n configuration for build environments
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: process.env.NODE_ENV === "development",

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },

    defaultNS: "common",
    ns: [
      "analytics", "assessments", "attendance", "auth", "cms", "common",
      "dashboard", "forms", "groups", "navigation", "settings", "students", "tasks"
    ],
    
    // No static resources - everything will be loaded dynamically
    resources: {},
  });

export default i18n;
