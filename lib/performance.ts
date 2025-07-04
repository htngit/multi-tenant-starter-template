/**
 * Performance monitoring utilities for Supabase SSR operations
 * Features:
 * - Query performance tracking
 * - Real-time metrics collection
 * - Performance alerts and thresholds
 * - Database connection monitoring
 * - Resource usage tracking
 */

import { UnifiedCache, CacheKeys } from './cache';

// Performance metric types
interface QueryMetric {
  id: string;
  table: string;
  operation: 'select' | 'insert' | 'update' | 'delete' | 'rpc';
  duration: number;
  timestamp: number;
  success: boolean;
  error?: string;
  rowCount?: number;
  cacheHit?: boolean;
  userId?: string;
  teamId?: string;
}

interface ConnectionMetric {
  timestamp: number;
  latency: number;
  status: 'healthy' | 'degraded' | 'unhealthy';
  activeConnections?: number;
  queuedQueries?: number;
}

interface ResourceMetric {
  timestamp: number;
  memoryUsage: number;
  cpuUsage?: number;
  cacheSize: number;
  activeSubscriptions: number;
}

interface PerformanceThresholds {
  queryDuration: {
    warning: number;
    critical: number;
  };
  connectionLatency: {
    warning: number;
    critical: number;
  };
  errorRate: {
    warning: number; // percentage
    critical: number; // percentage
  };
  cacheHitRate: {
    warning: number; // percentage
    critical: number; // percentage
  };
}

// Default performance thresholds
const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  queryDuration: {
    warning: 1000, // 1 second
    critical: 5000, // 5 seconds
  },
  connectionLatency: {
    warning: 200, // 200ms
    critical: 1000, // 1 second
  },
  errorRate: {
    warning: 5, // 5%
    critical: 15, // 15%
  },
  cacheHitRate: {
    warning: 70, // 70%
    critical: 50, // 50%
  },
};

/**
 * Performance Monitor class for tracking Supabase operations
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private queryMetrics: QueryMetric[] = [];
  private connectionMetrics: ConnectionMetric[] = [];
  private resourceMetrics: ResourceMetric[] = [];
  private thresholds: PerformanceThresholds = DEFAULT_THRESHOLDS;
  private maxMetricsHistory = 1000; // Keep last 1000 metrics
  private alertCallbacks: Array<(alert: PerformanceAlert) => void> = [];
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;

  private constructor() {
    this.startMonitoring();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Record a query performance metric
   */
  recordQuery(metric: Omit<QueryMetric, 'id' | 'timestamp'>): void {
    const queryMetric: QueryMetric = {
      ...metric,
      id: this.generateId(),
      timestamp: Date.now(),
    };

    this.queryMetrics.push(queryMetric);
    this.trimMetrics();

    // Check for performance alerts
    this.checkQueryPerformance(queryMetric);

    // Log slow queries
    if (queryMetric.duration > this.thresholds.queryDuration.warning) {
      console.warn(`Slow query detected:`, {
        table: queryMetric.table,
        operation: queryMetric.operation,
        duration: queryMetric.duration,
        success: queryMetric.success,
      });
    }
  }

  /**
   * Record a connection performance metric
   */
  recordConnection(metric: Omit<ConnectionMetric, 'timestamp'>): void {
    const connectionMetric: ConnectionMetric = {
      ...metric,
      timestamp: Date.now(),
    };

    this.connectionMetrics.push(connectionMetric);
    this.trimMetrics();

    // Check for connection alerts
    this.checkConnectionPerformance(connectionMetric);
  }

  /**
   * Record a resource usage metric
   */
  recordResource(metric: Omit<ResourceMetric, 'timestamp'>): void {
    const resourceMetric: ResourceMetric = {
      ...metric,
      timestamp: Date.now(),
    };

    this.resourceMetrics.push(resourceMetric);
    this.trimMetrics();
  }

  /**
   * Get performance statistics for a time period
   */
  getStats(periodMs: number = 5 * 60 * 1000): PerformanceStats {
    const now = Date.now();
    const cutoff = now - periodMs;

    const recentQueries = this.queryMetrics.filter(m => m.timestamp >= cutoff);
    const recentConnections = this.connectionMetrics.filter(m => m.timestamp >= cutoff);
    const recentResources = this.resourceMetrics.filter(m => m.timestamp >= cutoff);

    // Calculate query statistics
    const totalQueries = recentQueries.length;
    const successfulQueries = recentQueries.filter(q => q.success).length;
    const failedQueries = totalQueries - successfulQueries;
    const errorRate = totalQueries > 0 ? (failedQueries / totalQueries) * 100 : 0;

    const queryDurations = recentQueries.map(q => q.duration);
    const avgQueryDuration = queryDurations.length > 0 
      ? queryDurations.reduce((a, b) => a + b, 0) / queryDurations.length 
      : 0;
    const maxQueryDuration = queryDurations.length > 0 ? Math.max(...queryDurations) : 0;
    const minQueryDuration = queryDurations.length > 0 ? Math.min(...queryDurations) : 0;

    // Calculate cache statistics
    const cacheHits = recentQueries.filter(q => q.cacheHit).length;
    const cacheHitRate = totalQueries > 0 ? (cacheHits / totalQueries) * 100 : 0;

    // Calculate connection statistics
    const connectionLatencies = recentConnections.map(c => c.latency);
    const avgConnectionLatency = connectionLatencies.length > 0
      ? connectionLatencies.reduce((a, b) => a + b, 0) / connectionLatencies.length
      : 0;

    // Calculate resource statistics
    const currentResource = recentResources[recentResources.length - 1];

    return {
      period: periodMs,
      queries: {
        total: totalQueries,
        successful: successfulQueries,
        failed: failedQueries,
        errorRate,
        avgDuration: avgQueryDuration,
        maxDuration: maxQueryDuration,
        minDuration: minQueryDuration,
        cacheHitRate,
      },
      connections: {
        avgLatency: avgConnectionLatency,
        healthyCount: recentConnections.filter(c => c.status === 'healthy').length,
        degradedCount: recentConnections.filter(c => c.status === 'degraded').length,
        unhealthyCount: recentConnections.filter(c => c.status === 'unhealthy').length,
      },
      resources: {
        memoryUsage: currentResource?.memoryUsage || 0,
        cpuUsage: currentResource?.cpuUsage || 0,
        cacheSize: currentResource?.cacheSize || 0,
        activeSubscriptions: currentResource?.activeSubscriptions || 0,
      },
      timestamp: now,
    };
  }

  /**
   * Get detailed query breakdown by table and operation
   */
  getQueryBreakdown(periodMs: number = 5 * 60 * 1000): QueryBreakdown {
    const now = Date.now();
    const cutoff = now - periodMs;
    const recentQueries = this.queryMetrics.filter(m => m.timestamp >= cutoff);

    const breakdown: QueryBreakdown = {};

    recentQueries.forEach(query => {
      const key = `${query.table}.${query.operation}`;
      if (!breakdown[key]) {
        breakdown[key] = {
          table: query.table,
          operation: query.operation,
          count: 0,
          totalDuration: 0,
          avgDuration: 0,
          maxDuration: 0,
          minDuration: Infinity,
          successCount: 0,
          errorCount: 0,
          cacheHits: 0,
        };
      }

      const stats = breakdown[key];
      stats.count++;
      stats.totalDuration += query.duration;
      stats.maxDuration = Math.max(stats.maxDuration, query.duration);
      stats.minDuration = Math.min(stats.minDuration, query.duration);
      
      if (query.success) {
        stats.successCount++;
      } else {
        stats.errorCount++;
      }
      
      if (query.cacheHit) {
        stats.cacheHits++;
      }
    });

    // Calculate averages
    Object.values(breakdown).forEach(stats => {
      stats.avgDuration = stats.totalDuration / stats.count;
      if (stats.minDuration === Infinity) {
        stats.minDuration = 0;
      }
    });

    return breakdown;
  }

  /**
   * Add alert callback
   */
  onAlert(callback: (alert: PerformanceAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Update performance thresholds
   */
  updateThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * Start continuous monitoring
   */
  private startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    
    // Monitor resource usage every 30 seconds
    this.monitoringInterval = setInterval(() => {
      this.collectResourceMetrics();
    }, 30000);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
  }

  /**
   * Collect current resource metrics
   */
  private collectResourceMetrics(): void {
    if (typeof window === 'undefined') {
      // Server-side resource collection
      const memoryUsage = process.memoryUsage();
      this.recordResource({
        memoryUsage: memoryUsage.heapUsed,
        cacheSize: 0, // Would need to implement cache size tracking
        activeSubscriptions: 0, // Would need to track active subscriptions
      });
    } else {
      // Client-side resource collection
      const memory = (performance as any).memory;
      this.recordResource({
        memoryUsage: memory?.usedJSHeapSize || 0,
        cacheSize: 0, // Would need to implement cache size tracking
        activeSubscriptions: 0, // Would need to track active subscriptions
      });
    }
  }

  /**
   * Check query performance and trigger alerts
   */
  private checkQueryPerformance(metric: QueryMetric): void {
    if (metric.duration > this.thresholds.queryDuration.critical) {
      this.triggerAlert({
        type: 'query_duration',
        severity: 'critical',
        message: `Critical query duration: ${metric.duration}ms on ${metric.table}.${metric.operation}`,
        metric,
        threshold: this.thresholds.queryDuration.critical,
      });
    } else if (metric.duration > this.thresholds.queryDuration.warning) {
      this.triggerAlert({
        type: 'query_duration',
        severity: 'warning',
        message: `Slow query detected: ${metric.duration}ms on ${metric.table}.${metric.operation}`,
        metric,
        threshold: this.thresholds.queryDuration.warning,
      });
    }
  }

  /**
   * Check connection performance and trigger alerts
   */
  private checkConnectionPerformance(metric: ConnectionMetric): void {
    if (metric.latency > this.thresholds.connectionLatency.critical) {
      this.triggerAlert({
        type: 'connection_latency',
        severity: 'critical',
        message: `Critical connection latency: ${metric.latency}ms`,
        metric,
        threshold: this.thresholds.connectionLatency.critical,
      });
    } else if (metric.latency > this.thresholds.connectionLatency.warning) {
      this.triggerAlert({
        type: 'connection_latency',
        severity: 'warning',
        message: `High connection latency: ${metric.latency}ms`,
        metric,
        threshold: this.thresholds.connectionLatency.warning,
      });
    }
  }

  /**
   * Trigger performance alert
   */
  private triggerAlert(alert: PerformanceAlert): void {
    console.warn(`Performance Alert [${alert.severity.toUpperCase()}]:`, alert.message);
    
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error in performance alert callback:', error);
      }
    });
  }

  /**
   * Trim metrics to prevent memory leaks
   */
  private trimMetrics(): void {
    if (this.queryMetrics.length > this.maxMetricsHistory) {
      this.queryMetrics = this.queryMetrics.slice(-this.maxMetricsHistory);
    }
    if (this.connectionMetrics.length > this.maxMetricsHistory) {
      this.connectionMetrics = this.connectionMetrics.slice(-this.maxMetricsHistory);
    }
    if (this.resourceMetrics.length > this.maxMetricsHistory) {
      this.resourceMetrics = this.resourceMetrics.slice(-this.maxMetricsHistory);
    }
  }

  /**
   * Generate unique ID for metrics
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export metrics for external analysis
   */
  exportMetrics(): {
    queries: QueryMetric[];
    connections: ConnectionMetric[];
    resources: ResourceMetric[];
  } {
    return {
      queries: [...this.queryMetrics],
      connections: [...this.connectionMetrics],
      resources: [...this.resourceMetrics],
    };
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.queryMetrics = [];
    this.connectionMetrics = [];
    this.resourceMetrics = [];
  }

  /**
   * Generic method to record any type of metric
   */
  recordMetric(metric: {
    type: 'request' | 'error' | 'query' | 'connection' | 'resource';
    name: string;
    duration: number;
    metadata?: Record<string, any>;
  }): void {
    const timestamp = Date.now();
    
    switch (metric.type) {
      case 'request':
      case 'error':
        // For request/error metrics, we'll store them as query metrics with special handling
        this.recordQuery({
          table: 'system',
          operation: 'select',
          duration: metric.duration,
          success: metric.type !== 'error',
          error: metric.type === 'error' ? metric.metadata?.error : undefined,
          userId: metric.metadata?.userId,
          teamId: metric.metadata?.teamId,
        });
        break;
      case 'query':
        this.recordQuery({
          table: metric.metadata?.table || 'unknown',
          operation: metric.metadata?.operation || 'select',
          duration: metric.duration,
          success: metric.metadata?.success !== false,
          error: metric.metadata?.error,
          rowCount: metric.metadata?.rowCount,
          cacheHit: metric.metadata?.cacheHit,
          userId: metric.metadata?.userId,
          teamId: metric.metadata?.teamId,
        });
        break;
      case 'connection':
        this.recordConnection({
          latency: metric.duration,
          status: metric.metadata?.status || 'healthy',
          activeConnections: metric.metadata?.activeConnections,
          queuedQueries: metric.metadata?.queuedQueries,
        });
        break;
      case 'resource':
        this.recordResource({
          memoryUsage: metric.metadata?.memoryUsage || 0,
          cpuUsage: metric.metadata?.cpuUsage,
          cacheSize: metric.metadata?.cacheSize || 0,
          activeSubscriptions: metric.metadata?.activeSubscriptions || 0,
        });
        break;
      default:
        console.warn(`Unknown metric type: ${metric.type}`);
    }
    
    // Log for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${metric.type}: ${metric.name} - ${metric.duration}ms`, metric.metadata);
    }
  }
}

// Type definitions
interface PerformanceStats {
  period: number;
  queries: {
    total: number;
    successful: number;
    failed: number;
    errorRate: number;
    avgDuration: number;
    maxDuration: number;
    minDuration: number;
    cacheHitRate: number;
  };
  connections: {
    avgLatency: number;
    healthyCount: number;
    degradedCount: number;
    unhealthyCount: number;
  };
  resources: {
    memoryUsage: number;
    cpuUsage: number;
    cacheSize: number;
    activeSubscriptions: number;
  };
  timestamp: number;
}

interface QueryBreakdown {
  [key: string]: {
    table: string;
    operation: string;
    count: number;
    totalDuration: number;
    avgDuration: number;
    maxDuration: number;
    minDuration: number;
    successCount: number;
    errorCount: number;
    cacheHits: number;
  };
}

interface PerformanceAlert {
  type: 'query_duration' | 'connection_latency' | 'error_rate' | 'cache_hit_rate';
  severity: 'warning' | 'critical';
  message: string;
  metric: QueryMetric | ConnectionMetric | ResourceMetric;
  threshold: number;
  timestamp?: number;
}

/**
 * Decorator for automatic performance monitoring of functions
 */
export function withPerformanceMonitoring<T extends any[], R>(
  table: string,
  operation: QueryMetric['operation']
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: T): Promise<R> {
      const monitor = PerformanceMonitor.getInstance();
      const startTime = performance.now();
      let success = true;
      let error: string | undefined;
      
      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } catch (err) {
        success = false;
        error = err instanceof Error ? err.message : 'Unknown error';
        throw err;
      } finally {
        const duration = performance.now() - startTime;
        
        monitor.recordQuery({
          table,
          operation,
          duration,
          success,
          error,
          // Additional context could be extracted from args if needed
        });
      }
    };
    
    return descriptor;
  };
}

/**
 * Utility function to wrap Supabase queries with performance monitoring
 */
export function monitorSupabaseQuery<T>(
  query: Promise<T> | any,
  table: string,
  operation: QueryMetric['operation'],
  context?: { userId?: string; teamId?: string }
): Promise<T> {
  const monitor = PerformanceMonitor.getInstance();
  const startTime = performance.now();
  
  // Convert query to promise if it's not already one
  const queryPromise = Promise.resolve(query);
  
  return queryPromise
    .then((result: any) => {
      const duration = performance.now() - startTime;
      
      monitor.recordQuery({
        table,
        operation,
        duration,
        success: !result.error,
        error: result.error?.message,
        rowCount: result.data?.length,
        cacheHit: false, // Would need to be determined by the calling code
        ...context,
      });
      
      return result;
    })
    .catch((error) => {
      const duration = performance.now() - startTime;
      
      monitor.recordQuery({
        table,
        operation,
        duration,
        success: false,
        error: error.message,
        ...context,
      });
      
      throw error;
    });
}

// React hooks moved to performance-hooks.ts to avoid client/server conflicts

// Global performance monitor instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Export types
export type {
  QueryMetric,
  ConnectionMetric,
  ResourceMetric,
  PerformanceStats,
  QueryBreakdown,
  PerformanceAlert,
  PerformanceThresholds,
};