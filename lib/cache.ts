/**
 * Advanced caching utilities for Supabase SSR optimization
 * Features:
 * - Multi-level caching (memory, localStorage, sessionStorage)
 * - Cache invalidation strategies
 * - TTL (Time To Live) support
 * - Cache warming and preloading
 * - Performance monitoring
 */

import { unstable_cache } from 'next/cache';

// Cache configuration types
interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  staleWhileRevalidate?: number; // Stale time in milliseconds
  tags?: string[]; // Cache tags for invalidation
  revalidate?: number; // Next.js revalidation time in seconds
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  tags: string[];
}

// In-memory cache for server-side operations
class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 1000; // Maximum number of entries
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  set<T>(key: string, data: T, config: CacheConfig = {}): void {
    const { ttl = 5 * 60 * 1000, tags = [] } = config; // Default 5 minutes TTL
    
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      tags,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidateByTag(tag: string): void {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        ttl: entry.ttl,
        tags: entry.tags,
      })),
    };
  }
}

// Global memory cache instance
const memoryCache = new MemoryCache();

/**
 * Browser-side cache utilities
 */
export class BrowserCache {
  private static isClient = typeof window !== 'undefined';

  static set<T>(key: string, data: T, config: CacheConfig = {}): void {
    if (!this.isClient) return;

    const { ttl = 5 * 60 * 1000, tags = [] } = config;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      tags,
    };

    try {
      localStorage.setItem(`supabase_cache_${key}`, JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to set cache in localStorage:', error);
      // Fallback to sessionStorage
      try {
        sessionStorage.setItem(`supabase_cache_${key}`, JSON.stringify(entry));
      } catch (sessionError) {
        console.warn('Failed to set cache in sessionStorage:', sessionError);
      }
    }
  }

  static get<T>(key: string): T | null {
    if (!this.isClient) return null;

    try {
      const stored = localStorage.getItem(`supabase_cache_${key}`) ||
                    sessionStorage.getItem(`supabase_cache_${key}`);
      
      if (!stored) return null;

      const entry: CacheEntry<T> = JSON.parse(stored);
      
      // Check if entry has expired
      if (Date.now() - entry.timestamp > entry.ttl) {
        this.invalidate(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('Failed to get cache from storage:', error);
      return null;
    }
  }

  static invalidate(key: string): void {
    if (!this.isClient) return;

    localStorage.removeItem(`supabase_cache_${key}`);
    sessionStorage.removeItem(`supabase_cache_${key}`);
  }

  static invalidateByTag(tag: string): void {
    if (!this.isClient) return;

    // Check localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('supabase_cache_')) {
        try {
          const entry = JSON.parse(localStorage.getItem(key)!);
          if (entry.tags?.includes(tag)) {
            localStorage.removeItem(key);
          }
        } catch (error) {
          // Invalid entry, remove it
          localStorage.removeItem(key);
        }
      }
    }

    // Check sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith('supabase_cache_')) {
        try {
          const entry = JSON.parse(sessionStorage.getItem(key)!);
          if (entry.tags?.includes(tag)) {
            sessionStorage.removeItem(key);
          }
        } catch (error) {
          // Invalid entry, remove it
          sessionStorage.removeItem(key);
        }
      }
    }
  }

  static clear(): void {
    if (!this.isClient) return;

    // Clear only Supabase cache entries
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('supabase_cache_')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear sessionStorage
    keysToRemove.length = 0;
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith('supabase_cache_')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
  }
}

/**
 * Unified cache interface that works on both server and client
 */
export class UnifiedCache {
  static set<T>(key: string, data: T, config: CacheConfig = {}): void {
    if (typeof window === 'undefined') {
      // Server-side: use memory cache
      memoryCache.set(key, data, config);
    } else {
      // Client-side: use browser cache
      BrowserCache.set(key, data, config);
    }
  }

  static get<T>(key: string): T | null {
    if (typeof window === 'undefined') {
      // Server-side: use memory cache
      return memoryCache.get<T>(key);
    } else {
      // Client-side: use browser cache
      return BrowserCache.get<T>(key);
    }
  }

  static invalidate(key: string): void {
    if (typeof window === 'undefined') {
      memoryCache.invalidate(key);
    } else {
      BrowserCache.invalidate(key);
    }
  }

  static invalidateByTag(tag: string): void {
    if (typeof window === 'undefined') {
      memoryCache.invalidateByTag(tag);
    } else {
      BrowserCache.invalidateByTag(tag);
    }
  }

  static clear(): void {
    if (typeof window === 'undefined') {
      memoryCache.clear();
    } else {
      BrowserCache.clear();
    }
  }
}

/**
 * Next.js cache wrapper with automatic invalidation
 */
export function createCachedFunction<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  config: CacheConfig = {}
) {
  const { revalidate = 60, tags = [] } = config;
  
  return unstable_cache(
    fn,
    undefined,
    {
      revalidate,
      tags,
    }
  );
}

/**
 * Cache key generators for consistent naming
 */
export const CacheKeys = {
  // User-specific caches
  userProfile: (userId: string) => `user:profile:${userId}`,
  userPermissions: (userId: string, teamId: string) => `user:permissions:${userId}:${teamId}`,
  userTeams: (userId: string) => `user:teams:${userId}`,
  
  // Team-specific caches
  teamMembers: (teamId: string) => `team:members:${teamId}`,
  teamSettings: (teamId: string) => `team:settings:${teamId}`,
  
  // Inventory caches
  inventorySummary: (teamId: string) => `inventory:summary:${teamId}`,
  productList: (teamId: string, page: number, filters?: string) => 
    `inventory:products:${teamId}:${page}${filters ? `:${filters}` : ''}`,
  productDetail: (productId: string) => `inventory:product:${productId}`,
  stockMovements: (productId: string) => `inventory:movements:${productId}`,
  
  // Category caches
  categories: (teamId: string) => `categories:${teamId}`,
  categoryTree: (teamId: string) => `categories:tree:${teamId}`,
  
  // Supplier caches
  suppliers: (teamId: string) => `suppliers:${teamId}`,
  supplierProducts: (supplierId: string) => `supplier:products:${supplierId}`,
  
  // Customer caches
  customers: (teamId: string) => `customers:${teamId}`,
  customerOrders: (customerId: string) => `customer:orders:${customerId}`,
  
  // Analytics caches
  salesAnalytics: (teamId: string, period: string) => `analytics:sales:${teamId}:${period}`,
  inventoryAnalytics: (teamId: string, period: string) => `analytics:inventory:${teamId}:${period}`,
};

/**
 * Cache tags for invalidation strategies
 */
export const CacheTags = {
  // Entity-based tags
  user: (userId: string) => `user:${userId}`,
  team: (teamId: string) => `team:${teamId}`,
  product: (productId: string) => `product:${productId}`,
  category: (categoryId: string) => `category:${categoryId}`,
  supplier: (supplierId: string) => `supplier:${supplierId}`,
  customer: (customerId: string) => `customer:${customerId}`,
  
  // Feature-based tags
  inventory: 'inventory',
  analytics: 'analytics',
  permissions: 'permissions',
  settings: 'settings',
  
  // Team-scoped feature tags
  teamInventory: (teamId: string) => `inventory:${teamId}`,
  teamAnalytics: (teamId: string) => `analytics:${teamId}`,
  teamPermissions: (teamId: string) => `permissions:${teamId}`,
};

/**
 * Cache warming utilities
 */
export class CacheWarmer {
  private static warmingQueue: Array<() => Promise<void>> = [];
  private static isWarming = false;

  static addToQueue(warmer: () => Promise<void>): void {
    this.warmingQueue.push(warmer);
  }

  static async warmCache(): Promise<void> {
    if (this.isWarming || this.warmingQueue.length === 0) {
      return;
    }

    this.isWarming = true;
    console.log(`Starting cache warming for ${this.warmingQueue.length} items`);

    try {
      // Process warming queue in batches of 3
      const batchSize = 3;
      for (let i = 0; i < this.warmingQueue.length; i += batchSize) {
        const batch = this.warmingQueue.slice(i, i + batchSize);
        await Promise.allSettled(batch.map(warmer => warmer()));
        
        // Small delay between batches to avoid overwhelming the system
        if (i + batchSize < this.warmingQueue.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      console.log('Cache warming completed successfully');
    } catch (error) {
      console.error('Cache warming failed:', error);
    } finally {
      this.isWarming = false;
      this.warmingQueue = [];
    }
  }

  // Predefined cache warmers for common data
  static warmInventoryData(teamId: string): void {
    this.addToQueue(async () => {
      // Warm inventory summary - moved to separate server-side utility
      console.log(`Warming inventory summary for team ${teamId}`);
      // TODO: Implement server-side inventory summary warming
    });

    this.addToQueue(async () => {
      // Warm initial products - moved to separate server-side utility
      console.log(`Warming initial products for team ${teamId}`);
      // TODO: Implement server-side product warming
    });
  }

  static warmUserData(userId: string, teamId: string): void {
    this.addToQueue(async () => {
      // Warm user permissions
      // Implementation would depend on your permission system
      console.log(`Warming user data for ${userId} in team ${teamId}`);
    });
  }
}

/**
 * Performance monitoring for cache operations
 */
export class CacheMetrics {
  private static metrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    invalidations: 0,
    totalTime: 0,
  };

  static recordHit(): void {
    this.metrics.hits++;
  }

  static recordMiss(): void {
    this.metrics.misses++;
  }

  static recordSet(): void {
    this.metrics.sets++;
  }

  static recordInvalidation(): void {
    this.metrics.invalidations++;
  }

  static recordTime(time: number): void {
    this.metrics.totalTime += time;
  }

  static getMetrics() {
    const total = this.metrics.hits + this.metrics.misses;
    return {
      ...this.metrics,
      hitRate: total > 0 ? (this.metrics.hits / total) * 100 : 0,
      averageTime: this.metrics.sets > 0 ? this.metrics.totalTime / this.metrics.sets : 0,
    };
  }

  static reset(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      invalidations: 0,
      totalTime: 0,
    };
  }
}

/**
 * Utility function to wrap any function with caching
 */
export function withCache<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyGenerator: (...args: T) => string,
  config: CacheConfig = {}
) {
  return async (...args: T): Promise<R> => {
    const key = keyGenerator(...args);
    const startTime = performance.now();
    
    // Try to get from cache first
    const cached = UnifiedCache.get<R>(key);
    if (cached !== null) {
      CacheMetrics.recordHit();
      CacheMetrics.recordTime(performance.now() - startTime);
      return cached;
    }
    
    CacheMetrics.recordMiss();
    
    // Execute function and cache result
    try {
      const result = await fn(...args);
      UnifiedCache.set(key, result, config);
      CacheMetrics.recordSet();
      CacheMetrics.recordTime(performance.now() - startTime);
      return result;
    } catch (error) {
      CacheMetrics.recordTime(performance.now() - startTime);
      throw error;
    }
  };
}