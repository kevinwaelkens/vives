"use client";

import React, { createContext, useContext, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { TranslationNamespace } from "./dynamic-hook";

interface TranslationLoadingContextType {
  preloadNamespaces: (namespaces: TranslationNamespace[]) => void;
}

const TranslationLoadingContext = createContext<
  TranslationLoadingContextType | undefined
>(undefined);

export function TranslationLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();

  // Preload multiple namespaces
  const preloadNamespaces = useCallback(
    (namespaces: TranslationNamespace[]) => {
      namespaces.forEach((namespace) => {
        // Prefetch the query for current language
        const currentLang =
          typeof window !== "undefined"
            ? localStorage.getItem("i18nextLng") || "en"
            : "en";

        queryClient.prefetchQuery({
          queryKey: ["translations", namespace, currentLang],
          queryFn: async () => {
            const response = await fetch(
              `/api/translations/namespace/${namespace}?language=${currentLang}`,
            );
            if (!response.ok) throw new Error(`Failed to fetch ${namespace}`);
            return response.json();
          },
          staleTime: 1 * 60 * 1000,
        });
      });
    },
    [queryClient],
  );

  const contextValue: TranslationLoadingContextType = {
    preloadNamespaces,
  };

  return (
    <TranslationLoadingContext.Provider value={contextValue}>
      {children}
    </TranslationLoadingContext.Provider>
  );
}

export function useTranslationLoading() {
  const context = useContext(TranslationLoadingContext);
  if (context === undefined) {
    throw new Error(
      "useTranslationLoading must be used within a TranslationLoadingProvider",
    );
  }
  return context;
}
