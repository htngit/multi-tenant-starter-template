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
import { NextRequest, NextResponse } from 'next/server'

// Conditional import for next/headers (only available in app directory)
let cookies: any = null
try {
  // This will only work in app directory Server Components
  cookies = require('next/headers').cookies
} catch (error) {
  // Fallback for pages directory or client-side
  cookies = null
}

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
 * Enhanced Supabase client with error handling and retry logic
 * Features:
 * - Automatic retry for transient failures
 * - Structured error handling
 * - Performance monitoring hooks
 * - Connection health checks
 */

// Custom error types for better error handling
export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any,
    public hint?: string
  ) {
    super(message);
    this.name = 'SupabaseError';
  }

  static fromSupabaseError(error: any): SupabaseError {
    return new SupabaseError(
      error.message || 'Unknown Supabase error',
      error.code,
      error.details,
      error.hint
    );
  }

  static isRetryable(error: SupabaseError): boolean {
    // Define which errors are retryable
    const retryableCodes = [
      'PGRST301', // Connection timeout
      'PGRST302', // Connection failed
      '08000',    // Connection exception
      '08003',    // Connection does not exist
      '08006',    // Connection failure
      '53300',    // Too many connections
    ];
    
    return retryableCodes.includes(error.code || '');
  }
}

// Retry configuration
interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
};

/**
 * Retry wrapper with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: SupabaseError;
  
  for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof SupabaseError 
        ? error 
        : SupabaseError.fromSupabaseError(error);
      
      // Don't retry on the last attempt or non-retryable errors
      if (attempt === retryConfig.maxAttempts || !SupabaseError.isRetryable(lastError)) {
        throw lastError;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt - 1),
        retryConfig.maxDelay
      );
      
      console.warn(`Supabase operation failed (attempt ${attempt}/${retryConfig.maxAttempts}), retrying in ${delay}ms:`, lastError.message);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Client-side Supabase client for browser usage
 * Uses anonymous key and respects RLS policies
 * 
 * Usage: Use this in React components, client-side hooks, and browser contexts
 */
export const createClientComponentClient = () => {
  const client = createBrowserClient(supabaseUrl, supabaseAnonKey, {
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
    global: {
      headers: {
        'X-Client-Info': 'xalesin-erp@1.0.0',
      },
    },
  });

  // Add performance monitoring
  const originalFrom = client.from.bind(client);
  client.from = function(table: string) {
    const queryBuilder = originalFrom(table);
    
    // Wrap query methods with error handling and monitoring
    const originalSelect = queryBuilder.select.bind(queryBuilder);
    queryBuilder.select = function(...args: any[]) {
      const query = originalSelect(...args);
      
      // Add performance timing
      const originalThen = query.then.bind(query);
      query.then = function(onFulfilled?: any, onRejected?: any) {
        const startTime = performance.now();
        
        return originalThen(
          (result: any) => {
            const duration = performance.now() - startTime;
            console.debug(`Supabase query to ${table} completed in ${duration.toFixed(2)}ms`);
            
            if (result.error) {
              throw SupabaseError.fromSupabaseError(result.error);
            }
            
            return onFulfilled ? onFulfilled(result) : result;
          },
          (error: any) => {
            const duration = performance.now() - startTime;
            console.error(`Supabase query to ${table} failed after ${duration.toFixed(2)}ms:`, error);
            
            const supabaseError = SupabaseError.fromSupabaseError(error);
            return onRejected ? onRejected(supabaseError) : Promise.reject(supabaseError);
          }
        );
      };
      
      return query;
    };
    
    return queryBuilder;
  };
  
  return client;
}

/**
 * Health check for Supabase connection
 */
export async function checkSupabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  latency?: number;
  error?: string;
}> {
  try {
    const client = createClientComponentClient();
    const startTime = performance.now();
    
    // Simple health check query
    const { error } = await client
      .from('health_check')
      .select('1')
      .limit(1);
    
    const latency = performance.now() - startTime;
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = table not found, which is expected
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
    
    return {
      status: 'healthy',
      latency,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Utility for batch operations with error handling
 */
export async function batchOperation<T>(
  operations: (() => Promise<T>)[],
  options: {
    concurrency?: number;
    failFast?: boolean;
    retryConfig?: Partial<RetryConfig>;
  } = {}
): Promise<{
  results: (T | null)[];
  errors: (SupabaseError | null)[];
  successCount: number;
  errorCount: number;
}> {
  const { concurrency = 5, failFast = false, retryConfig } = options;
  const results: (T | null)[] = [];
  const errors: (SupabaseError | null)[] = [];
  let successCount = 0;
  let errorCount = 0;
  
  // Process operations in batches
  for (let i = 0; i < operations.length; i += concurrency) {
    const batch = operations.slice(i, i + concurrency);
    
    const batchPromises = batch.map(async (operation, index) => {
      try {
        const result = await withRetry(operation, retryConfig);
        results[i + index] = result;
        errors[i + index] = null;
        successCount++;
        return result;
      } catch (error) {
        const supabaseError = error instanceof SupabaseError 
          ? error 
          : SupabaseError.fromSupabaseError(error);
        
        results[i + index] = null;
        errors[i + index] = supabaseError;
        errorCount++;
        
        if (failFast) {
          throw supabaseError;
        }
        
        return null;
      }
    });
    
    try {
      await Promise.all(batchPromises);
    } catch (error) {
      if (failFast) {
        throw error;
      }
    }
  }
  
  return {
    results,
    errors,
    successCount,
    errorCount,
  };
}

/**
 * Server-side Supabase client for API routes and server components
 * Uses service role key for elevated permissions when needed
 * 
 * Usage: Use this in API routes, server actions, and server components
 * Note: Falls back to browser client when cookies are not available (pages directory)
 */
export const createServerComponentClient = () => {
  // Check if cookies are available (app directory)
  if (cookies) {
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
  
  // Fallback to browser client for pages directory
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
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
    // Use type assertion to access protected property
    const supabaseClient = client as any;
    supabaseClient.rest.headers = {
      ...supabaseClient.rest.headers,
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