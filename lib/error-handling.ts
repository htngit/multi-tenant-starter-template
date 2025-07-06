/**
 * Standardized Error Handling Utilities
 * 
 * This module provides consistent error handling patterns across all tRPC routers,
 * including error classification, logging, and user-friendly error messages.
 */

import { TRPCError } from '@trpc/server'
import { PostgrestError } from '@supabase/supabase-js'

/**
 * Error categories for better error classification
 */
export enum ErrorCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT = 'RATE_LIMIT',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  DATABASE = 'DATABASE',
  INTERNAL = 'INTERNAL'
}

/**
 * Error context for enhanced logging and debugging
 */
export interface ErrorContext {
  userId?: string
  tenantId?: string
  operation: string
  resource?: string
  metadata?: Record<string, any>
  originalError?: Error | PostgrestError
}

/**
 * Standardized error response structure
 */
export interface StandardError {
  code: string
  message: string
  category: ErrorCategory
  context: ErrorContext
  timestamp: string
  requestId?: string
}

/**
 * Enhanced error logger with structured logging
 */
export class ErrorLogger {
  static log(error: StandardError): void {
    const logEntry = {
      timestamp: error.timestamp,
      level: 'error',
      category: error.category,
      code: error.code,
      message: error.message,
      operation: error.context.operation,
      userId: error.context.userId,
      tenantId: error.context.tenantId,
      resource: error.context.resource,
      metadata: error.context.metadata,
      originalError: error.context.originalError?.message,
      stack: error.context.originalError?.stack,
      requestId: error.requestId
    }

    // In production, this would integrate with your logging service
    // (e.g., Winston, Pino, DataDog, etc.)
    console.error('TRPC_ERROR:', JSON.stringify(logEntry, null, 2))
  }
}

/**
 * Maps Supabase/PostgreSQL errors to appropriate tRPC error codes
 */
export function mapDatabaseError(error: PostgrestError): {
  code: TRPCError['code']
  category: ErrorCategory
  message: string
} {
  // PostgreSQL error codes mapping
  const pgErrorCode = error.code
  
  switch (pgErrorCode) {
    case '23505': // unique_violation
      return {
        code: 'CONFLICT',
        category: ErrorCategory.CONFLICT,
        message: 'Resource already exists'
      }
    case '23503': // foreign_key_violation
      return {
        code: 'BAD_REQUEST',
        category: ErrorCategory.VALIDATION,
        message: 'Invalid reference to related resource'
      }
    case '23502': // not_null_violation
      return {
        code: 'BAD_REQUEST',
        category: ErrorCategory.VALIDATION,
        message: 'Required field is missing'
      }
    case '42501': // insufficient_privilege
      return {
        code: 'FORBIDDEN',
        category: ErrorCategory.AUTHORIZATION,
        message: 'Insufficient permissions'
      }
    case '42P01': // undefined_table
    case '42703': // undefined_column
      return {
        code: 'INTERNAL_SERVER_ERROR',
        category: ErrorCategory.DATABASE,
        message: 'Database schema error'
      }
    default:
      return {
        code: 'INTERNAL_SERVER_ERROR',
        category: ErrorCategory.DATABASE,
        message: 'Database operation failed'
      }
  }
}

/**
 * Creates standardized tRPC errors with enhanced context
 */
export class StandardErrorHandler {
  /**
   * Creates a standardized tRPC error
   */
  static createError(
    category: ErrorCategory,
    message: string,
    context: ErrorContext,
    code?: TRPCError['code']
  ): TRPCError {
    const errorCode = code || this.getDefaultCodeForCategory(category)
    const standardError: StandardError = {
      code: errorCode,
      message,
      category,
      context,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId()
    }

    // Log the error
    ErrorLogger.log(standardError)

    return new TRPCError({
      code: errorCode,
      message,
      cause: context.originalError
    })
  }

  /**
   * Handles database errors with automatic mapping
   */
  static handleDatabaseError(
    error: PostgrestError,
    context: ErrorContext
  ): TRPCError {
    const { code, category, message } = mapDatabaseError(error)
    return this.createError(category, message, {
      ...context,
      originalError: error
    }, code)
  }

  /**
   * Handles unknown errors with fallback behavior
   */
  static handleUnknownError(
    error: unknown,
    context: ErrorContext
  ): TRPCError {
    if (error instanceof TRPCError) {
      return error
    }

    if (error && typeof error === 'object' && 'code' in error) {
      return this.handleDatabaseError(error as PostgrestError, context)
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return this.createError(
      ErrorCategory.INTERNAL,
      errorMessage,
      {
        ...context,
        originalError: error instanceof Error ? error : new Error(String(error))
      }
    )
  }

  /**
   * Creates validation errors
   */
  static validationError(
    message: string,
    context: ErrorContext,
    field?: string
  ): TRPCError {
    return this.createError(
      ErrorCategory.VALIDATION,
      message,
      {
        ...context,
        metadata: { ...context.metadata, field }
      },
      'BAD_REQUEST'
    )
  }

  /**
   * Creates authorization errors
   */
  static authorizationError(
    message: string,
    context: ErrorContext,
    requiredPermission?: string
  ): TRPCError {
    return this.createError(
      ErrorCategory.AUTHORIZATION,
      message,
      {
        ...context,
        metadata: { ...context.metadata, requiredPermission }
      },
      'FORBIDDEN'
    )
  }

  /**
   * Creates not found errors
   */
  static notFoundError(
    resource: string,
    context: ErrorContext,
    identifier?: string
  ): TRPCError {
    return this.createError(
      ErrorCategory.NOT_FOUND,
      `${resource} not found`,
      {
        ...context,
        resource,
        metadata: { ...context.metadata, identifier }
      },
      'NOT_FOUND'
    )
  }

  /**
   * Creates conflict errors
   */
  static conflictError(
    message: string,
    context: ErrorContext,
    conflictField?: string
  ): TRPCError {
    return this.createError(
      ErrorCategory.CONFLICT,
      message,
      {
        ...context,
        metadata: { ...context.metadata, conflictField }
      },
      'CONFLICT'
    )
  }

  private static getDefaultCodeForCategory(category: ErrorCategory): TRPCError['code'] {
    switch (category) {
      case ErrorCategory.AUTHENTICATION:
        return 'UNAUTHORIZED'
      case ErrorCategory.AUTHORIZATION:
        return 'FORBIDDEN'
      case ErrorCategory.VALIDATION:
        return 'BAD_REQUEST'
      case ErrorCategory.NOT_FOUND:
        return 'NOT_FOUND'
      case ErrorCategory.CONFLICT:
        return 'CONFLICT'
      case ErrorCategory.RATE_LIMIT:
        return 'TOO_MANY_REQUESTS'
      case ErrorCategory.EXTERNAL_SERVICE:
      case ErrorCategory.DATABASE:
      case ErrorCategory.INTERNAL:
      default:
        return 'INTERNAL_SERVER_ERROR'
    }
  }

  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * Utility function for wrapping async operations with standardized error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: ErrorContext
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    throw StandardErrorHandler.handleUnknownError(error, context)
  }
}

/**
 * Decorator for adding error handling to tRPC procedures
 */
export function withStandardErrorHandling(context: Partial<ErrorContext>) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const originalMethod = descriptor.value!
    
    descriptor.value = async function (this: any, ...args: any[]) {
      try {
        return await originalMethod.apply(this, args)
      } catch (error) {
        const fullContext: ErrorContext = {
          operation: `${target.constructor.name}.${propertyKey}`,
          ...context
        }
        throw StandardErrorHandler.handleUnknownError(error, fullContext)
      }
    } as T
    
    return descriptor
  }
}