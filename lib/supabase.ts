/**
 * Supabase Client Configuration for XalesIn ERP
 * 
 * This file provides Supabase client instances for both client-side and server-side operations.
 * It integrates with Stack Auth for authentication context and multi-tenancy.
 * 
 * Architecture:
 * - Stack Auth: Handles authentication, user management, multi-tenancy, core RBAC
 * - Supabase: Handles business data, real-time updates, storage
 * 
 * @author XalesIn ERP Team
 * @version 1.0.0
 */

import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  )
}

/**
 * Client-side Supabase client for browser usage
 * Uses anonymous key and respects RLS policies
 * 
 * Usage: Use this in React components, client-side hooks, and browser contexts
 */
export const createClientComponentClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Disable auto-refresh since Stack Auth handles authentication
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    realtime: {
      // Enable real-time subscriptions for business data
      params: {
        eventsPerSecond: 10,
      },
    },
  })
}

/**
 * Server-side Supabase client for API routes and server components
 * Uses service role key for elevated permissions when needed
 * 
 * Usage: Use this in API routes, server actions, and server components
 */
export const createServerComponentClient = () => {
  const cookieStore = cookies()
  
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: '', ...options })
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })
}

/**
 * Middleware Supabase client for request/response handling
 * 
 * Usage: Use this in middleware.ts for request processing
 */
export const createMiddlewareClient = (request: NextRequest) => {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        request.cookies.set({
          name,
          value,
          ...options,
        })
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        })
        response.cookies.set({
          name,
          value,
          ...options,
        })
      },
      remove(name: string, options: any) {
        request.cookies.set({
          name,
          value: '',
          ...options,
        })
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        })
        response.cookies.set({
          name,
          value: '',
          ...options,
        })
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })

  return { supabase, response }
}

/**
 * Admin Supabase client with service role key
 * Bypasses RLS policies - use with extreme caution
 * 
 * Usage: Use only for admin operations, migrations, and system-level tasks
 * 
 * @param userContext - Optional user context from Stack Auth for audit logging
 */
export const createAdminClient = (userContext?: {
  userId: string
  tenantId: string
  roles: string[]
}) => {
  if (!supabaseServiceKey) {
    throw new Error(
      'Service role key not available. Admin operations not permitted.'
    )
  }

  const client = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Add audit context if provided
  if (userContext) {
    // Set custom headers for audit logging
    client.rest.headers = {
      ...client.rest.headers,
      'x-user-id': userContext.userId,
      'x-tenant-id': userContext.tenantId,
      'x-user-roles': userContext.roles.join(','),
    }
  }

  return client
}

/**
 * Utility function to create authenticated Supabase client with Stack Auth context
 * This is the recommended way to access Supabase with proper authentication
 * 
 * @param userContext - User context from Stack Auth
 * @param useServiceRole - Whether to use service role (admin operations)
 */
export const createAuthenticatedClient = (
  userContext: {
    userId: string
    tenantId: string
    roles: string[]
    permissions: string[]
  },
  useServiceRole = false
) => {
  const client = useServiceRole 
    ? createAdminClient(userContext)
    : createClientComponentClient()

  // Add RLS context for tenant isolation
  if (!useServiceRole) {
    // Set RLS context for multi-tenancy
    client.rpc('set_tenant_context', {
      tenant_id: userContext.tenantId,
      user_id: userContext.userId,
    })
  }

  return client
}

/**
 * Type definitions for better TypeScript support
 */
export type SupabaseClient = ReturnType<typeof createClientComponentClient>
export type SupabaseServerClient = ReturnType<typeof createServerComponentClient>
export type SupabaseAdminClient = ReturnType<typeof createAdminClient>

/**
 * Database type definitions
 * Update these types based on your actual database schema
 */
export interface Database {
  public: {
    Tables: {
      // Business tables will be defined here
      inventory_items: {
        Row: {
          id: string
          tenant_id: string
          name: string
          sku: string
          description: string | null
          unit_price: number
          stock_quantity: number
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: Omit<Database['public']['Tables']['inventory_items']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['inventory_items']['Insert']>
      }
      // Add more table definitions as needed
    }
    Views: {
      // Database views will be defined here
    }
    Functions: {
      // Database functions will be defined here
      set_tenant_context: {
        Args: {
          tenant_id: string
          user_id: string
        }
        Returns: void
      }
    }
    Enums: {
      // Database enums will be defined here
    }
  }
}

// Export the main client for backward compatibility
export const supabase = createClientComponentClient()

// Export default client
export default supabase