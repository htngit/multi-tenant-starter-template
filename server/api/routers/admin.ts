/**
 * Admin Router for tRPC
 * 
 * This router handles all administrative operations and system management.
 * It provides endpoints for system configuration, user management, and administrative tasks.
 * 
 * Features:
 * - System configuration management
 * - User and role management
 * - Tenant administration
 * - System monitoring and health checks
 * - Audit log management
 * - Backup and maintenance operations
 * 
 * @author XalesIn ERP Team
 * @version 1.0.0
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { 
  createTRPCRouter, 
  adminProcedure,
  auditedProcedure,
  createPermissionProcedure
} from '../../../lib/trpc'

/**
 * Input validation schemas
 */
const systemConfigSchema = z.object({
  key: z.string().min(1, 'Configuration key is required'),
  value: z.string(),
  description: z.string().optional(),
  category: z.enum(['general', 'security', 'email', 'payment', 'integration', 'feature_flags']),
  isPublic: z.boolean().default(false),
  dataType: z.enum(['string', 'number', 'boolean', 'json']).default('string'),
})

const userManagementSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  action: z.enum(['activate', 'deactivate', 'reset_password', 'force_logout']),
  reason: z.string().min(1, 'Reason is required'),
})

const tenantManagementSchema = z.object({
  tenantId: z.string().uuid('Invalid tenant ID'),
  action: z.enum(['activate', 'deactivate', 'suspend', 'upgrade_plan', 'downgrade_plan']),
  reason: z.string().min(1, 'Reason is required'),
  newPlan: z.string().optional(),
})

const auditLogFilterSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(50),
  userId: z.string().uuid().optional(),
  tenantId: z.string().uuid().optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
})

/**
 * Permission-based procedures
 */
const systemAdminProcedure = createPermissionProcedure('system:admin')
const userAdminProcedure = createPermissionProcedure('users:admin')
const tenantAdminProcedure = createPermissionProcedure('tenants:admin')
const auditReadProcedure = createPermissionProcedure('audit:read')

/**
 * Admin router
 */
export const adminRouter = createTRPCRouter({
  /**
   * Get system health status
   */
  getSystemHealth: adminProcedure
    .query(async ({ ctx }) => {
      try {
        // Check database connectivity
        const dbStart = Date.now()
        const { error: dbError } = await ctx.supabase
          .from('system_config')
          .select('id')
          .limit(1)
        const dbLatency = Date.now() - dbStart

        // Get system metrics
        const { data: userCount } = await ctx.supabase
          .from('users')
          .select('id', { count: 'exact', head: true })

        const { data: tenantCount } = await ctx.supabase
          .from('tenants')
          .select('id', { count: 'exact', head: true })

        const { data: activeSessionCount } = await ctx.supabase
          .from('user_sessions')
          .select('id', { count: 'exact', head: true })
          .gte('expires_at', new Date().toISOString())

        // Check recent errors
        const { data: recentErrors } = await ctx.supabase
          .from('audit_logs')
          .select('id')
          .eq('level', 'error')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

        return {
          status: dbError ? 'unhealthy' : 'healthy',
          timestamp: new Date().toISOString(),
          database: {
            status: dbError ? 'error' : 'connected',
            latency: dbLatency,
            error: dbError?.message,
          },
          metrics: {
            totalUsers: userCount || 0,
            totalTenants: tenantCount || 0,
            activeSessions: activeSessionCount || 0,
            recentErrors: recentErrors?.length || 0,
          },
        }
      } catch (error) {
        console.error('Get system health error:', error)
        return {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }),

  /**
   * Get system configuration
   */
  getSystemConfig: systemAdminProcedure
    .input(z.object({
      category: z.enum(['general', 'security', 'email', 'payment', 'integration', 'feature_flags']).optional(),
      includePrivate: z.boolean().default(false),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const { category, includePrivate } = input

        let query = ctx.supabase
          .from('system_config')
          .select('*')
          .order('category')
          .order('key')

        if (category) {
          query = query.eq('category', category)
        }

        if (!includePrivate) {
          query = query.eq('is_public', true)
        }

        const { data: configs, error } = await query

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch system configuration',
            cause: error,
          })
        }

        return configs || []
      } catch (error) {
        console.error('Get system config error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch system configuration',
        })
      }
    }),

  /**
   * Update system configuration
   */
  updateSystemConfig: systemAdminProcedure
    .input(systemConfigSchema.extend({
      id: z.string().uuid().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, key, value, description, category, isPublic, dataType } = input

        // Validate value based on data type
        let parsedValue = value
        try {
          switch (dataType) {
            case 'number':
              if (isNaN(Number(value))) {
                throw new Error('Invalid number format')
              }
              break
            case 'boolean':
              if (!['true', 'false'].includes(value.toLowerCase())) {
                throw new Error('Invalid boolean format')
              }
              break
            case 'json':
              JSON.parse(value)
              break
          }
        } catch (parseError) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Invalid value for data type ${dataType}`,
          })
        }

        let result
        if (id) {
          // Update existing config
          const { data, error } = await ctx.supabase
            .from('system_config')
            .update({
              value: parsedValue,
              description,
              category,
              is_public: isPublic,
              data_type: dataType,
              updated_by: ctx.user.userId,
              updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single()

          if (error) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to update system configuration',
              cause: error,
            })
          }
          result = data
        } else {
          // Create new config
          const { data, error } = await ctx.supabase
            .from('system_config')
            .insert({
              key,
              value: parsedValue,
              description,
              category,
              is_public: isPublic,
              data_type: dataType,
              created_by: ctx.user.userId,
              updated_by: ctx.user.userId,
            })
            .select()
            .single()

          if (error) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to create system configuration',
              cause: error,
            })
          }
          result = data
        }

        return result
      } catch (error) {
        console.error('Update system config error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update system configuration',
        })
      }
    }),

  /**
   * Get all users for administration
   */
  getAllUsers: userAdminProcedure
    .input(z.object({
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(100).default(20),
      search: z.string().optional(),
      status: z.enum(['active', 'inactive', 'suspended']).optional(),
      tenantId: z.string().uuid().optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const { page, limit, search, status, tenantId } = input
        const offset = (page - 1) * limit

        let query = ctx.supabase
          .from('users')
          .select(`
            *,
            tenants (id, name, plan),
            user_roles (role_id, roles (name, permissions))
          `, { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (search) {
          query = query.or(`email.ilike.%${search}%,display_name.ilike.%${search}%`)
        }

        if (status) {
          query = query.eq('status', status)
        }

        if (tenantId) {
          query = query.eq('tenant_id', tenantId)
        }

        const { data: users, error, count } = await query

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch users',
            cause: error,
          })
        }

        return {
          users: users || [],
          pagination: {
            page,
            limit,
            total: count || 0,
            pages: Math.ceil((count || 0) / limit),
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
   * Manage user account
   */
  manageUser: userAdminProcedure
    .input(userManagementSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { userId, action, reason } = input

        // Get user details
        const { data: user } = await ctx.supabase
          .from('users')
          .select('id, email, status')
          .eq('id', userId)
          .single()

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          })
        }

        let updateData: any = {
          updated_by: ctx.user.userId,
          updated_at: new Date().toISOString(),
        }

        switch (action) {
          case 'activate':
            updateData.status = 'active'
            break
          case 'deactivate':
            updateData.status = 'inactive'
            break
          case 'reset_password':
            // In a real implementation, you would trigger a password reset email
            // For now, we'll just log the action
            break
          case 'force_logout':
            // Invalidate all user sessions
            await ctx.supabase
              .from('user_sessions')
              .update({ expires_at: new Date().toISOString() })
              .eq('user_id', userId)
            break
        }

        if (action !== 'force_logout' && action !== 'reset_password') {
          const { error } = await ctx.supabase
            .from('users')
            .update(updateData)
            .eq('id', userId)

          if (error) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to update user',
              cause: error,
            })
          }
        }

        // Log the admin action
        await ctx.supabase
          .from('admin_actions')
          .insert({
            admin_id: ctx.user.userId,
            target_user_id: userId,
            action,
            reason,
            metadata: { userEmail: user.email },
          })

        return {
          success: true,
          message: `User ${action} completed successfully`,
        }
      } catch (error) {
        console.error('Manage user error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to manage user',
        })
      }
    }),

  /**
   * Get all tenants for administration
   */
  getAllTenants: tenantAdminProcedure
    .input(z.object({
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(100).default(20),
      search: z.string().optional(),
      status: z.enum(['active', 'inactive', 'suspended']).optional(),
      plan: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const { page, limit, search, status, plan } = input
        const offset = (page - 1) * limit

        let query = ctx.supabase
          .from('tenants')
          .select(`
            *,
            users (id, email, display_name, status)
          `, { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (search) {
          query = query.or(`name.ilike.%${search}%,domain.ilike.%${search}%`)
        }

        if (status) {
          query = query.eq('status', status)
        }

        if (plan) {
          query = query.eq('plan', plan)
        }

        const { data: tenants, error, count } = await query

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch tenants',
            cause: error,
          })
        }

        return {
          tenants: tenants || [],
          pagination: {
            page,
            limit,
            total: count || 0,
            pages: Math.ceil((count || 0) / limit),
          },
        }
      } catch (error) {
        console.error('Get all tenants error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch tenants',
        })
      }
    }),

  /**
   * Manage tenant
   */
  manageTenant: tenantAdminProcedure
    .input(tenantManagementSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { tenantId, action, reason, newPlan } = input

        // Get tenant details
        const { data: tenant } = await ctx.supabase
          .from('tenants')
          .select('id, name, status, plan')
          .eq('id', tenantId)
          .single()

        if (!tenant) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Tenant not found',
          })
        }

        let updateData: any = {
          updated_by: ctx.user.userId,
          updated_at: new Date().toISOString(),
        }

        switch (action) {
          case 'activate':
            updateData.status = 'active'
            break
          case 'deactivate':
            updateData.status = 'inactive'
            break
          case 'suspend':
            updateData.status = 'suspended'
            break
          case 'upgrade_plan':
          case 'downgrade_plan':
            if (!newPlan) {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'New plan is required for plan changes',
              })
            }
            updateData.plan = newPlan
            break
        }

        const { error } = await ctx.supabase
          .from('tenants')
          .update(updateData)
          .eq('id', tenantId)

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update tenant',
            cause: error,
          })
        }

        // Log the admin action
        await ctx.supabase
          .from('admin_actions')
          .insert({
            admin_id: ctx.user.userId,
            target_tenant_id: tenantId,
            action,
            reason,
            metadata: { 
              tenantName: tenant.name,
              oldPlan: tenant.plan,
              newPlan: newPlan || null,
            },
          })

        return {
          success: true,
          message: `Tenant ${action} completed successfully`,
        }
      } catch (error) {
        console.error('Manage tenant error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to manage tenant',
        })
      }
    }),

  /**
   * Get audit logs
   */
  getAuditLogs: auditReadProcedure
    .input(auditLogFilterSchema)
    .query(async ({ input, ctx }) => {
      try {
        const { page, limit, userId, tenantId, action, resource, dateFrom, dateTo } = input
        const offset = (page - 1) * limit

        let query = ctx.supabase
          .from('audit_logs')
          .select(`
            *,
            users (id, email, display_name),
            tenants (id, name)
          `, { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (userId) {
          query = query.eq('user_id', userId)
        }

        if (tenantId) {
          query = query.eq('tenant_id', tenantId)
        }

        if (action) {
          query = query.ilike('action', `%${action}%`)
        }

        if (resource) {
          query = query.ilike('resource', `%${resource}%`)
        }

        if (dateFrom) {
          query = query.gte('created_at', dateFrom)
        }

        if (dateTo) {
          query = query.lte('created_at', dateTo)
        }

        const { data: logs, error, count } = await query

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch audit logs',
            cause: error,
          })
        }

        return {
          logs: logs || [],
          pagination: {
            page,
            limit,
            total: count || 0,
            pages: Math.ceil((count || 0) / limit),
          },
        }
      } catch (error) {
        console.error('Get audit logs error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch audit logs',
        })
      }
    }),

  /**
   * Get system statistics
   */
  getSystemStats: adminProcedure
    .query(async ({ ctx }) => {
      try {
        // Get user statistics
        const { data: userStats } = await ctx.supabase
          .rpc('get_user_statistics')

        // Get tenant statistics
        const { data: tenantStats } = await ctx.supabase
          .rpc('get_tenant_statistics')

        // Get activity statistics
        const { data: activityStats } = await ctx.supabase
          .rpc('get_activity_statistics')

        return {
          users: userStats || {},
          tenants: tenantStats || {},
          activity: activityStats || {},
          timestamp: new Date().toISOString(),
        }
      } catch (error) {
        console.error('Get system stats error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch system statistics',
        })
      }
    }),
})