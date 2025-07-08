/**
 * tRPC Configuration for XalesIn ERP
 * 
 * This file sets up tRPC with Stack Auth authentication and Supabase integration.
 * Provides type-safe API calls with proper authentication and authorization.
 * 
 * Architecture:
 * - Stack Auth: Authentication and user context
 * - Supabase: Business data operations
 * - tRPC: Type-safe API layer with middleware
 * 
 * @author XalesIn ERP Team
 * @version 1.0.0
 */

import { initTRPC, TRPCError } from '@trpc/server'
import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { 
  getCurrentUser, 
  validateAuthAndGetContext, 
  hasPermission,
  type UserContext 
} from './stack-auth'
import { 
  createServerComponentClient, 
  createAuthenticatedClient,
  type SupabaseClient 
} from './supabase'
import { extractStackAuthJWT, validateStackAuthJWT } from './jwt-utils'

/**
 * Context type for tRPC procedures
 */
export interface Context {
  user: UserContext | null
  supabase: SupabaseClient
  userAgent?: string
  ip?: string
}

/**
 * Create context for tRPC procedures
 * This runs for every tRPC request and provides authentication context
 * Enhanced with JWT Token Bridge for Stack Auth to Supabase integration
 */
export async function createTRPCContext(opts: CreateNextContextOptions): Promise<Context> {
  const { req, res } = opts

  // Extract JWT token from request headers
  let jwtToken: string | undefined
  try {
    const extractedToken = await extractStackAuthJWT(req)
    jwtToken = extractedToken || undefined
    console.debug('JWT token extracted from request:', !!jwtToken)
  } catch (error) {
    console.warn('Failed to extract JWT token:', error)
  }

  // Get user context from Stack Auth
  const { userContext } = await validateAuthAndGetContext()

  // Create Supabase client with user context and JWT token if available
  let supabase: SupabaseClient
  
  if (userContext && jwtToken) {
    try {
      // Validate JWT token before using it
      const isValidJWT = await validateStackAuthJWT(jwtToken)
      
      if (isValidJWT) {
        // Create authenticated client with JWT token bridge
        supabase = await createAuthenticatedClient(userContext, false, jwtToken)
        console.debug('Supabase client created with JWT token bridge')
      } else {
        console.warn('Invalid JWT token, falling back to standard authentication')
        supabase = await createAuthenticatedClient(userContext)
      }
    } catch (error) {
      console.error('JWT token bridge error in tRPC context:', error)
      // Graceful fallback to standard authentication
      supabase = await createAuthenticatedClient(userContext)
    }
  } else if (userContext) {
    // Standard authentication without JWT token
    supabase = await createAuthenticatedClient(userContext)
  } else {
    // No authentication - use server component client
    supabase = createServerComponentClient()
  }

  return {
    user: userContext,
    supabase,
    userAgent: req.headers['user-agent'],
    ip: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
  }
}

/**
 * Initialize tRPC with context
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

/**
 * Export reusable router and procedure helpers
 */
export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory

/**
 * Public procedure - no authentication required
 */
export const publicProcedure = t.procedure

/**
 * Authentication middleware
 * Ensures user is authenticated before proceeding
 */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    })
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // Type-safe authenticated user
    },
  })
})

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)

/**
 * Permission-based middleware factory
 * Creates middleware that checks for specific permissions
 */
export function requirePermission(permission: string) {
  return t.middleware(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      })
    }

    if (!hasPermission(ctx.user, permission)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Permission required: ${permission}`,
      })
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    })
  })
}

/**
 * Admin middleware
 * Ensures user has admin privileges
 */
const enforceUserIsAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    })
  }

  if (!ctx.user.isAdmin) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin privileges required',
    })
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  })
})

/**
 * Admin procedure - requires admin privileges
 */
export const adminProcedure = t.procedure.use(enforceUserIsAdmin)

/**
 * Audit logging middleware
 * Logs all procedure calls for audit purposes
 */
const auditLogger = t.middleware(async ({ ctx, next, path, type, input }) => {
  const start = Date.now()
  
  try {
    const result = await next()
    
    // Log successful operations
    if (ctx.user) {
      await logAuditEvent({
        userId: ctx.user.userId,
        tenantId: ctx.user.tenantId,
        action: `${type}:${path}`,
        status: 'success',
        duration: Date.now() - start,
        ip: ctx.ip,
        userAgent: ctx.userAgent,
        input: sanitizeInput(input),
      })
    }
    
    return result
  } catch (error) {
    // Log failed operations
    if (ctx.user) {
      await logAuditEvent({
        userId: ctx.user.userId,
        tenantId: ctx.user.tenantId,
        action: `${type}:${path}`,
        status: 'error',
        duration: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error',
        ip: ctx.ip,
        userAgent: ctx.userAgent,
        input: sanitizeInput(input),
      })
    }
    
    throw error
  }
})

/**
 * Audited procedure - includes audit logging
 */
export const auditedProcedure = protectedProcedure.use(auditLogger)

/**
 * Rate limiting middleware
 * Prevents abuse by limiting requests per user
 */
const rateLimiter = t.middleware(async ({ ctx, next, path }) => {
  if (!ctx.user) {
    return next()
  }

  // Simple in-memory rate limiting (in production, use Redis)
  const key = `${ctx.user.userId}:${path}`
  const limit = getRateLimit(path)
  
  if (await isRateLimited(key, limit)) {
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: 'Rate limit exceeded',
    })
  }

  return next()
})

/**
 * Rate limited procedure
 */
export const rateLimitedProcedure = protectedProcedure.use(rateLimiter)

/**
 * Utility functions
 */

/**
 * Log audit events to Supabase
 */
async function logAuditEvent(event: {
  userId: string
  tenantId: string
  action: string
  status: 'success' | 'error'
  duration: number
  error?: string
  ip?: string
  userAgent?: string
  input?: any
}) {
  try {
    const supabase = createServerComponentClient()
    
    await supabase.from('audit_logs').insert({
      user_id: event.userId,
      tenant_id: event.tenantId,
      action: event.action,
      status: event.status,
      duration_ms: event.duration,
      error_message: event.error,
      ip_address: event.ip,
      user_agent: event.userAgent,
      input_data: event.input,
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to log audit event:', error)
  }
}

/**
 * Sanitize input for audit logging
 */
function sanitizeInput(input: any): any {
  if (!input) return null
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth']
  
  if (typeof input === 'object') {
    const sanitized = { ...input }
    
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]'
      }
    }
    
    return sanitized
  }
  
  return input
}

/**
 * Get rate limit for specific endpoint
 */
function getRateLimit(path: string): { requests: number; window: number } {
  // Define rate limits per endpoint (requests per window in seconds)
  const rateLimits: Record<string, { requests: number; window: number }> = {
    'auth.login': { requests: 5, window: 60 }, // 5 requests per minute
    'auth.register': { requests: 3, window: 60 }, // 3 requests per minute
    'inventory.create': { requests: 100, window: 60 }, // 100 requests per minute
    'inventory.update': { requests: 200, window: 60 }, // 200 requests per minute
    'inventory.delete': { requests: 50, window: 60 }, // 50 requests per minute
    'financial.create': { requests: 50, window: 60 }, // 50 requests per minute
    'reports.generate': { requests: 10, window: 60 }, // 10 requests per minute
  }
  
  return rateLimits[path] || { requests: 1000, window: 60 } // Default: 1000 per minute
}

/**
 * Check if request is rate limited
 */
async function isRateLimited(
  key: string, 
  limit: { requests: number; window: number }
): Promise<boolean> {
  // In production, implement with Redis
  // For now, return false (no rate limiting)
  return false
}

/**
 * Create procedure with specific permission requirement
 */
export function createPermissionProcedure(permission: string) {
  return protectedProcedure.use(requirePermission(permission))
}

/**
 * Batch operation middleware
 * Handles batch operations with proper error handling
 */
export const batchMiddleware = t.middleware(async ({ ctx, next, input }) => {
  // If input is an array, handle as batch operation
  if (Array.isArray(input)) {
    const results: any[] = []
    const errors: { index: number; error: any }[] = []
    
    for (let i = 0; i < input.length; i++) {
      try {
        const result = await next({ ctx: { ...ctx, batchIndex: i } })
        results.push(result)
      } catch (error) {
        errors.push({ index: i, error })
      }
    }
    
    if (errors.length > 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Batch operation failed',
        cause: errors,
      })
    }
    
    return { data: results, success: true } as any
  }
  
  return next()
})

/**
 * Batch procedure for handling multiple operations
 */
export const batchProcedure = protectedProcedure.use(batchMiddleware)

/**
 * Export types for client usage
 */