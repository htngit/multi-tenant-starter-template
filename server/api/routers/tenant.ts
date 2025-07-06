/**
 * Tenant Router for tRPC
 * 
 * This router handles all tenant-related operations in the multi-tenant ERP system.
 * It provides endpoints for tenant management, settings, and tenant-specific configurations.
 * 
 * Features:
 * - Tenant profile management
 * - Tenant settings and preferences
 * - Subscription and billing management
 * - Tenant-specific configurations
 * - Multi-tenant data isolation
 * - Tenant onboarding and setup
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
const tenantProfileSchema = z.object({
  name: z.string().min(1, 'Tenant name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  domain: z.string().min(1, 'Domain is required').regex(/^[a-zA-Z0-9-]+$/, 'Invalid domain format'),
  logo: z.string().url('Invalid logo URL').optional(),
  website: z.string().url('Invalid website URL').optional(),
  industry: z.string().optional(),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).optional(),
  timezone: z.string().default('UTC'),
  locale: z.string().default('en-US'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
})

const tenantSettingsSchema = z.object({
  category: z.enum(['general', 'security', 'notifications', 'integrations', 'billing']),
  settings: z.record(z.string(), z.any()),
})

const tenantAddressSchema = z.object({
  type: z.enum(['billing', 'shipping', 'headquarters']),
  street1: z.string().min(1, 'Street address is required'),
  street2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().length(2, 'Country must be 2-letter code'),
  isPrimary: z.boolean().default(false),
})

const tenantContactSchema = z.object({
  type: z.enum(['primary', 'billing', 'technical', 'support']),
  name: z.string().min(1, 'Contact name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  title: z.string().optional(),
  department: z.string().optional(),
})

const subscriptionSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
  billingCycle: z.enum(['monthly', 'quarterly', 'yearly']),
  paymentMethodId: z.string().optional(),
})

/**
 * Permission-based procedures
 */
const tenantReadProcedure = createPermissionProcedure('tenant:read')
const tenantWriteProcedure = createPermissionProcedure('tenant:write')
const tenantAdminProcedure = createPermissionProcedure('tenant:admin')
const billingReadProcedure = createPermissionProcedure('billing:read')
const billingWriteProcedure = createPermissionProcedure('billing:write')

/**
 * Tenant router
 */
export const tenantRouter = createTRPCRouter({
  /**
   * Get current tenant profile
   */
  getProfile: tenantReadProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: tenant, error } = await ctx.supabase
          .from('tenants')
          .select(`
            *,
            tenant_addresses (*),
            tenant_contacts (*),
            subscription_plans (id, name, features, price)
          `)
          .eq('id', ctx.user.tenantId)
          .single()

        if (error) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Tenant not found',
            cause: error,
          })
        }

        return tenant
      } catch (error) {
        console.error('Get tenant profile error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch tenant profile',
        })
      }
    }),

  /**
   * Update tenant profile
   */
  updateProfile: tenantWriteProcedure
    .input(tenantProfileSchema.partial())
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if domain is already taken (if being updated)
        if (input.domain) {
          const { data: existingTenant } = await ctx.supabase
            .from('tenants')
            .select('id')
            .eq('domain', input.domain)
            .neq('id', ctx.user.tenantId)
            .single()

          if (existingTenant) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Domain is already taken',
            })
          }
        }

        const { data: tenant, error } = await ctx.supabase
          .from('tenants')
          .update({
            ...input,
            updated_by: ctx.user.userId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', ctx.user.tenantId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update tenant profile',
            cause: error,
          })
        }

        return tenant
      } catch (error) {
        console.error('Update tenant profile error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update tenant profile',
        })
      }
    }),

  /**
   * Get tenant settings
   */
  getSettings: tenantReadProcedure
    .input(z.object({
      category: z.enum(['general', 'security', 'notifications', 'integrations', 'billing']).optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        let query = ctx.supabase
          .from('tenant_settings')
          .select('*')
          .eq('tenant_id', ctx.user.tenantId)
          .order('category')

        if (input.category) {
          query = query.eq('category', input.category)
        }

        const { data: settings, error } = await query

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch tenant settings',
            cause: error,
          })
        }

        // Group settings by category
        const groupedSettings = settings?.reduce((acc, setting) => {
          if (!acc[setting.category]) {
            acc[setting.category] = {}
          }
          acc[setting.category][setting.key] = {
            value: setting.value,
            dataType: setting.data_type,
            description: setting.description,
            updatedAt: setting.updated_at,
          }
          return acc
        }, {} as Record<string, any>) || {}

        return groupedSettings
      } catch (error) {
        console.error('Get tenant settings error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch tenant settings',
        })
      }
    }),

  /**
   * Update tenant settings
   */
  updateSettings: tenantWriteProcedure
    .input(tenantSettingsSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { category, settings } = input

        // Validate settings based on category
        const validationRules = {
          general: {
            companyName: { type: 'string', required: false },
            timezone: { type: 'string', required: false },
            dateFormat: { type: 'string', required: false },
            currency: { type: 'string', required: false },
          },
          security: {
            passwordPolicy: { type: 'object', required: false },
            sessionTimeout: { type: 'number', required: false },
            twoFactorRequired: { type: 'boolean', required: false },
            ipWhitelist: { type: 'array', required: false },
          },
          notifications: {
            emailNotifications: { type: 'boolean', required: false },
            smsNotifications: { type: 'boolean', required: false },
            webhookUrl: { type: 'string', required: false },
          },
          integrations: {
            apiKeys: { type: 'object', required: false },
            webhooks: { type: 'array', required: false },
            externalServices: { type: 'object', required: false },
          },
          billing: {
            autoRenewal: { type: 'boolean', required: false },
            invoiceEmail: { type: 'string', required: false },
            paymentMethod: { type: 'string', required: false },
          },
        }

        const categoryRules = validationRules[category]
        if (!categoryRules) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid settings category',
          })
        }

        // Prepare settings for upsert
        const settingsToUpsert = Object.entries(settings).map(([key, value]) => {
          const rule = categoryRules[key as keyof typeof categoryRules]
          if (!rule) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: `Invalid setting key: ${key}`,
            })
          }

          return {
            tenant_id: ctx.user.tenantId,
            category,
            key,
            value: typeof value === 'object' ? JSON.stringify(value) : String(value),
            data_type: rule.type,
            updated_by: ctx.user.userId,
            updated_at: new Date().toISOString(),
          }
        })

        // Upsert settings
        const { error } = await ctx.supabase
          .from('tenant_settings')
          .upsert(settingsToUpsert, {
            onConflict: 'tenant_id,category,key',
          })

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update tenant settings',
            cause: error,
          })
        }

        return {
          success: true,
          message: 'Settings updated successfully',
        }
      } catch (error) {
        console.error('Update tenant settings error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update tenant settings',
        })
      }
    }),

  /**
   * Get tenant addresses
   */
  getAddresses: tenantReadProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: addresses, error } = await ctx.supabase
          .from('tenant_addresses')
          .select('*')
          .eq('tenant_id', ctx.user.tenantId)
          .order('is_primary', { ascending: false })
          .order('created_at')

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch tenant addresses',
            cause: error,
          })
        }

        return addresses || []
      } catch (error) {
        console.error('Get tenant addresses error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch tenant addresses',
        })
      }
    }),

  /**
   * Add tenant address
   */
  addAddress: tenantWriteProcedure
    .input(tenantAddressSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // If this is set as primary, unset other primary addresses of the same type
        if (input.isPrimary) {
          await ctx.supabase
            .from('tenant_addresses')
            .update({ is_primary: false })
            .eq('tenant_id', ctx.user.tenantId)
            .eq('type', input.type)
        }

        const { data: address, error } = await ctx.supabase
          .from('tenant_addresses')
          .insert({
            ...input,
            tenant_id: ctx.user.tenantId,
            created_by: ctx.user.userId,
            updated_by: ctx.user.userId,
          })
          .select()
          .single()

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to add tenant address',
            cause: error,
          })
        }

        return address
      } catch (error) {
        console.error('Add tenant address error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add tenant address',
        })
      }
    }),

  /**
   * Update tenant address
   */
  updateAddress: tenantWriteProcedure
    .input(tenantAddressSchema.partial().extend({
      id: z.string().uuid('Invalid address ID'),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, ...updateData } = input

        // If this is set as primary, unset other primary addresses of the same type
        if (updateData.isPrimary && updateData.type) {
          await ctx.supabase
            .from('tenant_addresses')
            .update({ is_primary: false })
            .eq('tenant_id', ctx.user.tenantId)
            .eq('type', updateData.type)
            .neq('id', id)
        }

        const { data: address, error } = await ctx.supabase
          .from('tenant_addresses')
          .update({
            ...updateData,
            updated_by: ctx.user.userId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .eq('tenant_id', ctx.user.tenantId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update tenant address',
            cause: error,
          })
        }

        return address
      } catch (error) {
        console.error('Update tenant address error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update tenant address',
        })
      }
    }),

  /**
   * Delete tenant address
   */
  deleteAddress: tenantWriteProcedure
    .input(z.object({
      id: z.string().uuid('Invalid address ID'),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { error } = await ctx.supabase
          .from('tenant_addresses')
          .delete()
          .eq('id', input.id)
          .eq('tenant_id', ctx.user.tenantId)

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete tenant address',
            cause: error,
          })
        }

        return {
          success: true,
          message: 'Address deleted successfully',
        }
      } catch (error) {
        console.error('Delete tenant address error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete tenant address',
        })
      }
    }),

  /**
   * Get tenant contacts
   */
  getContacts: tenantReadProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: contacts, error } = await ctx.supabase
          .from('tenant_contacts')
          .select('*')
          .eq('tenant_id', ctx.user.tenantId)
          .order('type')
          .order('created_at')

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch tenant contacts',
            cause: error,
          })
        }

        return contacts || []
      } catch (error) {
        console.error('Get tenant contacts error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch tenant contacts',
        })
      }
    }),

  /**
   * Add tenant contact
   */
  addContact: tenantWriteProcedure
    .input(tenantContactSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { data: contact, error } = await ctx.supabase
          .from('tenant_contacts')
          .insert({
            ...input,
            tenant_id: ctx.user.tenantId,
            created_by: ctx.user.userId,
            updated_by: ctx.user.userId,
          })
          .select()
          .single()

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to add tenant contact',
            cause: error,
          })
        }

        return contact
      } catch (error) {
        console.error('Add tenant contact error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add tenant contact',
        })
      }
    }),

  /**
   * Get subscription information
   */
  getSubscription: billingReadProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: subscription, error } = await ctx.supabase
          .from('tenant_subscriptions')
          .select(`
            *,
            subscription_plans (id, name, features, price, billing_cycle),
            payment_methods (id, type, last_four, expires_at)
          `)
          .eq('tenant_id', ctx.user.tenantId)
          .eq('status', 'active')
          .single()

        if (error && error.code !== 'PGRST116') {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch subscription',
            cause: error,
          })
        }

        return subscription || null
      } catch (error) {
        console.error('Get subscription error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch subscription',
        })
      }
    }),

  /**
   * Get available subscription plans
   */
  getAvailablePlans: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: plans, error } = await ctx.supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('price')

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch subscription plans',
            cause: error,
          })
        }

        return plans || []
      } catch (error) {
        console.error('Get available plans error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch subscription plans',
        })
      }
    }),

  /**
   * Get tenant usage statistics
   */
  getUsageStats: tenantReadProcedure
    .input(z.object({
      period: z.enum(['current_month', 'last_month', 'current_year']).default('current_month'),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const { period } = input
        
        let startDate: Date
        let endDate: Date = new Date()
        
        switch (period) {
          case 'current_month':
            startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
            break
          case 'last_month':
            startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1)
            endDate = new Date(endDate.getFullYear(), endDate.getMonth(), 0)
            break
          case 'current_year':
            startDate = new Date(endDate.getFullYear(), 0, 1)
            break
        }

        // Get various usage metrics
        const [userCount, invoiceCount, productCount, storageUsed] = await Promise.all([
          ctx.supabase
            .from('users')
            .select('id', { count: 'exact', head: true })
            .eq('tenant_id', ctx.user.tenantId),
          
          ctx.supabase
            .from('invoices')
            .select('id', { count: 'exact', head: true })
            .eq('tenant_id', ctx.user.tenantId)
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString()),
          
          ctx.supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('tenant_id', ctx.user.tenantId),
          
          ctx.supabase
            .rpc('get_tenant_storage_usage', { tenant_id: ctx.user.tenantId })
        ])

        return {
          period,
          users: userCount.count || 0,
          invoices: invoiceCount.count || 0,
          products: productCount.count || 0,
          storageUsed: storageUsed.data || 0,
          periodStart: startDate.toISOString(),
          periodEnd: endDate.toISOString(),
        }
      } catch (error) {
        console.error('Get usage stats error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch usage statistics',
        })
      }
    }),
})