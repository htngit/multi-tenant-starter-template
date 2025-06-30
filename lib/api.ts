/**
 * tRPC Client Configuration for Next.js
 * 
 * This file sets up the tRPC client for use in React components.
 * It provides type-safe API calls with automatic serialization and error handling.
 * 
 * Features:
 * - Type-safe API calls
 * - Automatic request/response serialization
 * - Built-in error handling
 * - React Query integration
 * - SSR support
 * 
 * @author XalesIn ERP Team
 * @version 1.0.0
 */

import { createTRPCNext } from '@trpc/next'
import { createTRPCProxyClient, httpBatchLink, loggerLink } from '@trpc/client'
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server'
import superjson from 'superjson'
import { type AppRouter } from '../server/api/root'
import { env } from '../env.mjs'

/**
 * Get base URL for tRPC requests
 */
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Browser should use relative URL
    return ''
  }
  
  if (env.NEXT_PUBLIC_APP_URL) {
    // SSR should use public URL
    return env.NEXT_PUBLIC_APP_URL
  }
  
  // SSR fallback to localhost
  return `http://localhost:${process.env.PORT ?? 3000}`
}

/**
 * tRPC client for React components
 * This is the main client used in React components with React Query integration
 */
export const api = createTRPCNext<AppRouter>({
  config() {
    return {
      /**
       * Transformer used for data de-serialization from the server
       */
      transformer: superjson,
      
      /**
       * Links used to determine request flow from client to server
       */
      links: [
        // Logger link for development
        loggerLink({
          enabled: (opts) =>
            env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        
        // HTTP batch link for efficient request batching
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          
          /**
           * Headers to be sent with every request
           */
          headers() {
            const headers = new Map<string, string>()
            
            // Add common headers
            headers.set('x-trpc-source', 'react')
            
            // Add user agent for server-side requests
            if (typeof window === 'undefined') {
              headers.set('user-agent', 'XalesIn-ERP/1.0.0')
            }
            
            return Object.fromEntries(headers)
          },
          
          /**
           * Request timeout in milliseconds
           */
          fetch(url, options) {
            return fetch(url, {
              ...options,
              // 30 second timeout
              signal: AbortSignal.timeout(30000),
            })
          },
        }),
      ],
      
      /**
       * React Query options
       */
      queryClientConfig: {
        defaultOptions: {
          queries: {
            // Stale time: 5 minutes
            staleTime: 5 * 60 * 1000,
            // Garbage collection time: 10 minutes (renamed from cacheTime in React Query v5)
            gcTime: 10 * 60 * 1000,
            // Retry failed requests 3 times
            retry: 3,
            // Retry delay with exponential backoff
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Refetch on window focus in production
            refetchOnWindowFocus: env.NODE_ENV === 'production',
            // Don't refetch on reconnect in development
            refetchOnReconnect: env.NODE_ENV === 'production',
          },
          mutations: {
            // Retry failed mutations once
            retry: 1,
            // Retry delay: 1 second
            retryDelay: 1000,
          },
        },
      },
    }
  },
  
  /**
   * Whether tRPC should await queries when server rendering pages
   */
  ssr: false,
})

/**
 * Vanilla tRPC client (without React Query)
 * Use this for server-side operations or when you don't need React Query features
 */
export const vanillaApi = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    loggerLink({
      enabled: (opts) =>
        env.NODE_ENV === 'development' ||
        (opts.direction === 'down' && opts.result instanceof Error),
    }),
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      headers() {
        return {
          'x-trpc-source': 'vanilla',
          'user-agent': 'XalesIn-ERP/1.0.0',
        }
      },
    }),
  ],
})

/**
 * Server-side tRPC client
 * Use this for server-side rendering and API routes
 */
export const createServerSideHelpers = async () => {
  const { createServerSideHelpers } = await import('@trpc/react-query/server')
  const { appRouter } = await import('../server/api/root')
  const { createTRPCContext } = await import('./trpc')
  
  return createServerSideHelpers({
    router: appRouter,
    ctx: await createTRPCContext({
      req: {} as any,
      res: {} as any,
    }),
    transformer: superjson,
  })
}

/**
 * Inference helpers for input and output types
 */
export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>

/**
 * Helper types for common API operations
 */
export type AuthSession = RouterOutputs['auth']['getSession']
export type UserProfile = NonNullable<AuthSession['user']>
export type UserPermissions = AuthSession['permissions']
export type UserRoles = AuthSession['roles']

/**
 * Error handling utilities
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Transform tRPC error to ApiError
 */
export function transformTRPCError(error: any): ApiError {
  if (error?.data?.code) {
    return new ApiError(
      error.message || 'An error occurred',
      error.data.code,
      error.data.httpStatus,
      error.data
    )
  }
  
  return new ApiError(
    error?.message || 'An unexpected error occurred',
    'UNKNOWN_ERROR'
  )
}

/**
 * React hook for handling API errors
 */
export function useApiErrorHandler() {
  return {
    handleError: (error: any) => {
      const apiError = transformTRPCError(error)
      
      // Log error in development
      if (env.NODE_ENV === 'development') {
        console.error('API Error:', apiError)
      }
      
      // You can add toast notifications, error tracking, etc. here
      return apiError
    },
  }
}

/**
 * Utility function to check if an error is a specific tRPC error code
 */
export function isTRPCError(error: any, code?: string): boolean {
  if (!error?.data?.code) return false
  if (!code) return true
  return error.data.code === code
}

/**
 * Utility function to extract error message from tRPC error
 */
export function getTRPCErrorMessage(error: any, fallback = 'An error occurred'): string {
  return error?.message || error?.data?.message || fallback
}

/**
 * React Query key factory for consistent cache keys
 */
export const queryKeys = {
  auth: {
    session: ['auth', 'session'] as const,
    availableTenants: ['auth', 'availableTenants'] as const,
  },
  user: {
    profile: (userId: string) => ['user', 'profile', userId] as const,
    permissions: (userId: string) => ['user', 'permissions', userId] as const,
  },
  tenant: {
    current: ['tenant', 'current'] as const,
    list: ['tenant', 'list'] as const,
    details: (tenantId: string) => ['tenant', 'details', tenantId] as const,
  },
  inventory: {
    list: (filters?: any) => ['inventory', 'list', filters] as const,
    item: (itemId: string) => ['inventory', 'item', itemId] as const,
  },
  financial: {
    transactions: (filters?: any) => ['financial', 'transactions', filters] as const,
    reports: (type: string, period?: any) => ['financial', 'reports', type, period] as const,
  },
}

/**
 * Export the main API client as default
 */
export default api