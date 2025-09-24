"use client";

import React, { createContext, useContext, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { TranslationNamespace } from "./dynamic-hook";

interface TranslationLoadingContextType {
  preloadNamespaces: (namespaces: TranslationNamespace[]) => void;
}

const TranslationLoadingContext = createContext<TranslationLoadingContextType | undefined>(undefined);

export function TranslationLoadingProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const preloadNamespaces = useCallback((namespaces: TranslationNamespace[]) => {
    // Fallback implementation - do nothing
  }, [queryClient]);

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
    throw new Error("useTranslationLoading must be used within a TranslationLoadingProvider");
  }
  return context;
}
