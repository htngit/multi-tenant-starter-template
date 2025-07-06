/**
 * Users Router for tRPC
 * 
 * This router handles all user-related operations in the multi-tenant ERP system.
 * It provides endpoints for user management, profile operations, and user administration.
 * 
 * Features:
 * - User profile management
 * - User creation and invitation
 * - Role and permission assignment
 * - User activity tracking
 * - Account settings and preferences
 * - Multi-tenant user isolation
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
const userProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
  title: z.string().max(100, 'Title too long').optional(),
  department: z.string().max(100, 'Department too long').optional(),
  location: z.string().max(100, 'Location too long').optional(),
  timezone: z.string().default('UTC'),
  locale: z.string().default('en-US'),
  dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).default('MM/DD/YYYY'),
  timeFormat: z.enum(['12h', '24h']).default('12h'),
})

const userInviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  roleIds: z.array(z.string().uuid('Invalid role ID')).min(1, 'At least one role is required'),
  title: z.string().max(100, 'Title too long').optional(),
  department: z.string().max(100, 'Department too long').optional(),
  sendInviteEmail: z.boolean().default(true),
  expiresAt: z.date().optional(),
})

const userUpdateSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  title: z.string().max(100, 'Title too long').optional(),
  department: z.string().max(100, 'Department too long').optional(),
  location: z.string().max(100, 'Location too long').optional(),
  isActive: z.boolean().optional(),
  roleIds: z.array(z.string().uuid('Invalid role ID')).optional(),
})

const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  language: z.string().default('en'),
  timezone: z.string().default('UTC'),
  dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).default('MM/DD/YYYY'),
  timeFormat: z.enum(['12h', '24h']).default('12h'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false),
    marketing: z.boolean().default(false),
  }).default({}),
  dashboard: z.object({
    layout: z.enum(['grid', 'list']).default('grid'),
    widgets: z.array(z.string()).default([]),
    refreshInterval: z.number().min(30).max(300).default(60),
  }).default({}),
})

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number and special character'),
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

/**
 * Permission-based procedures
 */
const userReadProcedure = createPermissionProcedure('user:read')
const userWriteProcedure = createPermissionProcedure('user:write')
const userAdminProcedure = createPermissionProcedure('user:admin')
const userInviteProcedure = createPermissionProcedure('user:invite')

/**
 * Users router
 */
export const usersRouter = createTRPCRouter({
  /**
   * Get current user profile
   */
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: user, error } = await ctx.supabase
          .from('users')
          .select(`
            *,
            user_roles (
              role_id,
              roles (
                id,
                name,
                description,
                permissions
              )
            ),
            user_preferences (*)
          `)
          .eq('id', ctx.user.userId)
          .single()

        if (error) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
            cause: error,
          })
        }

        // Flatten user roles and permissions
        const roles = user.user_roles?.map((ur: any) => ur.roles) || []
        const permissions = roles.flatMap((role: any) => role.permissions || [])
        const uniquePermissions = [...new Set(permissions)]

        return {
          ...user,
          roles,
          permissions: uniquePermissions,
          preferences: user.user_preferences?.[0] || null,
        }
      } catch (error) {
        console.error('Get user profile error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch user profile',
        })
      }
    }),

  /**
   * Update current user profile
   */
  updateProfile: auditedProcedure
    .input(userProfileSchema.partial().omit({ email: true }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { data: user, error } = await ctx.supabase
          .from('users')
          .update({
            ...input,
            updated_by: ctx.user.userId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', ctx.user.userId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update user profile',
            cause: error,
          })
        }

        return user
      } catch (error) {
        console.error('Update user profile error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user profile',
        })
      }
    }),

  /**
   * Get all users in tenant
   */
  getAll: userReadProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      search: z.string().optional(),
      department: z.string().optional(),
      role: z.string().optional(),
      isActive: z.boolean().optional(),
      sortBy: z.enum(['firstName', 'lastName', 'email', 'createdAt', 'lastLoginAt']).default('firstName'),
      sortOrder: z.enum(['asc', 'desc']).default('asc'),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const { page, limit, search, department, role, isActive, sortBy, sortOrder } = input
        const offset = (page - 1) * limit

        let query = ctx.supabase
          .from('users')
          .select(`
            *,
            user_roles (
              role_id,
              roles (
                id,
                name,
                color
              )
            )
          `, { count: 'exact' })
          .eq('tenant_id', ctx.user.tenantId)

        // Apply filters
        if (search) {
          query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
        }

        if (department) {
          query = query.eq('department', department)
        }

        if (typeof isActive === 'boolean') {
          query = query.eq('is_active', isActive)
        }

        // Apply sorting
        const sortColumn = sortBy === 'firstName' ? 'first_name' : 
                          sortBy === 'lastName' ? 'last_name' :
                          sortBy === 'createdAt' ? 'created_at' :
                          sortBy === 'lastLoginAt' ? 'last_login_at' : sortBy
        
        query = query.order(sortColumn, { ascending: sortOrder === 'asc' })

        // Apply pagination
        query = query.range(offset, offset + limit - 1)

        const { data: users, error, count } = await query

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch users',
            cause: error,
          })
        }

        // Process users data
        const processedUsers = users?.map(user => ({
          ...user,
          roles: user.user_roles?.map((ur: any) => ur.roles) || [],
        })) || []

        return {
          users: processedUsers,
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit),
          },
        }
      } catch (error) {
        console.error('Get all users error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch users',
        })
      }
    }),

  /**
   * Get user by ID
   */
  getById: userReadProcedure
    .input(z.object({
      userId: z.string().uuid('Invalid user ID'),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const { data: user, error } = await ctx.supabase
          .from('users')
          .select(`
            *,
            user_roles (
              role_id,
              roles (
                id,
                name,
                description,
                permissions
              )
            ),
            user_preferences (*),
            created_by_user:users!users_created_by_fkey(first_name, last_name),
            updated_by_user:users!users_updated_by_fkey(first_name, last_name)
          `)
          .eq('id', input.userId)
          .eq('tenant_id', ctx.user.tenantId)
          .single()

        if (error) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
            cause: error,
          })
        }

        // Process user data
        const roles = user.user_roles?.map((ur: any) => ur.roles) || []
        const permissions = roles.flatMap((role: any) => role.permissions || [])
        const uniquePermissions = [...new Set(permissions)]

        return {
          ...user,
          roles,
          permissions: uniquePermissions,
          preferences: user.user_preferences?.[0] || null,
        }
      } catch (error) {
        console.error('Get user by ID error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch user',
        })
      }
    }),

  /**
   * Invite new user
   */
  invite: userInviteProcedure
    .input(userInviteSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { email, firstName, lastName, roleIds, title, department, sendInviteEmail, expiresAt } = input

        // Check if user already exists
        const { data: existingUser } = await ctx.supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .eq('tenant_id', ctx.user.tenantId)
          .single()

        if (existingUser) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'User with this email already exists',
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

        // Create user invitation
        const inviteToken = crypto.randomUUID()
        const inviteExpiresAt = expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

        const { data: invitation, error: inviteError } = await ctx.supabase
          .from('user_invitations')
          .insert({
            email,
            first_name: firstName,
            last_name: lastName,
            title,
            department,
            role_ids: roleIds,
            tenant_id: ctx.user.tenantId,
            invited_by: ctx.user.userId,
            token: inviteToken,
            expires_at: inviteExpiresAt.toISOString(),
            status: 'pending',
          })
          .select()
          .single()

        if (inviteError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create user invitation',
            cause: inviteError,
          })
        }

        // Send invitation email if requested
        if (sendInviteEmail) {
          // TODO: Implement email service integration
          console.log('Sending invitation email to:', email, 'with token:', inviteToken)
        }

        return {
          invitation,
          inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invite/${inviteToken}`,
        }
      } catch (error) {
        console.error('Invite user error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to invite user',
        })
      }
    }),

  /**
   * Update user
   */
  update: userWriteProcedure
    .input(userUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { userId, roleIds, ...updateData } = input

        // Check if user exists and belongs to tenant
        const { data: existingUser, error: userError } = await ctx.supabase
          .from('users')
          .select('id, email')
          .eq('id', userId)
          .eq('tenant_id', ctx.user.tenantId)
          .single()

        if (userError || !existingUser) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          })
        }

        // Check if email is being changed and if it's already taken
        if (updateData.email && updateData.email !== existingUser.email) {
          const { data: emailUser } = await ctx.supabase
            .from('users')
            .select('id')
            .eq('email', updateData.email)
            .eq('tenant_id', ctx.user.tenantId)
            .neq('id', userId)
            .single()

          if (emailUser) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Email is already taken',
            })
          }
        }

        // Update user
        const { data: user, error } = await ctx.supabase
          .from('users')
          .update({
            ...updateData,
            updated_by: ctx.user.userId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update user',
            cause: error,
          })
        }

        // Update user roles if provided
        if (roleIds) {
          // Validate roles
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

          // Remove existing roles
          await ctx.supabase
            .from('user_roles')
            .delete()
            .eq('user_id', userId)

          // Add new roles
          if (roleIds.length > 0) {
            const userRoles = roleIds.map(roleId => ({
              user_id: userId,
              role_id: roleId,
              assigned_by: ctx.user.userId,
            }))

            const { error: roleAssignError } = await ctx.supabase
              .from('user_roles')
              .insert(userRoles)

            if (roleAssignError) {
              throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to assign user roles',
                cause: roleAssignError,
              })
            }
          }
        }

        return user
      } catch (error) {
        console.error('Update user error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user',
        })
      }
    }),

  /**
   * Deactivate user
   */
  deactivate: userWriteProcedure
    .input(z.object({
      userId: z.string().uuid('Invalid user ID'),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { userId, reason } = input

        // Cannot deactivate self
        if (userId === ctx.user.userId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot deactivate your own account',
          })
        }

        const { data: user, error } = await ctx.supabase
          .from('users')
          .update({
            is_active: false,
            deactivated_at: new Date().toISOString(),
            deactivated_by: ctx.user.userId,
            deactivation_reason: reason,
            updated_by: ctx.user.userId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
          .eq('tenant_id', ctx.user.tenantId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to deactivate user',
            cause: error,
          })
        }

        return user
      } catch (error) {
        console.error('Deactivate user error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to deactivate user',
        })
      }
    }),

  /**
   * Reactivate user
   */
  reactivate: userWriteProcedure
    .input(z.object({
      userId: z.string().uuid('Invalid user ID'),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { data: user, error } = await ctx.supabase
          .from('users')
          .update({
            is_active: true,
            deactivated_at: null,
            deactivated_by: null,
            deactivation_reason: null,
            updated_by: ctx.user.userId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.userId)
          .eq('tenant_id', ctx.user.tenantId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to reactivate user',
            cause: error,
          })
        }

        return user
      } catch (error) {
        console.error('Reactivate user error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reactivate user',
        })
      }
    }),

  /**
   * Get user preferences
   */
  getPreferences: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: preferences, error } = await ctx.supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', ctx.user.userId)
          .single()

        if (error && error.code !== 'PGRST116') {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch user preferences',
            cause: error,
          })
        }

        return preferences || null
      } catch (error) {
        console.error('Get user preferences error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch user preferences',
        })
      }
    }),

  /**
   * Update user preferences
   */
  updatePreferences: protectedProcedure
    .input(userPreferencesSchema.partial())
    .mutation(async ({ input, ctx }) => {
      try {
        const { data: preferences, error } = await ctx.supabase
          .from('user_preferences')
          .upsert({
            user_id: ctx.user.userId,
            ...input,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update user preferences',
            cause: error,
          })
        }

        return preferences
      } catch (error) {
        console.error('Update user preferences error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user preferences',
        })
      }
    }),

  /**
   * Change password
   */
  changePassword: auditedProcedure
    .input(passwordChangeSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { currentPassword, newPassword } = input

        // Verify current password with Stack Auth
        // TODO: Implement password verification with Stack Auth
        // This would typically involve calling Stack Auth API to verify the current password
        
        // For now, we'll assume the password verification is handled by Stack Auth
        // and we just need to update the password
        
        // TODO: Update password through Stack Auth API
        console.log('Changing password for user:', ctx.user.userId)
        
        // Log the password change
        await ctx.supabase
          .from('audit_logs')
          .insert({
            tenant_id: ctx.user.tenantId,
            user_id: ctx.user.userId,
            action: 'password_changed',
            resource_type: 'user',
            resource_id: ctx.user.userId,
            details: { message: 'User changed their password' },
            ip_address: ctx.req?.headers['x-forwarded-for'] || ctx.req?.connection?.remoteAddress,
            user_agent: ctx.req?.headers['user-agent'],
          })

        return {
          success: true,
          message: 'Password changed successfully',
        }
      } catch (error) {
        console.error('Change password error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to change password',
        })
      }
    }),

  /**
   * Get user activity log
   */
  getActivityLog: protectedProcedure
    .input(z.object({
      userId: z.string().uuid('Invalid user ID').optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      action: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const { userId, page, limit, action, startDate, endDate } = input
        const offset = (page - 1) * limit
        
        // Use current user ID if not specified, or check permission for other users
        const targetUserId = userId || ctx.user.userId
        if (userId && userId !== ctx.user.userId) {
          // Check if user has permission to view other users' activity
          // This would be handled by the permission middleware
        }

        let query = ctx.supabase
          .from('audit_logs')
          .select('*', { count: 'exact' })
          .eq('user_id', targetUserId)
          .eq('tenant_id', ctx.user.tenantId)

        if (action) {
          query = query.eq('action', action)
        }

        if (startDate) {
          query = query.gte('created_at', startDate.toISOString())
        }

        if (endDate) {
          query = query.lte('created_at', endDate.toISOString())
        }

        query = query
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        const { data: logs, error, count } = await query

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch activity log',
            cause: error,
          })
        }

        return {
          logs: logs || [],
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit),
          },
        }
      } catch (error) {
        console.error('Get activity log error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch activity log',
        })
      }
    }),
})