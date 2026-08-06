"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  // Default staleTime was 0, meaning every remount (e.g. switching admin
  // tabs and back) re-fetched immediately even though nothing changed —
  // 30s means a quick tab switch reuses the cache instead of round-tripping
  // to Supabase again for data that's still fresh.
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } }));
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  );
}
