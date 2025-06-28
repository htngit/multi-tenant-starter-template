/**
 * Stack Auth Configuration for XalesIn ERP
 * 
 * This file provides Stack Auth integration for Next.js with proper TypeScript support.
 * Handles authentication, user management, multi-tenancy, and core RBAC.
 * 
 * Architecture:
 * - Stack Auth: Single source of truth for authentication and user management
 * - Provides user context (userId, tenantId, roles, permissions) to business logic
 * - Integrates with Supabase for business data operations
 * 
 * @author XalesIn ERP Team
 * @version 1.0.0
 */

import { StackServerApp, StackClientApp } from '@stackframe/stack'
import { cookies } from 'next/headers'

// Environment variables validation
const stackProjectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID!
const stackPublishableClientKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY!
const stackSecretServerKey = process.env.STACK_SECRET_SERVER_KEY!
const stackApiUrl = process.env.NEXT_PUBLIC_STACK_API_URL || 'https://api.stack-auth.com'

if (!stackProjectId || !stackPublishableClientKey) {
  throw new Error(
    'Missing Stack Auth environment variables. Please check your .env.local file.'
  )
}

if (!stackSecretServerKey && typeof window === 'undefined') {
  console.warn(
    'Stack Auth secret server key not found. Server-side operations will be limited.'
  )
}

/**
 * Client-side Stack Auth configuration
 * Use this in React components and client-side code
 */
export const stackClientApp = new StackClientApp({
  projectId: stackProjectId,
  publishableClientKey: stackPublishableClientKey,
  baseUrl: stackApiUrl,
})

/**
 * Server-side Stack Auth configuration
 * Use this in API routes, server actions, and server components
 */
export const stackServerApp = new StackServerApp({
  projectId: stackProjectId,
  publishableClientKey: stackPublishableClientKey,
  secretServerKey: stackSecretServerKey,
  baseUrl: stackApiUrl,
})

/**
 * User context type definition
 * This represents the authenticated user with tenant and permission context
 */
export interface UserContext {
  userId: string
  email: string
  displayName: string | null
  tenantId: string
  tenantName: string
  roles: string[]
  permissions: string[]
  isAdmin: boolean
  isMember: boolean
  profileImageUrl: string | null
  createdAt: Date
  lastActiveAt: Date
}

/**
 * Tenant context type definition
 */
export interface TenantContext {
  tenantId: string
  tenantName: string
  tenantSlug: string
  isOwner: boolean
  memberCount: number
  plan: 'free' | 'pro' | 'enterprise'
  createdAt: Date
  settings: Record<string, any>
}

/**
 * Permission definitions for XalesIn ERP
 * These should match the permissions configured in Stack Auth dashboard
 */
export const PERMISSIONS = {
  // Inventory Management
  INVENTORY_READ: 'inventory:read',
  INVENTORY_WRITE: 'inventory:write',
  INVENTORY_DELETE: 'inventory:delete',
  INVENTORY_ADMIN: 'inventory:admin',
  
  // Financial Management
  FINANCIAL_READ: 'financial:read',
  FINANCIAL_WRITE: 'financial:write',
  FINANCIAL_DELETE: 'financial:delete',
  FINANCIAL_ADMIN: 'financial:admin',
  
  // Document Management
  DOCUMENT_READ: 'document:read',
  DOCUMENT_WRITE: 'document:write',
  DOCUMENT_DELETE: 'document:delete',
  DOCUMENT_ADMIN: 'document:admin',
  
  // Party Management (CRM)
  PARTY_READ: 'party:read',
  PARTY_WRITE: 'party:write',
  PARTY_DELETE: 'party:delete',
  PARTY_ADMIN: 'party:admin',
  
  // Sales & Purchasing
  SALES_READ: 'sales:read',
  SALES_WRITE: 'sales:write',
  SALES_DELETE: 'sales:delete',
  SALES_ADMIN: 'sales:admin',
  
  PURCHASING_READ: 'purchasing:read',
  PURCHASING_WRITE: 'purchasing:write',
  PURCHASING_DELETE: 'purchasing:delete',
  PURCHASING_ADMIN: 'purchasing:admin',
  
  // Reporting & Analytics
  REPORTING_READ: 'reporting:read',
  REPORTING_WRITE: 'reporting:write',
  REPORTING_ADMIN: 'reporting:admin',
  
  // System Administration
  SYSTEM_ADMIN: 'system:admin',
  USER_MANAGEMENT: 'user:management',
  TENANT_MANAGEMENT: 'tenant:management',
} as const

/**
 * Role definitions for XalesIn ERP
 */
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  TENANT_ADMIN: 'tenant_admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  VIEWER: 'viewer',
} as const

/**
 * Get current user context from Stack Auth
 * Use this in server components and API routes
 */
export async function getCurrentUser(): Promise<UserContext | null> {
  try {
    const user = await stackServerApp.getUser()
    if (!user) return null

    const selectedTeam = user.selectedTeam
    if (!selectedTeam) return null

    // Get user permissions for the current tenant
    const permissions = await getUserPermissions(user.id, selectedTeam.id)
    const roles = await getUserRoles(user.id, selectedTeam.id)

    return {
      userId: user.id,
      email: user.primaryEmail || '',
      displayName: user.displayName,
      tenantId: selectedTeam.id,
      tenantName: selectedTeam.displayName,
      roles,
      permissions,
      isAdmin: roles.includes(ROLES.TENANT_ADMIN) || roles.includes(ROLES.SUPER_ADMIN),
      isMember: true,
      profileImageUrl: user.profileImageUrl,
      createdAt: user.createdAt,
      lastActiveAt: user.lastActiveAt || user.createdAt,
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Get user permissions for a specific tenant
 */
export async function getUserPermissions(
  userId: string,
  tenantId: string
): Promise<string[]> {
  try {
    // This would typically call Stack Auth API to get user permissions
    // For now, return a default set based on user role
    const roles = await getUserRoles(userId, tenantId)
    
    if (roles.includes(ROLES.SUPER_ADMIN)) {
      return Object.values(PERMISSIONS)
    }
    
    if (roles.includes(ROLES.TENANT_ADMIN)) {
      return [
        PERMISSIONS.INVENTORY_ADMIN,
        PERMISSIONS.FINANCIAL_ADMIN,
        PERMISSIONS.DOCUMENT_ADMIN,
        PERMISSIONS.PARTY_ADMIN,
        PERMISSIONS.SALES_ADMIN,
        PERMISSIONS.PURCHASING_ADMIN,
        PERMISSIONS.REPORTING_ADMIN,
        PERMISSIONS.USER_MANAGEMENT,
      ]
    }
    
    if (roles.includes(ROLES.MANAGER)) {
      return [
        PERMISSIONS.INVENTORY_WRITE,
        PERMISSIONS.FINANCIAL_READ,
        PERMISSIONS.DOCUMENT_WRITE,
        PERMISSIONS.PARTY_WRITE,
        PERMISSIONS.SALES_WRITE,
        PERMISSIONS.PURCHASING_WRITE,
        PERMISSIONS.REPORTING_READ,
      ]
    }
    
    if (roles.includes(ROLES.STAFF)) {
      return [
        PERMISSIONS.INVENTORY_READ,
        PERMISSIONS.DOCUMENT_READ,
        PERMISSIONS.PARTY_READ,
        PERMISSIONS.SALES_READ,
        PERMISSIONS.PURCHASING_READ,
      ]
    }
    
    // Default viewer permissions
    return [
      PERMISSIONS.INVENTORY_READ,
      PERMISSIONS.DOCUMENT_READ,
      PERMISSIONS.PARTY_READ,
    ]
  } catch (error) {
    console.error('Error getting user permissions:', error)
    return []
  }
}

/**
 * Get user roles for a specific tenant
 */
export async function getUserRoles(
  userId: string,
  tenantId: string
): Promise<string[]> {
  try {
    // This would typically call Stack Auth API to get user roles
    // For now, return a default role
    return [ROLES.STAFF] // Default role
  } catch (error) {
    console.error('Error getting user roles:', error)
    return []
  }
}

/**
 * Check if user has specific permission
 */
export function hasPermission(
  userContext: UserContext,
  permission: string
): boolean {
  return userContext.permissions.includes(permission)
}

/**
 * Check if user has specific role
 */
export function hasRole(
  userContext: UserContext,
  role: string
): boolean {
  return userContext.roles.includes(role)
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  userContext: UserContext,
  permissions: string[]
): boolean {
  return permissions.some(permission => 
    userContext.permissions.includes(permission)
  )
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(
  userContext: UserContext,
  permissions: string[]
): boolean {
  return permissions.every(permission => 
    userContext.permissions.includes(permission)
  )
}

/**
 * Get available tenants for current user
 */
export async function getUserTenants(): Promise<TenantContext[]> {
  try {
    const user = await stackServerApp.getUser()
    if (!user) return []

    const teams = user.teams || []
    
    return teams.map(team => ({
      tenantId: team.id,
      tenantName: team.displayName,
      tenantSlug: team.id, // Stack Auth doesn't have slug, using ID
      isOwner: team.role === 'owner',
      memberCount: 0, // Would need to fetch from Stack Auth API
      plan: 'free', // Would need to fetch from Stack Auth API
      createdAt: team.createdAt,
      settings: {},
    }))
  } catch (error) {
    console.error('Error getting user tenants:', error)
    return []
  }
}

/**
 * Switch to a different tenant
 */
export async function switchTenant(tenantId: string): Promise<boolean> {
  try {
    const user = await stackServerApp.getUser()
    if (!user) return false

    // Switch to the specified team
    await user.setSelectedTeam(tenantId)
    return true
  } catch (error) {
    console.error('Error switching tenant:', error)
    return false
  }
}

/**
 * Middleware helper to validate authentication and inject user context
 */
export async function validateAuthAndGetContext(): Promise<{
  isAuthenticated: boolean
  userContext: UserContext | null
  error?: string
}> {
  try {
    const userContext = await getCurrentUser()
    
    if (!userContext) {
      return {
        isAuthenticated: false,
        userContext: null,
        error: 'User not authenticated'
      }
    }

    return {
      isAuthenticated: true,
      userContext
    }
  } catch (error) {
    return {
      isAuthenticated: false,
      userContext: null,
      error: error instanceof Error ? error.message : 'Authentication error'
    }
  }
}

/**
 * Export Stack Auth instances for direct usage
 */
export { stackClientApp as stackAuth }
export { stackServerApp as stackAuthServer }

/**
 * Export types
 */
export type { UserContext, TenantContext }

/**
 * Default export for convenience
 */
export default stackClientApp