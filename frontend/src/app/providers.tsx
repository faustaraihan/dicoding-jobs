"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { NavigationProgressProvider } from "@/components/layouts/NavigationProgress";
import { ToastProvider } from "@/components/ui/feedback/ToastProvider";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <NavigationProgressProvider>{children}</NavigationProgressProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
