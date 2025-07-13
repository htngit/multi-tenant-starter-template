/**
 * Environment Variables Validation for XalesIn ERP
 * 
 * This file validates and exports environment variables with proper type safety.
 * It ensures all required configuration is present before the application starts.
 * 
 * Features:
 * - Runtime validation of environment variables
 * - Type-safe environment variable access
 * - Clear error messages for missing variables
 * - Support for different environments (dev, staging, prod)
 * 
 * @author XalesIn ERP Team
 * @version 1.0.0
 */

import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

/**
 * Environment variables schema
 */
export const env = createEnv({
  /**
   * Server-side environment variables
   * These are only available on the server and are never sent to the client
   */
  server: {
    // Node.js environment
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    
    // Stack Auth Configuration
    STACK_SECRET_SERVER_KEY: z.string().min(1, 'Stack Auth secret server key is required'),
    STACK_PROJECT_ID: z.string().min(1, 'Stack Auth project ID is required'),
    STACK_JWKS_URL: z.string().url('Stack Auth JWKS URL must be a valid URL'),
    
    // Supabase Configuration
    SUPABASE_PROJECT_ID: z.string().min(1, 'Supabase project ID is required'),
    SUPABASE_URL: z.string().url('Supabase URL must be a valid URL'),
    SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anonymous key is required'),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),
    
    // Database Configuration
    DATABASE_URL: z.string().url('Database URL must be a valid URL').optional(),
    
    // Email Configuration (optional)
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    SMTP_FROM: z.string().email().optional(),
    
    // File Storage Configuration (optional)
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_REGION: z.string().optional(),
    AWS_S3_BUCKET: z.string().optional(),
    
    // Redis Configuration (optional)
    REDIS_URL: z.string().url().optional(),
    
    // Analytics Configuration (optional)
    GOOGLE_ANALYTICS_ID: z.string().optional(),
    MIXPANEL_TOKEN: z.string().optional(),
    
    // Webhook Configuration (optional)
    WEBHOOK_SECRET: z.string().optional(),
    
    // Rate Limiting
    RATE_LIMIT_ENABLED: z.string().transform(val => val === 'true').default('false'),
    
    // Logging
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    
    // Security
    ENCRYPTION_KEY: z.string().min(32, 'Encryption key must be at least 32 characters').optional(),
    
    // Feature Flags
    FEATURE_ADVANCED_ANALYTICS: z.string().transform(val => val === 'true').default('false'),
    FEATURE_MULTI_CURRENCY: z.string().transform(val => val === 'true').default('false'),
    FEATURE_AUDIT_LOGS: z.string().transform(val => val === 'true').default('true'),
  },
  
  /**
   * Client-side environment variables
   * These are exposed to the browser and must be prefixed with NEXT_PUBLIC_
   */
  client: {
    // Stack Auth Public Configuration
    NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: z.string().min(1, 'Stack Auth publishable client key is required'),
    NEXT_PUBLIC_STACK_PROJECT_ID: z.string().min(1, 'Stack Auth project ID is required'),
    
    // Supabase Public Configuration
    NEXT_PUBLIC_SUPABASE_URL: z.string().url('Supabase URL must be a valid URL'),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anonymous key is required'),
    
    // Application Configuration
    NEXT_PUBLIC_APP_NAME: z.string().default('XalesIn ERP'),
    NEXT_PUBLIC_APP_VERSION: z.string().default('1.0.0'),
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    
    // Analytics (Public)
    NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: z.string().optional(),
    NEXT_PUBLIC_MIXPANEL_TOKEN: z.string().optional(),
    
    // Feature Flags (Public)
    NEXT_PUBLIC_FEATURE_DEMO_MODE: z.string().transform(val => val === 'true').default('false'),
    NEXT_PUBLIC_FEATURE_MAINTENANCE_MODE: z.string().transform(val => val === 'true').default('false'),
    
    // API Configuration
    NEXT_PUBLIC_API_URL: z.string().url().optional(),
    
    // Map/Location Services
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
    
    // Payment Configuration
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
    
    // Social Login
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
    NEXT_PUBLIC_MICROSOFT_CLIENT_ID: z.string().optional(),
  },
  
  /**
   * Runtime environment variables
   * These are the actual environment variables from process.env
   */
  runtimeEnv: {
    // Server-side
    NODE_ENV: process.env.NODE_ENV,
    STACK_SECRET_SERVER_KEY: process.env.STACK_SECRET_SERVER_KEY,
    STACK_PROJECT_ID: process.env.STACK_PROJECT_ID,
    STACK_JWKS_URL: process.env.STACK_JWKS_URL,
    SUPABASE_PROJECT_ID: process.env.SUPABASE_PROJECT_ID,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_FROM: process.env.SMTP_FROM,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
    REDIS_URL: process.env.REDIS_URL,
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
    MIXPANEL_TOKEN: process.env.MIXPANEL_TOKEN,
    WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
    RATE_LIMIT_ENABLED: process.env.RATE_LIMIT_ENABLED,
    LOG_LEVEL: process.env.LOG_LEVEL,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    FEATURE_ADVANCED_ANALYTICS: process.env.FEATURE_ADVANCED_ANALYTICS,
    FEATURE_MULTI_CURRENCY: process.env.FEATURE_MULTI_CURRENCY,
    FEATURE_AUDIT_LOGS: process.env.FEATURE_AUDIT_LOGS,
    
    // Client-side
    NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
    NEXT_PUBLIC_STACK_PROJECT_ID: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
    NEXT_PUBLIC_MIXPANEL_TOKEN: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
    NEXT_PUBLIC_FEATURE_DEMO_MODE: process.env.NEXT_PUBLIC_FEATURE_DEMO_MODE,
    NEXT_PUBLIC_FEATURE_MAINTENANCE_MODE: process.env.NEXT_PUBLIC_FEATURE_MAINTENANCE_MODE,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    NEXT_PUBLIC_MICROSOFT_CLIENT_ID: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID,
  },
  
  /**
   * Skip validation during build time
   * This is useful for Docker builds where env vars might not be available
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  
  /**
   * Makes it so that empty strings are treated as undefined
   * This is useful for optional environment variables
   */
  emptyStringAsUndefined: true,
})

/**
 * Environment-specific configurations
 */
export const isDevelopment = process.env.NODE_ENV === 'development'
export const isProduction = process.env.NODE_ENV === 'production'
export const isTest = process.env.NODE_ENV === 'test'

/**
 * Feature flags helper
 * Server-side feature flags should only be accessed on the server
 */
export const features = {
  // Server-side feature flags - only access these on the server
  get advancedAnalytics() {
    if (typeof window !== 'undefined') {
      throw new Error('Server-side feature flag accessed on client')
    }
    return env.FEATURE_ADVANCED_ANALYTICS
  },
  get multiCurrency() {
    if (typeof window !== 'undefined') {
      throw new Error('Server-side feature flag accessed on client')
    }
    return env.FEATURE_MULTI_CURRENCY
  },
  get auditLogs() {
    if (typeof window !== 'undefined') {
      throw new Error('Server-side feature flag accessed on client')
    }
    return env.FEATURE_AUDIT_LOGS
  },
  get rateLimiting() {
    if (typeof window !== 'undefined') {
      throw new Error('Server-side feature flag accessed on client')
    }
    return env.RATE_LIMIT_ENABLED
  },
  // Client-side feature flags - safe to access anywhere
  demoMode: env.NEXT_PUBLIC_FEATURE_DEMO_MODE,
  maintenanceMode: env.NEXT_PUBLIC_FEATURE_MAINTENANCE_MODE,
}

/**
 * Database configuration helper
 * Server-side database configs should only be accessed on the server
 */
export const database = {
  get url() {
    if (typeof window !== 'undefined') {
      throw new Error('Server-side database URL accessed on client')
    }
    return env.DATABASE_URL || env.SUPABASE_URL
  },
  supabase: {
    // Client-safe Supabase config (uses NEXT_PUBLIC_ variables)
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    get serviceRoleKey() {
      if (typeof window !== 'undefined') {
        throw new Error('Server-side service role key accessed on client')
      }
      return env.SUPABASE_SERVICE_ROLE_KEY
    },
    get projectId() {
      if (typeof window !== 'undefined') {
        throw new Error('Server-side project ID accessed on client')
      }
      return env.SUPABASE_PROJECT_ID
    },
  },
}

/**
 * Authentication configuration helper
 * Server-side auth configs should only be accessed on the server
 */
export const auth = {
  stackAuth: {
    get projectId() {
      if (typeof window !== 'undefined') {
        throw new Error('Server-side Stack Auth project ID accessed on client')
      }
      return env.STACK_PROJECT_ID
    },
    // Client-safe publishable key
    publishableKey: env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
    get secretKey() {
      if (typeof window !== 'undefined') {
        throw new Error('Server-side Stack Auth secret key accessed on client')
      }
      return env.STACK_SECRET_SERVER_KEY
    },
    get jwksUrl() {
      if (typeof window !== 'undefined') {
        throw new Error('Server-side Stack Auth JWKS URL accessed on client')
      }
      return env.STACK_JWKS_URL
    },
  },
}

/**
 * Application configuration helper
 */
export const app = {
  name: env.NEXT_PUBLIC_APP_NAME,
  version: env.NEXT_PUBLIC_APP_VERSION,
  url: env.NEXT_PUBLIC_APP_URL,
  isDevelopment,
  isProduction,
  isTest,
}

/**
 * Logging configuration helper
 * Server-side logging configs should only be accessed on the server
 */
export const logging = {
  get level() {
    if (typeof window !== 'undefined') {
      throw new Error('Server-side log level accessed on client')
    }
    return env.LOG_LEVEL
  },
  isDevelopment,
}

/**
 * Export the validated environment
 */
export default env