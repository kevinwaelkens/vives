"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";
import { TranslationProvider } from "@/lib/i18n/translation-provider";

// Initialize i18n
import "@/lib/i18n";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1 * 60 * 1000, // 1 minute - shorter for development
            gcTime: 5 * 60 * 1000, // 5 minutes - shorter cache time
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnMount: true, // Always refetch on mount for fresh data
          },
        },
      }),
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <TranslationProvider>{children}</TranslationProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  );
}
