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
    const { areNamespacesLoaded, areNamespacesLoading, preloadNamespaces } =
      useTranslationLoading();

    // Preload translations on mount
    useEffect(() => {
      if (preload) {
        preloadNamespaces(requiredNamespaces);
      }
    }, [preloadNamespaces]);

    const isLoading = areNamespacesLoading(requiredNamespaces);
    const isReady = areNamespacesLoaded(requiredNamespaces);

    // Show loading state while translations are being fetched
    if (isLoading && !isReady) {
      if (Fallback) {
        return <Fallback />;
      }

      // Default loading skeleton
      return (
        <div className="animate-pulse space-y-6 p-6">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Render the component once translations are ready
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
