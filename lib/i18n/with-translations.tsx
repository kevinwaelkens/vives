"use client";

import React, { useEffect } from "react";
import { TranslationNamespace } from "./dynamic-hook";
import { useTranslationLoading } from "./translation-loading-context";

interface WithTranslationsConfig {
  requiredNamespaces: TranslationNamespace[];
  fallback?: React.ComponentType;
  preload?: boolean;
}

// Higher-order component to handle translation loading for entire pages
export function withTranslations<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  config: WithTranslationsConfig,
) {
  const { requiredNamespaces, fallback: Fallback, preload = true } = config;

  const WithTranslationsComponent = (props: P) => {
    const { preloadNamespaces } = useTranslationLoading();

    // Preload translations on mount
    useEffect(() => {
      if (preload) {
        preloadNamespaces(requiredNamespaces);
      }
    }, [preloadNamespaces]);

    // Since we simplified the context, we'll just render the component
    // and let individual translation hooks handle their own loading states
    return <WrappedComponent {...props} />;
  };

  WithTranslationsComponent.displayName = `withTranslations(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithTranslationsComponent;
}

// Preset configurations for common page types
export const withDashboardTranslations = <P extends object>(
  Component: React.ComponentType<P>,
) =>
  withTranslations(Component, {
    requiredNamespaces: ["dashboard", "navigation", "common"],
    preload: true,
  });

export const withStudentsTranslations = <P extends object>(
  Component: React.ComponentType<P>,
) =>
  withTranslations(Component, {
    requiredNamespaces: ["students", "navigation", "common"],
    preload: true,
  });

export const withAnalyticsTranslations = <P extends object>(
  Component: React.ComponentType<P>,
) =>
  withTranslations(Component, {
    requiredNamespaces: ["analytics", "navigation", "common"],
    preload: true,
  });

export const withSettingsTranslations = <P extends object>(
  Component: React.ComponentType<P>,
) =>
  withTranslations(Component, {
    requiredNamespaces: ["settings", "navigation", "common"],
    preload: true,
  });

export const withGroupsTranslations = <P extends object>(
  Component: React.ComponentType<P>,
) =>
  withTranslations(Component, {
    requiredNamespaces: ["groups", "navigation", "common"],
    preload: true,
  });

export const withTasksTranslations = <P extends object>(
  Component: React.ComponentType<P>,
) =>
  withTranslations(Component, {
    requiredNamespaces: ["tasks", "navigation", "common"],
    preload: true,
  });

export const withAssessmentsTranslations = <P extends object>(
  Component: React.ComponentType<P>,
) =>
  withTranslations(Component, {
    requiredNamespaces: ["assessments", "navigation", "common"],
    preload: true,
  });

export const withAttendanceTranslations = <P extends object>(
  Component: React.ComponentType<P>,
) =>
  withTranslations(Component, {
    requiredNamespaces: ["attendance", "navigation", "common"],
    preload: true,
  });
