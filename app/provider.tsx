'use client';

import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { useState } from 'react';
import superjson from 'superjson';
import { SupabaseProvider } from '@/components/providers/supabase-provider';
import type { AppRouter } from '@/server/api/root';

/**
 * Enhanced Provider with tRPC, TanStack Query, and Supabase SSR Integration
 * Features:
 * - tRPC client with batch requests and error handling
 * - TanStack Query for efficient caching and synchronization
 * - Supabase Provider with Stack Auth integration
 * - Theme management with next-themes
 * - Development tools for debugging
 */

// Create tRPC client
export const trpc = createTRPCReact<AppRouter>();

function getBaseUrl() {
  if (typeof window !== 'undefined') return ''; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
}

export function Provider(props: { children?: React.ReactNode }) {
  // Create stable query client instance
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time for business data (5 minutes)
            staleTime: 5 * 60 * 1000,
            // Cache time for offline support (10 minutes)
            gcTime: 10 * 60 * 1000,
            // Retry failed requests with exponential backoff
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors (client errors)
              if (error?.status >= 400 && error?.status < 500) {
                return false;
              }
              // Retry up to 3 times for other errors
              return failureCount < 3;
            },
            // Refetch on window focus for real-time data
            refetchOnWindowFocus: true,
            // Refetch on reconnect for offline support
            refetchOnReconnect: true,
          },
          mutations: {
            // Retry mutations once on network errors
            retry: (failureCount, error: any) => {
              if (error?.status >= 400 && error?.status < 500) {
                return false;
              }
              return failureCount < 1;
            },
          },
        },
      })
  );

  // Create stable tRPC client instance
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
          // Add auth headers from Stack Auth
          async headers() {
            const headers: Record<string, string> = {};
            
            // Get Stack Auth token if available
            if (typeof window !== 'undefined') {
              const token = localStorage.getItem('stack-auth-token');
              if (token) {
                headers.authorization = `Bearer ${token}`;
              }
            }
            
            return headers;
          },
          // Batch multiple requests for better performance
          maxURLLength: 2048,
        }),
      ],
      // Transform errors for better UX
      transformer: undefined, // Use default transformer
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <SupabaseProvider>
          <ThemeProvider 
            attribute="class" 
            defaultTheme="system" 
            enableSystem
            disableTransitionOnChange
          >
            {props.children}
            {/* Development tools - only in development */}
            {process.env.NODE_ENV === 'development' && (
              <ReactQueryDevtools 
                initialIsOpen={false}
              />
            )}
          </ThemeProvider>
        </SupabaseProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}