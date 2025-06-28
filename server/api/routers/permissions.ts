/**
 * Permissions Router for tRPC
 * 
 * This router handles all permission and role-related operations in the multi-tenant ERP system.
 * It provides endpoints for role management, permission assignment, and access control.
 * 
 * Features:
 * - Role creation and management
 * - Permission assignment and revocation
 * - Role-based access control (RBAC)
 * - Permission inheritance and hierarchies
 * - Tenant-specific role isolation
 * - Audit logging for permission changes
 * 
 * @author XalesIn ERP Team
 * @version 1.0.0
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { 
  createTRPCRouter, 
  protectedProcedure,
  auditedProcedure,
  createPermissionProcedure
} from '../../../lib/trpc'

/**
 * Input validation schemas
 */
const roleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(50, 'Role name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  permissions: z.array(z.string()).default([]),
  isSystemRole: z.boolean().default(false),
  parentRoleId: z.string().uuid('Invalid parent role ID').optional(),
})

const updateRoleSchema = roleSchema.partial().extend({
  id: z.string().uuid('Invalid role ID'),
})

const assignRoleSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  roleIds: z.array(z.string().uuid('Invalid role ID')),
})

const permissionSchema = z.object({
  name: z.string().min(1, 'Permission name is required'),
  description: z.string().max(500, 'Description too long').optional(),
  resource: z.string().min(1, 'Resource is required'),
  action: z.string().min(1, 'Action is required'),
  category: z.string().optional(),
})

/**
 * Permission-based procedures
 */
const roleReadProcedure = createPermissionProcedure('role:read')
const roleWriteProcedure = createPermissionProcedure('role:write')
const roleAdminProcedure = createPermissionProcedure('role:admin')
const permissionReadProcedure = createPermissionProcedure('permission:read')
const permissionWriteProcedure = createPermissionProcedure('permission:write')

/**
 * Default system permissions
 */
const SYSTEM_PERMISSIONS = [
  // User management
  { name: 'user:read', description: 'View users', resource: 'user', action: 'read', category: 'User Management' },
  { name: 'user:write', description: 'Create and edit users', resource: 'user', action: 'write', category: 'User Management' },
  { name: 'user:delete', description: 'Delete users', resource: 'user', action: 'delete', category: 'User Management' },
  { name: 'user:invite', description: 'Invite new users', resource: 'user', action: 'invite', category: 'User Management' },
  { name: 'user:admin', description: 'Full user administration', resource: 'user', action: 'admin', category: 'User Management' },
  
  // Role management
  { name: 'role:read', description: 'View roles', resource: 'role', action: 'read', category: 'Role Management' },
  { name: 'role:write', description: 'Create and edit roles', resource: 'role', action: 'write', category: 'Role Management' },
  { name: 'role:delete', description: 'Delete roles', resource: 'role', action: 'delete', category: 'Role Management' },
  { name: 'role:admin', description: 'Full role administration', resource: 'role', action: 'admin', category: 'Role Management' },
  
  // Permission management
  { name: 'permission:read', description: 'View permissions', resource: 'permission', action: 'read', category: 'Permission Management' },
  { name: 'permission:write', description: 'Manage permissions', resource: 'permission', action: 'write', category: 'Permission Management' },
  
  // Inventory management
  { name: 'inventory:read', description: 'View inventory', resource: 'inventory', action: 'read', category: 'Inventory' },
  { name: 'inventory:write', description: 'Manage inventory', resource: 'inventory', action: 'write', category: 'Inventory' },
  { name: 'inventory:admin', description: 'Full inventory administration', resource: 'inventory', action: 'admin', category: 'Inventory' },
  
  // Financial management
  { name: 'financial:read', description: 'View financial data', resource: 'financial', action: 'read', category: 'Financial' },
  { name: 'financial:write', description: 'Manage financial data', resource: 'financial', action: 'write', category: 'Financial' },
  { name: 'financial:admin', description: 'Full financial administration', resource: 'financial', action: 'admin', category: 'Financial' },
  
  // Reports and analytics
  { name: 'reports:read', description: 'View reports', resource: 'reports', action: 'read', category: 'Reports' },
  { name: 'reports:write', description: 'Create and edit reports', resource: 'reports', action: 'write', category: 'Reports' },
  { name: 'reports:admin', description: 'Full reports administration', resource: 'reports', action: 'admin', category: 'Reports' },
  
  // Tenant management
  { name: 'tenant:read', description: 'View tenant information', resource: 'tenant', action: 'read', category: 'Tenant Management' },
  { name: 'tenant:write', description: 'Manage tenant settings', resource: 'tenant', action: 'write', category: 'Tenant Management' },
  { name: 'tenant:admin', description: 'Full tenant administration', resource: 'tenant', action: 'admin', category: 'Tenant Management' },
  
  // Billing management
  { name: 'billing:read', description: 'View billing information', resource: 'billing', action: 'read', category: 'Billing' },
  { name: 'billing:write', description: 'Manage billing', resource: 'billing', action: 'write', category: 'Billing' },
  
  // System administration
  { name: 'system:read', description: 'View system information', resource: 'system', action: 'read', category: 'System' },
  { name: 'system:write', description: 'Manage system settings', resource: 'system', action: 'write', category: 'System' },
  { name: 'system:admin', description: 'Full system administration', resource: 'system', action: 'admin', category: 'System' },
]

/**
 * Permissions router
 */
export const permissionsRouter = createTRPCRouter({
  /**
   * Get all available permissions
   */
  getAvailablePermissions: permissionReadProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: permissions, error } = await ctx.supabase
          .from('permissions')
          .select('*')
          .order('category')
          .order('name')

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch permissions',
            cause: error,
          })
        }

        // Group permissions by category
        const groupedPermissions = (permissions || []).reduce((acc, permission) => {
          const category = permission.category || 'Other'
          if (!acc[category]) {
            acc[category] = []
          }
          acc[category].push(permission)
          return acc
        }, {} as Record<string, any[]>)

        return groupedPermissions
      } catch (error) {
        console.error('Get available permissions error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch permissions',
        })
      }
    }),

  /**
   * Initialize system permissions
   */
  initializeSystemPermissions: auditedProcedure
    .use(roleAdminProcedure.middleware)
    .mutation(async ({ ctx }) => {
      try {
        // Check if permissions already exist
        const { data: existingPermissions } = await ctx.supabase
          .from('permissions')
          .select('name')

        const existingPermissionNames = new Set(existingPermissions?.map(p => p.name) || [])
        const newPermissions = SYSTEM_PERMISSIONS.filter(p => !existingPermissionNames.has(p.name))

        if (newPermissions.length === 0) {
          return {
            success: true,
            message: 'All system permissions already exist',
            created: 0,
          }
        }

        const { error } = await ctx.supabase
          .from('permissions')
          .insert(newPermissions.map(permission => ({
            ...permission,
            created_by: ctx.user.userId,
            updated_by: ctx.user.userId,
          })))

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to initialize system permissions',
            cause: error,
          })
        }

        return {
          success: true,
          message: `Created ${newPermissions.length} system permissions`,
          created: newPermissions.length,
        }
      } catch (error) {
        console.error('Initialize system permissions error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to initialize system permissions',
        })
      }
    }),

  /**
   * Get all roles in tenant
   */
  getRoles: roleReadProcedure
    .input(z.object({
      includeSystemRoles: z.boolean().default(true),
      includePermissions: z.boolean().default(true),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const { includeSystemRoles, includePermissions } = input

        let query = ctx.supabase
          .from('roles')
          .select(`
            *,
            parent_role:roles!roles_parent_role_id_fkey(id, name),
            child_roles:roles!roles_parent_role_id_fkey(id, name),
            user_roles(count)
          `)
          .eq('tenant_id', ctx.user.tenantId)

        if (!includeSystemRoles) {
          query = query.eq('is_system_role', false)
        }

        query = query.order('is_system_role', { ascending: false })
                    .order('name')

        const { data: roles, error } = await query

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch roles',
            cause: error,
          })
        }

        // Process roles data
        const processedRoles = (roles || []).map(role => ({
          ...role,
          userCount: role.user_roles?.[0]?.count || 0,
          permissions: includePermissions ? (role.permissions || []) : undefined,
        }))

        return processedRoles
      } catch (error) {
        console.error('Get roles error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch roles',
        })
      }
    }),

  /**
   * Get role by ID
   */
  getRoleById: roleReadProcedure
    .input(z.object({
      roleId: z.string().uuid('Invalid role ID'),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const { data: role, error } = await ctx.supabase
          .from('roles')
          .select(`
            *,
            parent_role:roles!roles_parent_role_id_fkey(id, name, description),
            child_roles:roles!roles_parent_role_id_fkey(id, name, description),
            user_roles(
              user_id,
              assigned_at,
              assigned_by,
              users(id, first_name, last_name, email)
            ),
            created_by_user:users!roles_created_by_fkey(first_name, last_name),
            updated_by_user:users!roles_updated_by_fkey(first_name, last_name)
          `)
          .eq('id', input.roleId)
          .eq('tenant_id', ctx.user.tenantId)
          .single()

        if (error) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Role not found',
            cause: error,
          })
        }

        return role
      } catch (error) {
        console.error('Get role by ID error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch role',
        })
      }
    }),

  /**
   * Create new role
   */
  createRole: auditedProcedure
    .use(roleWriteProcedure.middleware)
    .input(roleSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { name, description, color, permissions, isSystemRole, parentRoleId } = input

        // Check if role name already exists in tenant
        const { data: existingRole } = await ctx.supabase
          .from('roles')
          .select('id')
          .eq('name', name)
          .eq('tenant_id', ctx.user.tenantId)
          .single()

        if (existingRole) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Role with this name already exists',
          })
        }

        // Validate parent role if provided
        if (parentRoleId) {
          const { data: parentRole, error: parentError } = await ctx.supabase
            .from('roles')
            .select('id')
            .eq('id', parentRoleId)
            .eq('tenant_id', ctx.user.tenantId)
            .single()

          if (parentError || !parentRole) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Invalid parent role',
            })
          }
        }

        // Validate permissions
        if (permissions.length > 0) {
          const { data: validPermissions, error: permError } = await ctx.supabase
            .from('permissions')
            .select('name')
            .in('name', permissions)

          const validPermissionNames = new Set(validPermissions?.map(p => p.name) || [])
          const invalidPermissions = permissions.filter(p => !validPermissionNames.has(p))

          if (invalidPermissions.length > 0) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: `Invalid permissions: ${invalidPermissions.join(', ')}`,
            })
          }
        }

        const { data: role, error } = await ctx.supabase
          .from('roles')
          .insert({
            name,
            description,
            color,
            permissions,
            is_system_role: isSystemRole,
            parent_role_id: parentRoleId,
            tenant_id: ctx.user.tenantId,
            created_by: ctx.user.userId,
            updated_by: ctx.user.userId,
          })
          .select()
          .single()

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create role',
            cause: error,
          })
        }

        return role
      } catch (error) {
        console.error('Create role error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create role',
        })
      }
    }),

  /**
   * Update role
   */
  updateRole: auditedProcedure
    .use(roleWriteProcedure.middleware)
    .input(updateRoleSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, name, permissions, parentRoleId, ...updateData } = input

        // Check if role exists and belongs to tenant
        const { data: existingRole, error: roleError } = await ctx.supabase
          .from('roles')
          .select('id, name, is_system_role')
          .eq('id', id)
          .eq('tenant_id', ctx.user.tenantId)
          .single()

        if (roleError || !existingRole) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Role not found',
          })
        }

        // Prevent modification of system roles (unless user has admin permission)
        if (existingRole.is_system_role) {
          // Check if user has system admin permission
          // This would be handled by additional permission checks
        }

        // Check if name is being changed and if it's already taken
        if (name && name !== existingRole.name) {
          const { data: nameConflict } = await ctx.supabase
            .from('roles')
            .select('id')
            .eq('name', name)
            .eq('tenant_id', ctx.user.tenantId)
            .neq('id', id)
            .single()

          if (nameConflict) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Role with this name already exists',
            })
          }
        }

        // Validate parent role if provided
        if (parentRoleId) {
          // Prevent circular references
          if (parentRoleId === id) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Role cannot be its own parent',
            })
          }

          const { data: parentRole, error: parentError } = await ctx.supabase
            .from('roles')
            .select('id')
            .eq('id', parentRoleId)
            .eq('tenant_id', ctx.user.tenantId)
            .single()

          if (parentError || !parentRole) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Invalid parent role',
            })
          }
        }

        // Validate permissions if provided
        if (permissions && permissions.length > 0) {
          const { data: validPermissions, error: permError } = await ctx.supabase
            .from('permissions')
            .select('name')
            .in('name', permissions)

          const validPermissionNames = new Set(validPermissions?.map(p => p.name) || [])
          const invalidPermissions = permissions.filter(p => !validPermissionNames.has(p))

          if (invalidPermissions.length > 0) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: `Invalid permissions: ${invalidPermissions.join(', ')}`,
            })
          }
        }

        const { data: role, error } = await ctx.supabase
          .from('roles')
          .update({
            name,
            permissions,
            parent_role_id: parentRoleId,
            ...updateData,
            updated_by: ctx.user.userId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single()

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update role',
            cause: error,
          })
        }

        return role
      } catch (error) {
        console.error('Update role error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update role',
        })
      }
    }),

  /**
   * Delete role
   */
  deleteRole: auditedProcedure
    .use(roleWriteProcedure.middleware)
    .input(z.object({
      roleId: z.string().uuid('Invalid role ID'),
      transferUsersToRoleId: z.string().uuid('Invalid transfer role ID').optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { roleId, transferUsersToRoleId } = input

        // Check if role exists and belongs to tenant
        const { data: role, error: roleError } = await ctx.supabase
          .from('roles')
          .select('id, name, is_system_role')
          .eq('id', roleId)
          .eq('tenant_id', ctx.user.tenantId)
          .single()

        if (roleError || !role) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Role not found',
          })
        }

        // Prevent deletion of system roles
        if (role.is_system_role) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot delete system roles',
          })
        }

        // Check if role has users assigned
        const { data: userRoles, error: userRolesError } = await ctx.supabase
          .from('user_roles')
          .select('user_id')
          .eq('role_id', roleId)

        if (userRolesError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to check role assignments',
            cause: userRolesError,
          })
        }

        if (userRoles && userRoles.length > 0) {
          if (!transferUsersToRoleId) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Role has users assigned. Specify a role to transfer users to.',
            })
          }

          // Validate transfer role
          const { data: transferRole, error: transferError } = await ctx.supabase
            .from('roles')
            .select('id')
            .eq('id', transferUsersToRoleId)
            .eq('tenant_id', ctx.user.tenantId)
            .single()

          if (transferError || !transferRole) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Invalid transfer role',
            })
          }

          // Transfer users to new role
          const { error: transferUsersError } = await ctx.supabase
            .from('user_roles')
            .update({
              role_id: transferUsersToRoleId,
              assigned_by: ctx.user.userId,
              assigned_at: new Date().toISOString(),
            })
            .eq('role_id', roleId)

          if (transferUsersError) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to transfer users to new role',
              cause: transferUsersError,
            })
          }
        }

        // Delete the role
        const { error: deleteError } = await ctx.supabase
          .from('roles')
          .delete()
          .eq('id', roleId)

        if (deleteError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete role',
            cause: deleteError,
          })
        }

        return {
          success: true,
          message: 'Role deleted successfully',
          transferredUsers: userRoles?.length || 0,
        }
      } catch (error) {
        console.error('Delete role error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete role',
        })
      }
    }),

  /**
   * Assign roles to user
   */
  assignRoles: auditedProcedure
    .use(roleWriteProcedure.middleware)
    .input(assignRoleSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { userId, roleIds } = input

        // Validate user exists and belongs to tenant
        const { data: user, error: userError } = await ctx.supabase
          .from('users')
          .select('id')
          .eq('id', userId)
          .eq('tenant_id', ctx.user.tenantId)
          .single()

        if (userError || !user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          })
        }

        // Validate roles exist and belong to tenant
        const { data: roles, error: rolesError } = await ctx.supabase
          .from('roles')
          .select('id')
          .in('id', roleIds)
          .eq('tenant_id', ctx.user.tenantId)

        if (rolesError || !roles || roles.length !== roleIds.length) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'One or more roles are invalid',
          })
        }

        // Remove existing role assignments
        await ctx.supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)

        // Add new role assignments
        if (roleIds.length > 0) {
          const userRoles = roleIds.map(roleId => ({
            user_id: userId,
            role_id: roleId,
            assigned_by: ctx.user.userId,
            assigned_at: new Date().toISOString(),
          }))

          const { error: assignError } = await ctx.supabase
            .from('user_roles')
            .insert(userRoles)

          if (assignError) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to assign roles',
              cause: assignError,
            })
          }
        }

        return {
          success: true,
          message: 'Roles assigned successfully',
          assignedRoles: roleIds.length,
        }
      } catch (error) {
        console.error('Assign roles error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to assign roles',
        })
      }
    }),

  /**
   * Get user permissions (computed from roles)
   */
  getUserPermissions: protectedProcedure
    .input(z.object({
      userId: z.string().uuid('Invalid user ID').optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const targetUserId = input.userId || ctx.user.userId

        // If checking another user's permissions, verify permission
        if (input.userId && input.userId !== ctx.user.userId) {
          // This would be handled by permission middleware
        }

        const { data: userRoles, error } = await ctx.supabase
          .from('user_roles')
          .select(`
            roles (
              id,
              name,
              permissions,
              parent_role_id,
              parent_role:roles!roles_parent_role_id_fkey(permissions)
            )
          `)
          .eq('user_id', targetUserId)

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch user permissions',
            cause: error,
          })
        }

        // Collect all permissions from roles and parent roles
        const allPermissions = new Set<string>()
        const roles = userRoles?.map(ur => ur.roles).filter(Boolean) || []

        for (const role of roles) {
          // Add role permissions
          if (role.permissions) {
            role.permissions.forEach((perm: string) => allPermissions.add(perm))
          }

          // Add parent role permissions (inheritance)
          if (role.parent_role?.permissions) {
            role.parent_role.permissions.forEach((perm: string) => allPermissions.add(perm))
          }
        }

        return {
          userId: targetUserId,
          roles: roles.map(role => ({
            id: role.id,
            name: role.name,
            permissions: role.permissions || [],
          })),
          permissions: Array.from(allPermissions).sort(),
        }
      } catch (error) {
        console.error('Get user permissions error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch user permissions',
        })
      }
    }),

  /**
   * Check if user has specific permission
   */
  checkPermission: protectedProcedure
    .input(z.object({
      permission: z.string().min(1, 'Permission is required'),
      userId: z.string().uuid('Invalid user ID').optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const targetUserId = input.userId || ctx.user.userId
        const { permission } = input

        const userPermissions = await ctx.supabase
          .from('user_roles')
          .select(`
            roles (
              permissions,
              parent_role:roles!roles_parent_role_id_fkey(permissions)
            )
          `)
          .eq('user_id', targetUserId)

        if (userPermissions.error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to check permission',
            cause: userPermissions.error,
          })
        }

        // Check if user has the permission
        const hasPermission = userPermissions.data?.some(ur => {
          const role = ur.roles
          if (!role) return false

          // Check direct role permissions
          if (role.permissions?.includes(permission)) return true

          // Check parent role permissions
          if (role.parent_role?.permissions?.includes(permission)) return true

          return false
        }) || false

        return {
          userId: targetUserId,
          permission,
          hasPermission,
        }
      } catch (error) {
        console.error('Check permission error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to check permission',
        })
      }
    }),
})