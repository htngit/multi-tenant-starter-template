/**
 * Supabase SSR utilities for optimized server-side rendering
 * Features:
 * - Server component client creation
 * - Route handler client creation
 * - Middleware client creation
 * - Performance monitoring
 * - Error handling
 * - Caching strategies
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from './database.types';
import { performanceMonitor, monitorSupabaseQuery } from './performance';
import { UnifiedCache, CacheKeys, CacheTags } from './cache';
import { withRetry, SupabaseError } from './supabase';
import { PostgrestBuilder } from '@supabase/postgrest-js';

// Type definitions for enhanced product data with relationships
type ProductRow = Database['public']['Tables']['products']['Row'];
type StockMovementRow = Database['public']['Tables']['stock_movements']['Row'];
type CategoryRow = Database['public']['Tables']['product_categories']['Row'];
type SupplierRow = Database['public']['Tables']['suppliers']['Row'];
type WarehouseRow = Database['public']['Tables']['warehouses']['Row'];

// Enhanced product type with calculated fields and relationships
interface ProductWithStock extends ProductRow {
  currentStock: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  stockValue: number;
  categories?: Pick<CategoryRow, 'id' | 'name'>;
  suppliers?: Pick<SupplierRow, 'id' | 'name'>;      
  stock_movements: Array<StockMovementRow & {        
    warehouses?: Pick<WarehouseRow, 'id' | 'name' | 'address'>;
  }>;
}

// Product with detailed relationships for single product view
interface ProductWithDetails extends ProductRow {
  currentStock: number;
  stockValue: number;
  categories?: Pick<CategoryRow, 'id' | 'name'>;
  suppliers?: Pick<SupplierRow, 'id' | 'name' | 'email' | 'phone'>;
  stock_movements: Array<StockMovementRow & {
    warehouses?: Pick<WarehouseRow, 'id' | 'name' | 'address'>;
  }>;
}

// Dynamic import for next/headers to avoid issues with pages directory
let cookiesModule: any = null;
try {
  cookiesModule = require('next/headers');
} catch (error) {
  // Fallback for environments where next/headers is not available
  console.warn('next/headers not available, some SSR features may be limited');
}

/**
 * Create Supabase client for Server Components
 * Optimized for SSR with caching and performance monitoring
 */
export function createServerSupabaseClient() {
  if (!cookiesModule?.cookies) {
    throw new Error('next/headers cookies not available. This function can only be used in Server Components.');
  }
  
  const cookieStore = cookiesModule.cookies();
  
  const client = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );
  
  // Add basic performance monitoring
  // Note: Detailed query monitoring removed due to TypeScript compatibility issues
  const originalFrom = client.from.bind(client);
  client.from = function(table: any) {
    const query = originalFrom(table);
    
    // Basic monitoring without method override
    console.debug(`Supabase query initiated for table: ${table}`);
    
    return query;
  };
  
  return client;
}

/**
 * Create Supabase client for Route Handlers
 * Optimized for API routes with enhanced error handling
 */
export function createRouteHandlerSupabaseClient() {
  if (!cookiesModule?.cookies) {
    throw new Error('next/headers cookies not available. This function can only be used in Route Handlers.');
  }
  
  const cookieStore = cookiesModule.cookies();
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );
}

/**
 * Create Supabase client for Middleware
 * Optimized for authentication and session management
 */
export function createMiddlewareSupabaseClient(
  request: NextRequest,
  response: NextResponse
) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );
}

/**
 * Cached data fetcher for server components
 * Automatically handles caching, error handling, and performance monitoring
 */
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    tags?: string[];
    revalidate?: number;
    staleWhileRevalidate?: boolean;
  } = {}
): Promise<T> {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    tags = [],
    revalidate,
    staleWhileRevalidate = true,
  } = options;
  
  // Try to get from cache first
  const cached = UnifiedCache.get<T>(key);
  if (cached && !UnifiedCache.isStale(key)) {
    return cached;
  }
  
  // If we have stale data and staleWhileRevalidate is enabled
  if (cached && staleWhileRevalidate) {
    // Return stale data immediately
    const staleData = cached;
    
    // Revalidate in background
    setImmediate(async () => {
      try {
        const fresh = await withRetry(fetcher);
        UnifiedCache.set(key, fresh, { ttl, tags });
      } catch (error) {
        console.error('Background revalidation failed:', error);
      }
    });
    
    return staleData;
  }
  
  // Fetch fresh data
  try {
    const data = await withRetry(fetcher);
    UnifiedCache.set(key, data, { ttl, tags });
    return data;
  } catch (error) {
    // If we have stale data, return it as fallback
    if (cached) {
      console.warn('Fetcher failed, returning stale data:', error);
      return cached;
    }
    throw error;
  }
}

/**
 * Optimized inventory summary fetcher for server components
 */
export async function getInventorySummarySSR(teamId: string) {
  const cacheKey = CacheKeys.inventorySummary(teamId);
  
  return fetchWithCache(
    cacheKey,
    async () => {
      const supabase = createServerSupabaseClient();
      
      const queryPromise = supabase
        .from('products')
        .select(`
          id,
          name,
          selling_price,
          min_stock_level,
          stock_movements!inner(
            quantity,
            movement_type,
            warehouse_id
          )
        `)
        .eq('team_id', teamId)
        .eq('is_active', true);
      
      const result = await monitorSupabaseQuery(
        queryPromise,
        'products',
        'select',
        { teamId }
      ) as { data: any; error: any };
      
      if (result.error) {
        throw new SupabaseError(
          'Failed to fetch inventory summary',
          result.error.code,
          result.error.details,
          result.error.hint
        );
      }
      
      const products = result.data || [];
      let totalItems = 0;
      let totalValue = 0;
      let lowStockItems = 0;
      let outOfStockItems = 0;
      
      products.forEach((product: ProductRow & { stock_movements: StockMovementRow[] }) => {
        const currentStock = product.stock_movements
          .reduce((total: number, movement: StockMovementRow) => {
            return movement.movement_type === 'in' 
              ? total + movement.quantity
              : total - movement.quantity;
          }, 0);
        
        totalItems += currentStock;
        totalValue += currentStock * (product.selling_price || 0);
        
        if (currentStock === 0) {
          outOfStockItems++;
        } else if (product.min_stock_level !== null && currentStock <= product.min_stock_level) {
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
      ttl: 5 * 60 * 1000, // 5 minutes
      tags: [CacheTags.teamInventory(teamId)],
      staleWhileRevalidate: true,
    }
  );
}

/**
 * Optimized products fetcher for server components
 */
export async function getProductsSSR(
  teamId: string,
  options: {
    limit?: number;
    offset?: number;
    search?: string;
    categoryId?: string;
    supplierId?: string;
    stockStatus?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
  } = {}
) {
  const {
    limit = 20,
    offset = 0,
    search,
    categoryId,
    supplierId,
    stockStatus = 'all',
  } = options;
  
  const cacheKey = CacheKeys.productList(teamId, Math.floor(offset / limit) + 1, JSON.stringify(options));
  
  return fetchWithCache(
    cacheKey,
    async () => {
      const supabase = createServerSupabaseClient();
      
      let queryBuilder = supabase
        .from('products')
        .select(`
          *,
          categories(id, name),
          suppliers(id, name),
          stock_movements(
            id,
            quantity,
            movement_type,
            reference_id,
            notes,
            created_at,
            warehouses(id, name)
          )
        `)
        .eq('team_id', teamId)
        .eq('is_active', true);
      
      // Apply filters with type assertions to avoid deep type instantiation
      if (search) {
        queryBuilder = (queryBuilder as any).or(`name.ilike.%${search}%,sku.ilike.%${search}%,description.ilike.%${search}%`);
      }
      
      if (categoryId) {
        queryBuilder = (queryBuilder as any).eq('category_id', categoryId);
      }
      
      if (supplierId) {
        queryBuilder = (queryBuilder as any).eq('supplier_id', supplierId);
      }
      
      // Apply pagination and execute
      const queryPromise = queryBuilder.range(offset, offset + limit - 1);
      
      const result = await monitorSupabaseQuery(
        queryPromise,
        'products',
        'select',
        { teamId }
      ) as { data: any; error: any };
      
      if (result.error) {
        throw new SupabaseError(
          'Failed to fetch products',
          result.error.code,
          result.error.details,
          result.error.hint
        );
      }
      
      // Calculate current stock for each product
      const productsWithStock = (result.data || []).map((product: ProductRow & { 
        stock_movements: StockMovementRow[];
        categories?: Pick<CategoryRow, 'id' | 'name'>;
        suppliers?: Pick<SupplierRow, 'id' | 'name'>;
      }): ProductWithStock => {
        const currentStock = product.stock_movements
          .reduce((total: number, movement: StockMovementRow) => {
            return movement.movement_type === 'in' 
              ? total + movement.quantity
              : total - movement.quantity;
          }, 0);
        
        let stockStatusCalc: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
        if (currentStock === 0) {
          stockStatusCalc = 'out_of_stock';
        } else if (product.min_stock_level !== null && currentStock <= product.min_stock_level) {
          stockStatusCalc = 'low_stock';
        }
        
        return {
          ...product,
          currentStock,
          stockStatus: stockStatusCalc,
          stockValue: currentStock * (product.selling_price || 0),
        };
      });
      
      // Apply stock status filter
      const filteredProducts = stockStatus === 'all'
        ? productsWithStock
        : productsWithStock.filter((p: ProductWithStock) => p.stockStatus === stockStatus);
      
      return {
        products: filteredProducts,
        pagination: {
          offset,
          limit,
          total: filteredProducts.length,
          hasMore: filteredProducts.length === limit,
        },
      };
    },
    {
      ttl: 2 * 60 * 1000, // 2 minutes
      tags: [CacheTags.teamInventory(teamId)],
      staleWhileRevalidate: true,
    }
  );
}

/**
 * Get single product with full details for SSR
 */
export async function getProductSSR(productId: string, teamId: string) {
  const cacheKey = CacheKeys.productDetail(productId);
  
  return fetchWithCache(
    cacheKey,
    async () => {
      const supabase = createServerSupabaseClient();
      
      const queryPromise = supabase
        .from('products')
        .select(`
          *,
          categories(id, name),
          suppliers(id, name, email, phone),
          stock_movements(
            id,
            quantity,
            movement_type,
            reference_id,
            notes,
            created_at,
            warehouses(id, name, address)
          )
        `)
        .eq('id', productId)
        .eq('team_id', teamId)
        .single();
      
      const result = await monitorSupabaseQuery(
        queryPromise,
        'products',
        'select',
        { teamId }
      ) as { data: any; error: any };
      
      if (result.error) {
        throw new SupabaseError(
          'Failed to fetch product',
          result.error.code,
          result.error.details,
          result.error.hint
        );
      }
      
      const product = result.data as ProductRow & {
          stock_movements: StockMovementRow[];
          categories?: Pick<CategoryRow, 'id' | 'name'>;
          suppliers?: Pick<SupplierRow, 'id' | 'name' | 'email' | 'phone'>;
          warehouses?: Pick<WarehouseRow, 'id' | 'name' | 'address'>;
        };
      if (!product) {
        throw new Error('Product not found');
      }
      
      // Calculate current stock and movements summary
      const currentStock = product.stock_movements
        .reduce((total: number, movement: StockMovementRow) => {
          return movement.movement_type === 'in' 
            ? total + movement.quantity
            : total - movement.quantity;
        }, 0);
      
      const stockValue = currentStock * (product.selling_price || 0);
      // Note: unit_cost is not available in stock_movements table
      const totalCost = 0; // This would need to be calculated from purchase orders or other sources
      
      return {
        ...product,
        currentStock,
        stockValue,
        totalCost,
        averageCost: 0, // Would need purchase order data to calculate
        stockStatus: currentStock === 0 
          ? 'out_of_stock' 
          : product.min_stock_level !== null && currentStock <= product.min_stock_level 
            ? 'low_stock' 
            : 'in_stock',
      };
    },
    {
      ttl: 5 * 60 * 1000, // 5 minutes
      tags: [CacheTags.product(productId), CacheTags.teamInventory(teamId)],
      staleWhileRevalidate: true,
    }
  );
}

/**
 * Preload data for faster page loads
 */
export async function preloadInventoryData(teamId: string) {
  try {
    // Preload summary and initial products in parallel
    await Promise.all([
      getInventorySummarySSR(teamId),
      getProductsSSR(teamId, { limit: 10 }),
    ]);
  } catch (error) {
    console.error('Failed to preload inventory data:', error);
    // Don't throw, just log the error
  }
}

/**
 * Invalidate cache for team inventory
 */
export function invalidateTeamInventoryCache(teamId: string) {
  UnifiedCache.invalidateByTag(CacheTags.teamInventory(teamId));
}

/**
 * Invalidate cache for specific product
 */
export function invalidateProductCache(productId: string) {
  UnifiedCache.invalidate(CacheKeys.productDetail(productId));
}

/**
 * Health check for Supabase connection
 */
export async function checkSupabaseHealth() {
  try {
    const supabase = createServerSupabaseClient();
    const startTime = Date.now();
    
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    const duration = Date.now() - startTime;
    
    if (error) {
      return {
        healthy: false,
        error: error.message,
        duration,
      };
    }
    
    return {
      healthy: true,
      duration,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: 0,
    };
  }
}