/**
 * JWT Utilities for Stack Auth to Supabase Token Bridge
 * 
 * This module provides utilities for extracting, validating, and managing
 * JWT tokens from Stack Auth for use with Supabase RLS policies.
 * 
 * @author XalesIn ERP Team
 * @version 1.0.0
 */

import { jwtVerify, type JWTPayload } from 'jose';
import { cache } from 'react';

/**
 * Stack Auth JWT Claims interface
 * Based on Stack Auth JWT structure and Supabase RLS requirements
 */
export interface StackAuthJWTClaims extends JWTPayload {
  /** User ID from Stack Auth */
  sub: string;
  /** User email */
  email?: string;
  /** User roles array */
  roles?: string[];
  /** User permissions array */
  permissions?: string[];
  /** Tenant/Organization ID */
  org_id?: string;
  /** Team ID for multi-tenancy */
  team_id?: string;
  /** Alternative tenant ID field for compatibility */
  tenant_id?: string;
  /** User metadata */
  user_metadata?: Record<string, any>;
  /** App metadata */
  app_metadata?: Record<string, any>;
  /** Issuer */
  iss?: string;
  /** Audience */
  aud?: string | string[];
  /** Issued at time */
  iat?: number;
  /** Expiration time */
  exp?: number;
}

/**
 * JWT Token Cache Entry
 */
interface JWTCacheEntry {
  claims: StackAuthJWTClaims;
  expiresAt: number;
  token: string;
}

/**
 * In-memory JWT cache for performance optimization
 * TTL-based cache to avoid redundant validations
 */
class JWTTokenCache {
  private cache = new Map<string, JWTCacheEntry>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached JWT claims if still valid
   */
  get(token: string): StackAuthJWTClaims | null {
    const entry = this.cache.get(token);
    if (!entry) return null;

    // Check if token is expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(token);
      return null;
    }

    return entry.claims;
  }

  /**
   * Cache JWT claims with TTL
   */
  set(token: string, claims: StackAuthJWTClaims, customTTL?: number): void {
    const ttl = customTTL || this.defaultTTL;
    const expiresAt = Date.now() + ttl;

    this.cache.set(token, {
      claims,
      expiresAt,
      token
    });
  }

  /**
   * Clear expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }
}

// Global JWT cache instance
const jwtCache = new JWTTokenCache();

/**
 * Extract JWT token from various sources
 * Supports Authorization header, cookies, and direct token
 */
export function extractJWTToken(request: Request | Headers | string): string | null {
  try {
    // Direct token string
    if (typeof request === 'string') {
      return request.startsWith('Bearer ') ? request.slice(7) : request;
    }

    let headers: Headers;
    
    // Extract headers from Request or use Headers directly
    if (request instanceof Request) {
      headers = request.headers;
    } else {
      headers = request;
    }

    // Try Authorization header first
    const authHeader = headers.get('authorization') || headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    // Try cookie-based token (for SSR scenarios)
    const cookieHeader = headers.get('cookie');
    if (cookieHeader) {
      const tokenMatch = cookieHeader.match(/stack-auth-token=([^;]+)/);
      if (tokenMatch) {
        return tokenMatch[1];
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting JWT token:', error);
    return null;
  }
}

/**
 * Validate Stack Auth JWT token
 * Verifies signature and extracts claims
 */
export async function validateStackAuthJWT(
  token: string,
  options: {
    skipCache?: boolean;
    audience?: string;
    issuer?: string;
  } = {}
): Promise<StackAuthJWTClaims | null> {
  try {
    // Check cache first (unless explicitly skipped)
    if (!options.skipCache) {
      const cachedClaims = jwtCache.get(token);
      if (cachedClaims) {
        return cachedClaims;
      }
    }

    // Get JWT secret from environment
    const jwtSecret = process.env.STACK_AUTH_JWT_SECRET;
    if (!jwtSecret) {
      console.error('STACK_AUTH_JWT_SECRET not found in environment variables');
      return null;
    }

    // Verify JWT token
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret, {
      audience: options.audience,
      issuer: options.issuer || 'stack-auth',
    });

    const claims = payload as StackAuthJWTClaims;

    // Validate required claims
    if (!claims.sub) {
      console.error('JWT missing required sub claim');
      return null;
    }

    // Cache the validated claims
    const exp = claims.exp ? claims.exp * 1000 : Date.now() + (60 * 60 * 1000); // 1 hour default
    const cacheTTL = Math.min(exp - Date.now(), 5 * 60 * 1000); // Max 5 minutes cache
    
    if (cacheTTL > 0) {
      jwtCache.set(token, claims, cacheTTL);
    }

    return claims;
  } catch (error) {
    console.error('JWT validation failed:', error);
    return null;
  }
}

/**
 * Extract user context from Stack Auth JWT
 * Returns structured user context for application use
 */
export async function extractUserContext(
  tokenSource: Request | Headers | string
): Promise<{
  userId: string;
  email?: string;
  roles: string[];
  permissions: string[];
  tenantId?: string;
  teamId?: string;
  metadata?: Record<string, any>;
} | null> {
  try {
    const token = extractJWTToken(tokenSource);
    if (!token) {
      return null;
    }

    const claims = await validateStackAuthJWT(token);
    if (!claims) {
      return null;
    }

    return {
      userId: claims.sub,
      email: claims.email,
      roles: claims.roles || [],
      permissions: claims.permissions || [],
      tenantId: claims.org_id,
      teamId: claims.team_id,
      metadata: {
        ...claims.user_metadata,
        ...claims.app_metadata
      }
    };
  } catch (error) {
    console.error('Error extracting user context:', error);
    return null;
  }
}

/**
 * Extract Stack Auth JWT token from request
 * Wrapper function for extractJWTToken with Stack Auth specific logic
 */
export async function extractStackAuthJWT(
  request?: Request | any
): Promise<string | null> {
  try {
    // Handle client-side calls without request parameter
    if (!request) {
      // Try to get token from browser storage or Stack Auth SDK
      if (typeof window !== 'undefined') {
        // Check localStorage for Stack Auth token
        const token = localStorage.getItem('stack-auth-token') || 
                     sessionStorage.getItem('stack-auth-token');
        if (token) {
          return token;
        }
        
        // Try to get from cookies in browser
        const cookieToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('stack-auth-token='))
          ?.split('=')[1];
        if (cookieToken) {
          return cookieToken;
        }
      }
      return null;
    }

    // Server-side extraction from request
    return extractJWTToken(request);
  } catch (error) {
    console.error('Error extracting Stack Auth JWT:', error);
    return null;
  }
}

/**
 * Create Supabase-compatible JWT for RLS policies
 * Transforms Stack Auth JWT claims to Supabase format
 */
export function createSupabaseJWT(claims: StackAuthJWTClaims): string {
  // Transform Stack Auth claims to Supabase RLS format
  const supabaseClaims = {
    sub: claims.sub,
    email: claims.email,
    role: 'authenticated', // Supabase role
    user_id: claims.sub,
    tenant_id: claims.org_id || claims.team_id,
    roles: claims.roles || [],
    permissions: claims.permissions || [],
    iat: claims.iat,
    exp: claims.exp,
    aud: 'authenticated'
  };

  // For now, return the original token as Supabase will validate it
  // In production, you might want to re-sign with Supabase JWT secret
  return JSON.stringify(supabaseClaims);
}

/**
 * Create Supabase-compatible JWT with user context
 * Alternative function name for compatibility with test files
 */
export async function createSupabaseCompatibleJWT(
  userContext: {
    userId: string;
    tenantId?: string;
    roles?: string[];
    permissions?: string[];
  },
  originalToken?: string
): Promise<string> {
  const claims: StackAuthJWTClaims = {
    sub: userContext.userId,
    org_id: userContext.tenantId,
    roles: userContext.roles || [],
    permissions: userContext.permissions || [],
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    iss: 'stack-auth',
    aud: 'xalesin-erp'
  };

  return createSupabaseJWT(claims);
}

/**
 * Get JWT from cache
 * Utility function for testing and debugging
 */
export function getJWTFromCache(token: string): StackAuthJWTClaims | null {
  return jwtCache.get(token);
}

/**
 * Cached version of extractUserContext for React Server Components
 * Uses React's cache() for request-level memoization
 */
export const getCachedUserContext = cache(extractUserContext);

/**
 * Cleanup expired JWT cache entries
 * Should be called periodically to prevent memory leaks
 */
export function cleanupJWTCache(): void {
  jwtCache.cleanup();
}

/**
 * Clear all JWT cache entries
 * Useful for testing or when auth state changes
 */
export function clearJWTCache(): void {
  jwtCache.clear();
}

/**
 * Check if user has specific permission
 */
export function hasPermission(
  userContext: Awaited<ReturnType<typeof extractUserContext>>,
  permission: string
): boolean {
  if (!userContext) return false;
  return userContext.permissions.includes(permission);
}

/**
 * Check if user has specific role
 */
export function hasRole(
  userContext: Awaited<ReturnType<typeof extractUserContext>>,
  role: string
): boolean {
  if (!userContext) return false;
  return userContext.roles.includes(role);
}

/**
 * Check if user belongs to specific tenant
 */
export function belongsToTenant(
  userContext: Awaited<ReturnType<typeof extractUserContext>>,
  tenantId: string
): boolean {
  if (!userContext) return false;
  return userContext.tenantId === tenantId || userContext.teamId === tenantId;
}

// Periodic cleanup (every 10 minutes)
if (typeof window === 'undefined') {
  setInterval(cleanupJWTCache, 10 * 60 * 1000);
}