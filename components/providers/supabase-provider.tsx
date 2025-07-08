'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { useUser } from '@stackframe/stack';
import { Database } from '@/lib/database.types';
import { extractStackAuthJWT, validateStackAuthJWT, createSupabaseCompatibleJWT, getJWTFromCache } from '@/lib/jwt-utils';
import { createAuthenticatedClient } from '@/lib/supabase';

/**
 * Supabase Provider integrated with Stack Auth
 * Manages Supabase client initialization and user context
 * Provides authenticated Supabase client to the entire application
 */

interface SupabaseContextType {
  supabase: SupabaseClient<Database> | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  jwtToken: string | null;
  isJWTBridgeActive: boolean;
}

const SupabaseContext = createContext<SupabaseContextType>({
  supabase: null,
  user: null,
  isLoading: true,
  error: null,
  jwtToken: null,
  isJWTBridgeActive: false
});

interface SupabaseProviderProps {
  children: ReactNode;
}

/**
 * Enhanced Supabase Provider with Stack Auth Integration
 * Features:
 * - Automatic client initialization with Stack Auth context
 * - Session synchronization between Stack Auth and Supabase
 * - Error handling and retry logic
 * - Loading states management
 * - Real-time connection management
 */
export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [isJWTBridgeActive, setIsJWTBridgeActive] = useState(false);
  
  // Get Stack Auth user context - use 'return-null' to avoid redirect during development
  const stackUser = useUser({ or: 'return-null' });

  useEffect(() => {
    /**
     * Initialize Supabase client with Stack Auth JWT Token Bridge
     * This ensures all Supabase requests are authenticated with Stack Auth tokens
     */
    const initializeSupabase = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setIsJWTBridgeActive(false);

        let client: SupabaseClient<Database>;
        let extractedJWT: string | null = null;

        // JWT Token Bridge Implementation
        if (stackUser) {
          try {
            // Extract JWT token from Stack Auth (client-side, no request parameter needed)
            extractedJWT = await extractStackAuthJWT();
            
            if (extractedJWT) {
              // Validate the JWT token
              const validatedClaims = await validateStackAuthJWT(extractedJWT);
              
              if (validatedClaims) {
                // Create authenticated Supabase client with JWT bridge
                const userContext = {
                  userId: stackUser.id,
                  tenantId: stackUser.selectedTeam?.id || validatedClaims.org_id || validatedClaims.team_id || 'default',
                  roles: validatedClaims.roles || [],

                };
                
                client = await createAuthenticatedClient({
                  ...userContext,
                  permissions: validatedClaims.permissions || []
                }, false, extractedJWT) as SupabaseClient<Database>;
                setJwtToken(extractedJWT);
                setIsJWTBridgeActive(true);
                
                console.log('✅ JWT Token Bridge activated successfully', {
                  userId: userContext.userId,
                  tenantId: userContext.tenantId,
                  rolesCount: userContext.roles.length,
                  permissionsCount: validatedClaims.permissions?.length || 0
                });
              } else {
                console.warn('⚠️ Invalid JWT token, falling back to standard client');
                client = createBrowserClient<Database>(
                  process.env.NEXT_PUBLIC_SUPABASE_URL!,
                  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );
              }
            } else {
              console.warn('⚠️ No JWT token found, using standard client');
              client = createBrowserClient<Database>(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
              );
            }
          } catch (jwtError) {
            console.error('❌ JWT Token Bridge error:', jwtError);
            // Graceful fallback to standard client
            client = createBrowserClient<Database>(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
          }
        } else {
          // No Stack Auth user - use standard client
          client = createBrowserClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          );
        }

        // Get current user from Supabase (may be null for JWT-only auth)
        const { data: { user: supabaseUser }, error: userError } = await client.auth.getUser();
        
        if (userError && userError.message !== 'Invalid JWT') {
          console.warn('Supabase auth error (non-critical):', userError.message);
        }

        setSupabase(client);
        setUser(supabaseUser);
        
        // Listen for auth state changes
        const { data: { subscription } } = client.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Supabase auth state changed:', event);
            setUser(session?.user ?? null);
            
            // Sync with Stack Auth if needed
            if (event === 'SIGNED_OUT') {
              // Handle logout cleanup
              setUser(null);
              setJwtToken(null);
              setIsJWTBridgeActive(false);
            }
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Failed to initialize Supabase:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize Supabase');
      } finally {
        setIsLoading(false);
      }
    };

    // Initialize Supabase regardless of Stack Auth user status
    // This allows the app to work even when Stack Auth is not fully configured
    initializeSupabase();
  }, [stackUser]);

  /**
   * Retry mechanism for failed operations
   */
  const retryInitialization = () => {
    if (stackUser) {
      setError(null);
      // Re-trigger initialization
      window.location.reload();
    }
  };

  const contextValue: SupabaseContextType = {
    supabase,
    user,
    isLoading,
    error,
    jwtToken,
    isJWTBridgeActive,
  };

  // Error boundary for Supabase initialization
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-red-600">Database Connection Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={retryInitialization}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <SupabaseContext.Provider value={contextValue}>
      {children}
    </SupabaseContext.Provider>
  );
}

/**
 * Hook to access Supabase client and user context
 * Provides type-safe access to authenticated Supabase client
 */
export function useSupabase() {
  const context = useContext(SupabaseContext);
  
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  
  return context;
}

/**
 * Hook to get authenticated Supabase client
 * Throws error if client is not available or user is not authenticated
 */
export function useAuthenticatedSupabase() {
  const { supabase, user, isLoading } = useSupabase();
  
  if (isLoading) {
    throw new Error('Supabase client is still loading');
  }
  
  if (!supabase || !user) {
    throw new Error('User must be authenticated to access Supabase');
  }
  
  return { supabase, user };
}

/**
 * Utility function to create server-side Supabase client
 * Used in server components and API routes
 */
export function createServerSupabaseClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}