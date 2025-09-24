"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { TranslationNamespace } from "./dynamic-hook";

interface TranslationContextType {
  invalidateNamespace: (namespace: TranslationNamespace) => void;
  invalidateAllTranslations: () => void;
  refreshTranslations: () => void;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

interface TranslationProviderProps {
  children: React.ReactNode;
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  const queryClient = useQueryClient();

  // Listen for cross-tab invalidation events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "translation-invalidated" && e.newValue) {
        try {
          const { namespace, timestamp } = JSON.parse(e.newValue);
          // Invalidate queries in this tab
          queryClient.invalidateQueries({
            queryKey: ["translations", namespace],
          });
        } catch (error) {
          console.error("Error handling cross-tab invalidation:", error);
        }
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }
  }, [queryClient]);

  const invalidateNamespace = useCallback(
    async (namespace: TranslationNamespace) => {
      // Invalidate queries in current tab
      await queryClient.invalidateQueries({
        queryKey: ["translations", namespace],
      });

      // Notify other tabs about the invalidation
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "translation-invalidated",
          JSON.stringify({
            namespace,
            timestamp: Date.now(),
          }),
        );
        // Remove the item immediately so it triggers storage event
        localStorage.removeItem("translation-invalidated");
      }
    },
    [queryClient],
  );

  const invalidateAllTranslations = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["translations"],
    });
  }, [queryClient]);

  const refreshTranslations = useCallback(() => {
    // Force refetch all translation queries
    queryClient.refetchQueries({
      queryKey: ["translations"],
    });
  }, [queryClient]);

  const value: TranslationContextType = {
    invalidateNamespace,
    invalidateAllTranslations,
    refreshTranslations,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslationContext() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error(
      "useTranslationContext must be used within a TranslationProvider",
    );
  }
  return context;
}

// Hook to invalidate translations when they are updated in CMS
export function useTranslationInvalidation() {
  const {
    invalidateNamespace,
    invalidateAllTranslations,
    refreshTranslations,
  } = useTranslationContext();

  const onTranslationUpdated = useCallback(
    async (namespace?: TranslationNamespace) => {
      if (namespace) {
        await invalidateNamespace(namespace);
      } else {
        invalidateAllTranslations();
      }
    },
    [invalidateNamespace, invalidateAllTranslations],
  );

  const onTranslationKeyUpdated = useCallback(
    async (category?: string) => {
      console.log("🔄 onTranslationKeyUpdated called with category:", category);
      if (category) {
        // Map category to namespace if they match
        const namespace = category as TranslationNamespace;
        console.log("📦 Invalidating namespace:", namespace);
        await invalidateNamespace(namespace);
      } else {
        console.log("🌐 Invalidating all translations");
        invalidateAllTranslations();
      }
    },
    [invalidateNamespace, invalidateAllTranslations],
  );

  return {
    onTranslationUpdated,
    onTranslationKeyUpdated,
    refreshTranslations,
    invalidateNamespace,
    invalidateAllTranslations,
  };
}
