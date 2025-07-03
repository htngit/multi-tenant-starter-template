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
import { createServerComponentClient, createRouteHandlerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from './database.types';
import { performanceMonitor, monitorSupabaseQuery } from './performance';
import { UnifiedCache, CacheKeys, CacheTags } from './cache';
import { withRetry, SupabaseError } from './supabase';

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
  
  const client = createServerComponentClient<Database>({
    cookies: () => cookieStore,
  });
  
  // Add performance monitoring to all queries
  const originalFrom = client.from.bind(client);
  client.from = function(table: string) {
    const query = originalFrom(table);
    
    // Wrap select method with monitoring
    const originalSelect = query.select.bind(query);
    query.select = function(columns?: string) {
      const selectQuery = originalSelect(columns);
      
      // Wrap the final execution
      const originalThen = selectQuery.then?.bind(selectQuery);
      if (originalThen) {
        selectQuery.then = function(onFulfilled, onRejected) {
          const startTime = Date.now();
          
          return originalThen(
            (result) => {
              const duration = Date.now() - startTime;
              
              // Record performance metric
              performanceMonitor.recordMetric({
                type: 'query',
                name: `${table}.select`,
                duration,
                metadata: {
                  table,
                  columns: columns || '*',
                  success: !result.error,
                  rowCount: result.data?.length || 0,
                  timestamp: new Date().toISOString(),
                },
              });
              
              if (onFulfilled) {
                return onFulfilled(result);
              }
              return result;
            },
            (error) => {
              const duration = Date.now() - startTime;
              
              // Record error metric
              performanceMonitor.recordMetric({
                type: 'error',
                name: `${table}.select.error`,
                duration,
                metadata: {
                  table,
                  columns: columns || '*',
                  error: error.message,
                  timestamp: new Date().toISOString(),
                },
              });
              
              if (onRejected) {
                return onRejected(error);
              }
              throw error;
            }
          );
        };
      }
      
      return selectQuery;
    };
    
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
  
  return createRouteHandlerClient<Database>({
    cookies: () => cookieStore,
  });
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
      
      const query = supabase
        .from('products')
        .select(`
          id,
          name,
          unit_price,
          min_stock_level,
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
        } else if (currentStock <= product.min_stock_level) {
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
        .eq('team_id', teamId)
        .eq('is_active', true);
      
      // Apply filters
      if (search) {
        query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,description.ilike.%${search}%`);
      }
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      if (supplierId) {
        query = query.eq('supplier_id', supplierId);
      }
      
      // Apply pagination
      query = query.range(offset, offset + limit - 1);
      
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
        
        let stockStatusCalc: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
        if (currentStock === 0) {
          stockStatusCalc = 'out_of_stock';
        } else if (currentStock <= product.min_stock_level) {
          stockStatusCalc = 'low_stock';
        }
        
        return {
          ...product,
          currentStock,
          stockStatus: stockStatusCalc,
          stockValue: currentStock * product.unit_price,
        };
      });
      
      // Apply stock status filter
      const filteredProducts = stockStatus === 'all' 
        ? productsWithStock
        : productsWithStock.filter(p => p.stockStatus === stockStatus);
      
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
        .eq('id', productId)
        .eq('team_id', teamId)
        .single();
      
      const result = await monitorSupabaseQuery(
        query,
        'products',
        'select',
        { teamId }
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
        throw new Error('Product not found');
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
      
      return {
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