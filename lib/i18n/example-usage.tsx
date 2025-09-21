// Example usage of the dynamic translation system
"use client";

import React from "react";
import { useDynamicTranslation } from "./dynamic-hook";
import { useTranslation } from "./enhanced-hook";
import { useTranslationInvalidation } from "./translation-provider";

// Example 1: Using the new dynamic translation hook
export function DynamicDashboardExample() {
  const { t, isLoading, error, invalidateTranslations } =
    useDynamicTranslation("dashboard");

  if (isLoading) {
    return <div>Loading translations...</div>;
  }

  if (error) {
    return <div>Error loading translations: {error.message}</div>;
  }

  return (
    <div>
      <h1>{t("title")}</h1>
      <p>{t("welcome")}</p>
      <div>
        <h2>{t("stats.total_students")}</h2>
        <p>{t("stats.active_students_enrolled")}</p>
      </div>

      {/* Button to manually refresh translations */}
      <button onClick={invalidateTranslations}>Refresh Translations</button>
    </div>
  );
}

// Example 2: Using the enhanced hook with dynamic option
export function EnhancedTranslationExample() {
  // Use dynamic translations with fallback to static
  const { t, isLoading } = useTranslation("cms", {
    useDynamic: true,
    fallbackToStatic: true,
  });

  return (
    <div>
      {isLoading && <span>🔄</span>}
      <h1>{t("title")}</h1>
      <p>{t("analytics.title")}</p>
      <p>{t("settings.title")}</p>
    </div>
  );
}

// Example 3: Component that invalidates translations when CMS updates occur
export function CMSTranslationManager() {
  const {
    onTranslationUpdated,
    refreshTranslations,
    invalidateAllTranslations,
  } = useTranslationInvalidation();

  const handleTranslationUpdate = (namespace: string) => {
    // This would be called when a translation is updated in the CMS
    onTranslationUpdated(namespace as any);
  };

  return (
    <div>
      <h2>Translation Management</h2>

      <button onClick={() => handleTranslationUpdate("dashboard")}>
        Update Dashboard Translations
      </button>

      <button onClick={() => handleTranslationUpdate("cms")}>
        Update CMS Translations
      </button>

      <button onClick={refreshTranslations}>Refresh All Translations</button>

      <button onClick={invalidateAllTranslations}>
        Invalidate All Translation Caches
      </button>
    </div>
  );
}

// Example 4: Backward compatible usage (no changes needed)
export function BackwardCompatibleExample() {
  // This works exactly as before - no changes needed
  const { t } = useTranslation("common");

  return (
    <div>
      <h1>{t("loading")}</h1>
      <p>{t("save")}</p>
    </div>
  );
}
