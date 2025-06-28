/**
 * Inventory Router for tRPC
 * 
 * This router handles all inventory and product management operations.
 * It provides endpoints for product CRUD, stock management, and inventory tracking.
 * 
 * Features:
 * - Product management (create, read, update, delete)
 * - Stock level tracking and updates
 * - Inventory movements and history
 * - Low stock alerts
 * - Product categories and variants
 * - Barcode and SKU management
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
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  categoryId: z.string().uuid('Invalid category ID'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  costPrice: z.number().min(0, 'Cost price must be positive'),
  stockQuantity: z.number().int().min(0, 'Stock quantity must be non-negative'),
  minStockLevel: z.number().int().min(0, 'Minimum stock level must be non-negative'),
  maxStockLevel: z.number().int().min(0, 'Maximum stock level must be non-negative'),
  unit: z.string().min(1, 'Unit is required'),
  weight: z.number().optional(),
  dimensions: z.object({
    length: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  }).optional(),
  isActive: z.boolean().default(true),
  tags: z.array(z.string()).optional(),
})

const updateProductSchema = productSchema.partial().extend({
  id: z.string().uuid('Invalid product ID'),
})

const stockMovementSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  type: z.enum(['in', 'out', 'adjustment']),
  quantity: z.number().int(),
  reason: z.string().min(1, 'Reason is required'),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  parentId: z.string().uuid().optional(),
  isActive: z.boolean().default(true),
})

/**
 * Permission-based procedures
 */
const inventoryReadProcedure = createPermissionProcedure('inventory:read')
const inventoryWriteProcedure = createPermissionProcedure('inventory:write')
const inventoryDeleteProcedure = createPermissionProcedure('inventory:delete')

/**
 * Inventory router
 */
export const inventoryRouter = createTRPCRouter({
  /**
   * Get all products with pagination and filtering
   */
  getProducts: inventoryReadProcedure
    .input(z.object({
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(100).default(20),
      search: z.string().optional(),
      categoryId: z.string().uuid().optional(),
      isActive: z.boolean().optional(),
      lowStock: z.boolean().optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const { page, limit, search, categoryId, isActive, lowStock } = input
        const offset = (page - 1) * limit

        let query = ctx.supabase
          .from('products')
          .select(`
            *,
            categories (id, name),
            stock_movements (id, type, quantity, created_at)
          `)
          .eq('tenant_id', ctx.user.tenantId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        // Apply filters
        if (search) {
          query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,barcode.ilike.%${search}%`)
        }
        
        if (categoryId) {
          query = query.eq('category_id', categoryId)
        }
        
        if (isActive !== undefined) {
          query = query.eq('is_active', isActive)
        }
        
        if (lowStock) {
          query = query.lt('stock_quantity', 'min_stock_level')
        }

        const { data: products, error, count } = await query

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch products',
            cause: error,
          })
        }

        return {
          products: products || [],
          pagination: {
            page,
            limit,
            total: count || 0,
            pages: Math.ceil((count || 0) / limit),
          },
        }
      } catch (error) {
        console.error('Get products error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch products',
        })
      }
    }),

  /**
   * Get product by ID
   */
  getProduct: inventoryReadProcedure
    .input(z.object({
      id: z.string().uuid('Invalid product ID'),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const { data: product, error } = await ctx.supabase
          .from('products')
          .select(`
            *,
            categories (id, name),
            stock_movements (
              id, type, quantity, reason, reference, notes, created_at, created_by
            )
          `)
          .eq('id', input.id)
          .eq('tenant_id', ctx.user.tenantId)
          .single()

        if (error) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Product not found',
          })
        }

        return product
      } catch (error) {
        console.error('Get product error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch product',
        })
      }
    }),

  /**
   * Create new product
   */
  createProduct: auditedProcedure
    .use(inventoryWriteProcedure.middleware)
    .input(productSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if SKU already exists
        const { data: existingProduct } = await ctx.supabase
          .from('products')
          .select('id')
          .eq('sku', input.sku)
          .eq('tenant_id', ctx.user.tenantId)
          .single()

        if (existingProduct) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Product with this SKU already exists',
          })
        }

        const { data: product, error } = await ctx.supabase
          .from('products')
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
            message: 'Failed to create product',
            cause: error,
          })
        }

        // Create initial stock movement if stock quantity > 0
        if (input.stockQuantity > 0) {
          await ctx.supabase.from('stock_movements').insert({
            product_id: product.id,
            tenant_id: ctx.user.tenantId,
            type: 'in',
            quantity: input.stockQuantity,
            reason: 'Initial stock',
            created_by: ctx.user.userId,
          })
        }

        return product
      } catch (error) {
        console.error('Create product error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create product',
        })
      }
    }),

  /**
   * Update product
   */
  updateProduct: auditedProcedure
    .use(inventoryWriteProcedure.middleware)
    .input(updateProductSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, ...updateData } = input

        // Check if product exists and belongs to tenant
        const { data: existingProduct } = await ctx.supabase
          .from('products')
          .select('id, sku')
          .eq('id', id)
          .eq('tenant_id', ctx.user.tenantId)
          .single()

        if (!existingProduct) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Product not found',
          })
        }

        // Check SKU uniqueness if SKU is being updated
        if (updateData.sku && updateData.sku !== existingProduct.sku) {
          const { data: skuExists } = await ctx.supabase
            .from('products')
            .select('id')
            .eq('sku', updateData.sku)
            .eq('tenant_id', ctx.user.tenantId)
            .neq('id', id)
            .single()

          if (skuExists) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Product with this SKU already exists',
            })
          }
        }

        const { data: product, error } = await ctx.supabase
          .from('products')
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
            message: 'Failed to update product',
            cause: error,
          })
        }

        return product
      } catch (error) {
        console.error('Update product error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update product',
        })
      }
    }),

  /**
   * Delete product
   */
  deleteProduct: auditedProcedure
    .use(inventoryDeleteProcedure.middleware)
    .input(z.object({
      id: z.string().uuid('Invalid product ID'),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if product exists and belongs to tenant
        const { data: product } = await ctx.supabase
          .from('products')
          .select('id, name')
          .eq('id', input.id)
          .eq('tenant_id', ctx.user.tenantId)
          .single()

        if (!product) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Product not found',
          })
        }

        // Soft delete by setting is_active to false
        const { error } = await ctx.supabase
          .from('products')
          .update({
            is_active: false,
            updated_by: ctx.user.userId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.id)
          .eq('tenant_id', ctx.user.tenantId)

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete product',
            cause: error,
          })
        }

        return { success: true, message: 'Product deleted successfully' }
      } catch (error) {
        console.error('Delete product error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete product',
        })
      }
    }),

  /**
   * Create stock movement
   */
  createStockMovement: auditedProcedure
    .use(inventoryWriteProcedure.middleware)
    .input(stockMovementSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { productId, type, quantity, reason, reference, notes } = input

        // Get current product stock
        const { data: product } = await ctx.supabase
          .from('products')
          .select('id, stock_quantity, name')
          .eq('id', productId)
          .eq('tenant_id', ctx.user.tenantId)
          .single()

        if (!product) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Product not found',
          })
        }

        // Calculate new stock quantity
        let newStockQuantity = product.stock_quantity
        if (type === 'in') {
          newStockQuantity += Math.abs(quantity)
        } else if (type === 'out') {
          newStockQuantity -= Math.abs(quantity)
        } else if (type === 'adjustment') {
          newStockQuantity = quantity
        }

        // Ensure stock doesn't go negative
        if (newStockQuantity < 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Insufficient stock quantity',
          })
        }

        // Create stock movement record
        const { data: movement, error: movementError } = await ctx.supabase
          .from('stock_movements')
          .insert({
            product_id: productId,
            tenant_id: ctx.user.tenantId,
            type,
            quantity: type === 'adjustment' ? quantity - product.stock_quantity : 
                     type === 'out' ? -Math.abs(quantity) : Math.abs(quantity),
            reason,
            reference,
            notes,
            created_by: ctx.user.userId,
          })
          .select()
          .single()

        if (movementError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create stock movement',
            cause: movementError,
          })
        }

        // Update product stock quantity
        const { error: updateError } = await ctx.supabase
          .from('products')
          .update({
            stock_quantity: newStockQuantity,
            updated_by: ctx.user.userId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', productId)
          .eq('tenant_id', ctx.user.tenantId)

        if (updateError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update product stock',
            cause: updateError,
          })
        }

        return movement
      } catch (error) {
        console.error('Create stock movement error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create stock movement',
        })
      }
    }),

  /**
   * Get stock movements for a product
   */
  getStockMovements: inventoryReadProcedure
    .input(z.object({
      productId: z.string().uuid('Invalid product ID'),
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(100).default(20),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const { productId, page, limit } = input
        const offset = (page - 1) * limit

        const { data: movements, error, count } = await ctx.supabase
          .from('stock_movements')
          .select(`
            *,
            created_by_user:users!created_by(id, first_name, last_name)
          `, { count: 'exact' })
          .eq('product_id', productId)
          .eq('tenant_id', ctx.user.tenantId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch stock movements',
            cause: error,
          })
        }

        return {
          movements: movements || [],
          pagination: {
            page,
            limit,
            total: count || 0,
            pages: Math.ceil((count || 0) / limit),
          },
        }
      } catch (error) {
        console.error('Get stock movements error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch stock movements',
        })
      }
    }),

  /**
   * Get low stock products
   */
  getLowStockProducts: inventoryReadProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: products, error } = await ctx.supabase
          .from('products')
          .select(`
            id, name, sku, stock_quantity, min_stock_level,
            categories (id, name)
          `)
          .eq('tenant_id', ctx.user.tenantId)
          .eq('is_active', true)
          .lt('stock_quantity', 'min_stock_level')
          .order('stock_quantity', { ascending: true })

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch low stock products',
            cause: error,
          })
        }

        return products || []
      } catch (error) {
        console.error('Get low stock products error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch low stock products',
        })
      }
    }),

  /**
   * Get product categories
   */
  getCategories: inventoryReadProcedure
    .query(async ({ ctx }) => {
      try {
        const { data: categories, error } = await ctx.supabase
          .from('categories')
          .select('*')
          .eq('tenant_id', ctx.user.tenantId)
          .eq('is_active', true)
          .order('name')

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch categories',
            cause: error,
          })
        }

        return categories || []
      } catch (error) {
        console.error('Get categories error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch categories',
        })
      }
    }),

  /**
   * Create product category
   */
  createCategory: auditedProcedure
    .use(inventoryWriteProcedure.middleware)
    .input(categorySchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { data: category, error } = await ctx.supabase
          .from('categories')
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
            message: 'Failed to create category',
            cause: error,
          })
        }

        return category
      } catch (error) {
        console.error('Create category error:', error)
        throw error instanceof TRPCError ? error : new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create category',
        })
      }
    }),
})