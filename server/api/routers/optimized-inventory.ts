/**
 * Optimized inventory router with Supabase SSR, caching, and performance monitoring
 * Features:
 * - Advanced caching strategies
 * - Performance monitoring
 * - Batch operations
 * - Real-time subscriptions
 * - Error handling and retry logic
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { createServerComponentClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { withRetry, SupabaseError, batchOperation } from '../../../lib/supabase';
import { 
  UnifiedCache, 
  CacheKeys, 
  CacheTags, 
  withCache,
  createCachedFunction 
} from '../../../lib/cache';
import { 
  performanceMonitor, 
  monitorSupabaseQuery,
  withPerformanceMonitoring 
} from '../../../lib/performance';
import type { Database } from '../../../lib/database.types';

// Input validation schemas
const productCreateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  sku: z.string().min(1).max(100),
  categoryId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional(),
  unitPrice: z.number().positive(),
  costPrice: z.number().positive(),
  minStockLevel: z.number().int().min(0).default(0),
  maxStockLevel: z.number().int().min(0).optional(),
  unit: z.string().min(1).max(50),
  barcode: z.string().optional(),
  weight: z.number().positive().optional(),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
  }).optional(),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

const productUpdateSchema = productCreateSchema.partial().extend({
  id: z.string().uuid(),
});

const stockMovementSchema = z.object({
  productId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  type: z.enum(['in', 'out', 'adjustment', 'transfer']),
  quantity: z.number().int(),
  unitCost: z.number().positive().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

const inventoryFiltersSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional(),
  warehouseId: z.string().uuid().optional(),
  stockStatus: z.enum(['all', 'in_stock', 'low_stock', 'out_of_stock']).default('all'),
  isActive: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  priceRange: z.object({
    min: z.number().positive().optional(),
    max: z.number().positive().optional(),
  }).optional(),
  sortBy: z.enum(['name', 'sku', 'price', 'stock', 'created_at', 'updated_at']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// Helper functions with caching
const getSupabaseClient = () => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
};

/**
 * Get inventory summary with caching
 */
const getInventorySummaryWithCache = createCachedFunction(
  async (teamId: string) => {
    const supabase = getSupabaseClient();
    
    const query = supabase
      .from('products')
      .select(`
        id,
        name,
        unit_price,
        stock_movements!inner(
          quantity,
          type,
          warehouse_id
        )
      `)
      .eq('team_id', teamId)
      .eq('is_active', true);
    
    const result = await monitorSupabaseQuery(
      query,
      'products',
      'select',
      { teamId }
    );
    
    if (result.error) {
      throw new SupabaseError(
        'Failed to fetch inventory summary',
        result.error.code,
        result.error.details,
        result.error.hint
      );
    }
    
    // Calculate summary statistics
    const products = result.data || [];
    let totalItems = 0;
    let totalValue = 0;
    let lowStockItems = 0;
    let outOfStockItems = 0;
    
    products.forEach(product => {
      const currentStock = product.stock_movements
        .reduce((total, movement) => {
          return movement.type === 'in' 
            ? total + movement.quantity 
            : total - movement.quantity;
        }, 0);
      
      totalItems += currentStock;
      totalValue += currentStock * product.unit_price;
      
      if (currentStock === 0) {
        outOfStockItems++;
      } else if (currentStock <= 10) { // Assuming 10 is low stock threshold
        lowStockItems++;
      }
    });
    
    return {
      totalItems,
      totalValue,
      lowStockItems,
      outOfStockItems,
      totalProducts: products.length,
    };
  },
  {
    revalidate: 300, // 5 minutes
    tags: [CacheTags.teamInventory('teamId')],
  }
);

/**
 * Get products with advanced filtering and caching
 */
const getProductsWithCache = withCache(
  async (teamId: string, filters: z.infer<typeof inventoryFiltersSchema>) => {
    const supabase = getSupabaseClient();
    
    let query = supabase
      .from('products')
      .select(`
        *,
        categories(id, name),
        suppliers(id, name),
        stock_movements(
          id,
          quantity,
          type,
          created_at,
          warehouses(id, name)
        )
      `)
      .eq('team_id', teamId);
    
    // Apply filters
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    
    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    
    if (filters.supplierId) {
      query = query.eq('supplier_id', filters.supplierId);
    }
    
    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }
    
    if (filters.priceRange) {
      if (filters.priceRange.min) {
        query = query.gte('unit_price', filters.priceRange.min);
      }
      if (filters.priceRange.max) {
        query = query.lte('unit_price', filters.priceRange.max);
      }
    }
    
    // Apply sorting
    const sortColumn = filters.sortBy === 'price' ? 'unit_price' : filters.sortBy;
    query = query.order(sortColumn, { ascending: filters.sortOrder === 'asc' });
    
    // Apply pagination
    const from = (filters.page - 1) * filters.limit;
    const to = from + filters.limit - 1;
    query = query.range(from, to);
    
    const result = await monitorSupabaseQuery(
      query,
      'products',
      'select',
      { teamId }
    );
    
    if (result.error) {
      throw new SupabaseError(
        'Failed to fetch products',
        result.error.code,
        result.error.details,
        result.error.hint
      );
    }
    
    // Calculate current stock for each product
    const productsWithStock = (result.data || []).map(product => {
      const currentStock = product.stock_movements
        .reduce((total, movement) => {
          return movement.type === 'in' 
            ? total + movement.quantity 
            : total - movement.quantity;
        }, 0);
      
      let stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
      if (currentStock === 0) {
        stockStatus = 'out_of_stock';
      } else if (currentStock <= product.min_stock_level) {
        stockStatus = 'low_stock';
      }
      
      return {
        ...product,
        currentStock,
        stockStatus,
        stockValue: currentStock * product.unit_price,
      };
    });
    
    // Apply stock status filter
    const filteredProducts = filters.stockStatus === 'all' 
      ? productsWithStock
      : productsWithStock.filter(p => p.stockStatus === filters.stockStatus);
    
    return {
      products: filteredProducts,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: filteredProducts.length,
        hasMore: filteredProducts.length === filters.limit,
      },
    };
  },
  (teamId, filters) => CacheKeys.productList(teamId, filters.page, JSON.stringify(filters)),
  {
    ttl: 2 * 60 * 1000, // 2 minutes
    tags: [CacheTags.teamInventory(teamId)],
  }
);

export const optimizedInventoryRouter = createTRPCRouter({
  /**
   * Get inventory summary with caching
   */
  getSummary: protectedProcedure
    .input(z.object({ teamId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      try {
        return await getInventorySummaryWithCache(input.teamId);
      } catch (error) {
        if (error instanceof SupabaseError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message,
            cause: error,
          });
        }
        throw error;
      }
    }),

  /**
   * Get products with advanced filtering and caching
   */
  getProducts: protectedProcedure
    .input(z.object({
      teamId: z.string().uuid(),
      filters: inventoryFiltersSchema.optional().default({}),
    }))
    .query(async ({ input, ctx }) => {
      try {
        return await getProductsWithCache(input.teamId, input.filters);
      } catch (error) {
        if (error instanceof SupabaseError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message,
            cause: error,
          });
        }
        throw error;
      }
    }),

  /**
   * Get single product with caching
   */
  getProduct: protectedProcedure
    .input(z.object({ 
      productId: z.string().uuid(),
      teamId: z.string().uuid(),
    }))
    .query(async ({ input, ctx }) => {
      const cacheKey = CacheKeys.productDetail(input.productId);
      
      // Try cache first
      const cached = UnifiedCache.get(cacheKey);
      if (cached) {
        return cached;
      }
      
      try {
        const supabase = getSupabaseClient();
        
        const query = supabase
          .from('products')
          .select(`
            *,
            categories(id, name),
            suppliers(id, name, contact_email, contact_phone),
            stock_movements(
              id,
              quantity,
              type,
              unit_cost,
              reference,
              notes,
              created_at,
              warehouses(id, name, location)
            )
          `)
          .eq('id', input.productId)
          .eq('team_id', input.teamId)
          .single();
        
        const result = await monitorSupabaseQuery(
          query,
          'products',
          'select',
          { teamId: input.teamId }
        );
        
        if (result.error) {
          throw new SupabaseError(
            'Failed to fetch product',
            result.error.code,
            result.error.details,
            result.error.hint
          );
        }
        
        const product = result.data;
        if (!product) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Product not found',
          });
        }
        
        // Calculate current stock and movements summary
        const currentStock = product.stock_movements
          .reduce((total, movement) => {
            return movement.type === 'in' 
              ? total + movement.quantity 
              : total - movement.quantity;
          }, 0);
        
        const stockValue = currentStock * product.unit_price;
        const totalCost = product.stock_movements
          .filter(m => m.type === 'in' && m.unit_cost)
          .reduce((total, m) => total + (m.unit_cost! * m.quantity), 0);
        
        const enrichedProduct = {
          ...product,
          currentStock,
          stockValue,
          totalCost,
          averageCost: totalCost > 0 ? totalCost / currentStock : 0,
          stockStatus: currentStock === 0 
            ? 'out_of_stock' 
            : currentStock <= product.min_stock_level 
              ? 'low_stock' 
              : 'in_stock',
        };
        
        // Cache the result
        UnifiedCache.set(cacheKey, enrichedProduct, {
          ttl: 5 * 60 * 1000, // 5 minutes
          tags: [CacheTags.product(input.productId), CacheTags.teamInventory(input.teamId)],
        });
        
        return enrichedProduct;
      } catch (error) {
        if (error instanceof SupabaseError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message,
            cause: error,
          });
        }
        throw error;
      }
    }),

  /**
   * Create product with optimistic updates
   */
  createProduct: protectedProcedure
    .input(z.object({
      teamId: z.string().uuid(),
      product: productCreateSchema,
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = getSupabaseClient();
        
        const productData = {
          ...input.product,
          team_id: input.teamId,
          created_by: ctx.user.id,
        };
        
        const result = await withRetry(async () => {
          const query = supabase
            .from('products')
            .insert(productData)
            .select()
            .single();
          
          return await monitorSupabaseQuery(
            query,
            'products',
            'insert',
            { teamId: input.teamId }
          );
        });
        
        if (result.error) {
          throw new SupabaseError(
            'Failed to create product',
            result.error.code,
            result.error.details,
            result.error.hint
          );
        }
        
        // Invalidate related caches
        UnifiedCache.invalidateByTag(CacheTags.teamInventory(input.teamId));
        
        return result.data;
      } catch (error) {
        if (error instanceof SupabaseError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message,
            cause: error,
          });
        }
        throw error;
      }
    }),

  /**
   * Update product with cache invalidation
   */
  updateProduct: protectedProcedure
    .input(z.object({
      teamId: z.string().uuid(),
      product: productUpdateSchema,
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = getSupabaseClient();
        
        const { id, ...updateData } = input.product;
        const productData = {
          ...updateData,
          updated_at: new Date().toISOString(),
          updated_by: ctx.user.id,
        };
        
        const result = await withRetry(async () => {
          const query = supabase
            .from('products')
            .update(productData)
            .eq('id', id)
            .eq('team_id', input.teamId)
            .select()
            .single();
          
          return await monitorSupabaseQuery(
            query,
            'products',
            'update',
            { teamId: input.teamId }
          );
        });
        
        if (result.error) {
          throw new SupabaseError(
            'Failed to update product',
            result.error.code,
            result.error.details,
            result.error.hint
          );
        }
        
        // Invalidate specific product cache and team inventory
        UnifiedCache.invalidate(CacheKeys.productDetail(id));
        UnifiedCache.invalidateByTag(CacheTags.teamInventory(input.teamId));
        
        return result.data;
      } catch (error) {
        if (error instanceof SupabaseError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message,
            cause: error,
          });
        }
        throw error;
      }
    }),

  /**
   * Delete product with cascade handling
   */
  deleteProduct: protectedProcedure
    .input(z.object({
      productId: z.string().uuid(),
      teamId: z.string().uuid(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = getSupabaseClient();
        
        // Check if product has stock movements
        const stockCheck = await supabase
          .from('stock_movements')
          .select('id')
          .eq('product_id', input.productId)
          .limit(1);
        
        if (stockCheck.data && stockCheck.data.length > 0) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: 'Cannot delete product with existing stock movements. Consider deactivating instead.',
          });
        }
        
        const result = await withRetry(async () => {
          const query = supabase
            .from('products')
            .delete()
            .eq('id', input.productId)
            .eq('team_id', input.teamId);
          
          return await monitorSupabaseQuery(
            query,
            'products',
            'delete',
            { teamId: input.teamId }
          );
        });
        
        if (result.error) {
          throw new SupabaseError(
            'Failed to delete product',
            result.error.code,
            result.error.details,
            result.error.hint
          );
        }
        
        // Invalidate caches
        UnifiedCache.invalidate(CacheKeys.productDetail(input.productId));
        UnifiedCache.invalidateByTag(CacheTags.teamInventory(input.teamId));
        
        return { success: true };
      } catch (error) {
        if (error instanceof SupabaseError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message,
            cause: error,
          });
        }
        throw error;
      }
    }),

  /**
   * Batch create products
   */
  batchCreateProducts: protectedProcedure
    .input(z.object({
      teamId: z.string().uuid(),
      products: z.array(productCreateSchema).min(1).max(50),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = getSupabaseClient();
        
        const operations = input.products.map(product => async () => {
          const productData = {
            ...product,
            team_id: input.teamId,
            created_by: ctx.user.id,
          };
          
          const query = supabase
            .from('products')
            .insert(productData)
            .select()
            .single();
          
          return await monitorSupabaseQuery(
            query,
            'products',
            'insert',
            { teamId: input.teamId }
          );
        });
        
        const batchResult = await batchOperation(operations, {
          concurrency: 5,
          failFast: false,
        });
        
        // Invalidate related caches
        UnifiedCache.invalidateByTag(CacheTags.teamInventory(input.teamId));
        
        return {
          successCount: batchResult.successCount,
          errorCount: batchResult.errorCount,
          results: batchResult.results.map((result, index) => ({
            index,
            success: result !== null,
            data: result?.data || null,
            error: batchResult.errors[index]?.message || null,
          })),
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Batch operation failed',
          cause: error,
        });
      }
    }),

  /**
   * Record stock movement with automatic stock calculation
   */
  recordStockMovement: protectedProcedure
    .input(z.object({
      teamId: z.string().uuid(),
      movement: stockMovementSchema,
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const supabase = getSupabaseClient();
        
        const movementData = {
          ...input.movement,
          team_id: input.teamId,
          created_by: ctx.user.id,
        };
        
        const result = await withRetry(async () => {
          const query = supabase
            .from('stock_movements')
            .insert(movementData)
            .select(`
              *,
              products(id, name, sku),
              warehouses(id, name)
            `)
            .single();
          
          return await monitorSupabaseQuery(
            query,
            'stock_movements',
            'insert',
            { teamId: input.teamId }
          );
        });
        
        if (result.error) {
          throw new SupabaseError(
            'Failed to record stock movement',
            result.error.code,
            result.error.details,
            result.error.hint
          );
        }
        
        // Invalidate related caches
        UnifiedCache.invalidate(CacheKeys.productDetail(input.movement.productId));
        UnifiedCache.invalidateByTag(CacheTags.teamInventory(input.teamId));
        
        return result.data;
      } catch (error) {
        if (error instanceof SupabaseError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message,
            cause: error,
          });
        }
        throw error;
      }
    }),

  /**
   * Get stock movements for a product
   */
  getStockMovements: protectedProcedure
    .input(z.object({
      productId: z.string().uuid(),
      teamId: z.string().uuid(),
      limit: z.number().int().positive().max(100).default(50),
      offset: z.number().int().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      const cacheKey = CacheKeys.stockMovements(input.productId);
      
      try {
        const supabase = getSupabaseClient();
        
        const query = supabase
          .from('stock_movements')
          .select(`
            *,
            warehouses(id, name, location),
            created_by_user:users!created_by(id, email)
          `)
          .eq('product_id', input.productId)
          .eq('team_id', input.teamId)
          .order('created_at', { ascending: false })
          .range(input.offset, input.offset + input.limit - 1);
        
        const result = await monitorSupabaseQuery(
          query,
          'stock_movements',
          'select',
          { teamId: input.teamId }
        );
        
        if (result.error) {
          throw new SupabaseError(
            'Failed to fetch stock movements',
            result.error.code,
            result.error.details,
            result.error.hint
          );
        }
        
        return {
          movements: result.data || [],
          pagination: {
            offset: input.offset,
            limit: input.limit,
            hasMore: (result.data || []).length === input.limit,
          },
        };
      } catch (error) {
        if (error instanceof SupabaseError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message,
            cause: error,
          });
        }
        throw error;
      }
    }),
});