/**
 * Performance monitoring component for Supabase SSR
 * Features:
 * - Real-time performance metrics
 * - Query performance tracking
 * - Cache hit/miss rates
 * - Error monitoring
 * - Visual performance dashboard
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Database, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  BarChart3,
  Zap,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { usePerformanceMetrics } from '@/lib/performance-hooks';
import { UnifiedCache } from '@/lib/cache';
import { checkSupabaseHealth } from '@/lib/supabase-ssr';

interface PerformanceMetric {
  type: 'query' | 'request' | 'error' | 'cache';
  name: string;
  duration: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalSize: number;
  itemCount: number;
}

interface HealthStatus {
  healthy: boolean;
  duration: number;
  error?: string;
  timestamp: string;
}

export function PerformanceMonitor() {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalSize: 0,
    itemCount: 0,
  });
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const performanceMetrics = usePerformanceMetrics();
  
  // Update metrics from performance monitor
  useEffect(() => {
    if (performanceMetrics.stats) {
      setMetrics(prev => {
        const stats = performanceMetrics.stats!;
        const newMetric: PerformanceMetric = {
          type: 'query',
          name: 'performance_stats',
          duration: stats.queries.avgDuration || 0,
          timestamp: new Date().toISOString(),
          metadata: {
            queryCount: stats.queries.total,
            totalQueries: stats.queries.total,
            avgDuration: stats.queries.avgDuration,
            maxDuration: stats.queries.maxDuration,
            errorRate: stats.queries.errorRate,
            cacheHitRate: stats.queries.cacheHitRate
          }
        };
        const newMetrics = [...prev, newMetric];
        // Keep only last 100 metrics
        return newMetrics.slice(-100);
      });
    }
  }, [performanceMetrics.stats]);
  
  // Update cache stats
  useEffect(() => {
    const updateCacheStats = () => {
      // Since UnifiedCache.getStats() doesn't exist, provide default values
      // TODO: Implement cache statistics tracking in UnifiedCache
      setCacheStats({
        hits: 0,
        misses: 0,
        hitRate: 0,
        totalSize: 0,
        itemCount: 0,
      });
    };
    
    updateCacheStats();
    const interval = setInterval(updateCacheStats, 5000);
    return () => clearInterval(interval);
  }, []);
  
  // Check Supabase health
  const checkHealth = async () => {
    setIsRefreshing(true);
    try {
      const health = await checkSupabaseHealth();
      setHealthStatus({
        ...health,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      setHealthStatus({
        healthy: false,
        duration: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);
  
  // Calculate performance statistics
  const queryMetrics = metrics.filter(m => m.type === 'query');
  const errorMetrics = metrics.filter(m => m.type === 'error');
  const requestMetrics = metrics.filter(m => m.type === 'request');
  
  const avgQueryTime = queryMetrics.length > 0 
    ? queryMetrics.reduce((sum, m) => sum + m.duration, 0) / queryMetrics.length 
    : 0;
  
  const avgRequestTime = requestMetrics.length > 0 
    ? requestMetrics.reduce((sum, m) => sum + m.duration, 0) / requestMetrics.length 
    : 0;
  
  const errorRate = metrics.length > 0 
    ? (errorMetrics.length / metrics.length) * 100 
    : 0;
  
  // Get recent metrics (last 10)
  const recentMetrics = metrics.slice(-10).reverse();
  
  // Format duration
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };
  
  // Format timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };
  
  // Get performance status
  const getPerformanceStatus = () => {
    if (avgQueryTime > 2000) return { status: 'poor', color: 'destructive' };
    if (avgQueryTime > 1000) return { status: 'fair', color: 'warning' };
    return { status: 'good', color: 'success' };
  };
  
  const performanceStatus = getPerformanceStatus();
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <>
      {/* Toggle Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(!isVisible)}
          variant="outline"
          size="sm"
          className="bg-background/80 backdrop-blur-sm"
        >
          <Activity className="h-4 w-4 mr-2" />
          Performance
        </Button>
      </div>
      
      {/* Performance Monitor Panel */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 w-96 max-h-[80vh] overflow-auto z-50 bg-background border rounded-lg shadow-lg">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Performance Monitor</CardTitle>
                  <CardDescription>Real-time Supabase SSR metrics</CardDescription>
                </div>
                <Button
                  onClick={() => setIsVisible(false)}
                  variant="ghost"
                  size="sm"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="queries">Queries</TabsTrigger>
                  <TabsTrigger value="cache">Cache</TabsTrigger>
                  <TabsTrigger value="health">Health</TabsTrigger>
                </TabsList>
                
                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">Avg Query Time</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{formatDuration(avgQueryTime)}</span>
                        <Badge variant={performanceStatus.color as any}>
                          {performanceStatus.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        <span className="text-sm font-medium">Error Rate</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{errorRate.toFixed(1)}%</span>
                        {errorRate > 5 ? (
                          <TrendingUp className="h-4 w-4 text-destructive" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-success" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span className="text-sm font-medium">Cache Hit Rate</span>
                    </div>
                    <Progress value={cacheStats.hitRate} className="w-full" />
                    <div className="text-xs text-muted-foreground">
                      {cacheStats.hitRate.toFixed(1)}% ({cacheStats.hits} hits, {cacheStats.misses} misses)
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Recent Activity</span>
                    <div className="space-y-1 max-h-32 overflow-auto">
                      {recentMetrics.map((metric, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            {metric.type === 'query' && <Database className="h-3 w-3" />}
                            {metric.type === 'error' && <XCircle className="h-3 w-3 text-destructive" />}
                            {metric.type === 'request' && <Activity className="h-3 w-3" />}
                            <span className="truncate max-w-32">{metric.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>{formatDuration(metric.duration)}</span>
                            <span className="text-muted-foreground">{formatTime(metric.timestamp)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                {/* Queries Tab */}
                <TabsContent value="queries" className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Query Performance</span>
                    <div className="space-y-1 max-h-64 overflow-auto">
                      {queryMetrics.slice(-20).reverse().map((metric, index) => (
                        <div key={index} className="p-2 border rounded text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{metric.name}</span>
                            <span className={`font-mono ${
                              metric.duration > 1000 ? 'text-destructive' : 
                              metric.duration > 500 ? 'text-warning' : 'text-success'
                            }`}>
                              {formatDuration(metric.duration)}
                            </span>
                          </div>
                          {metric.metadata && (
                            <div className="mt-1 text-muted-foreground">
                              {metric.metadata.table && `Table: ${metric.metadata.table}`}
                              {metric.metadata.rowCount && ` • Rows: ${metric.metadata.rowCount}`}
                            </div>
                          )}
                          <div className="text-muted-foreground">
                            {formatTime(metric.timestamp)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                {/* Cache Tab */}
                <TabsContent value="cache" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Cache Hits</span>
                      <span className="text-2xl font-bold text-success">{cacheStats.hits}</span>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Cache Misses</span>
                      <span className="text-2xl font-bold text-destructive">{cacheStats.misses}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Cache Size</span>
                    <div className="text-lg font-bold">
                      {cacheStats.itemCount} items
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(cacheStats.totalSize / 1024).toFixed(1)} KB total
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => {
                      UnifiedCache.clear();
                      setCacheStats({
                        hits: 0,
                        misses: 0,
                        hitRate: 0,
                        totalSize: 0,
                        itemCount: 0,
                      });
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Clear Cache
                  </Button>
                </TabsContent>
                
                {/* Health Tab */}
                <TabsContent value="health" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Supabase Connection</span>
                    <Button
                      onClick={checkHealth}
                      disabled={isRefreshing}
                      variant="outline"
                      size="sm"
                    >
                      {isRefreshing ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {healthStatus && (
                    <Alert>
                      <div className="flex items-center gap-2">
                        {healthStatus.healthy ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                        <span className="font-medium">
                          {healthStatus.healthy ? 'Healthy' : 'Unhealthy'}
                        </span>
                      </div>
                      <AlertDescription className="mt-2">
                        <div>Response time: {formatDuration(healthStatus.duration)}</div>
                        <div>Last checked: {formatTime(healthStatus.timestamp)}</div>
                        {healthStatus.error && (
                          <div className="text-destructive mt-1">
                            Error: {healthStatus.error}
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {errorMetrics.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Recent Errors</span>
                      <div className="space-y-1 max-h-32 overflow-auto">
                        {errorMetrics.slice(-5).reverse().map((error, index) => (
                          <Alert key={index} variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <div className="font-medium">{error.name}</div>
                              <div className="text-xs">{formatTime(error.timestamp)}</div>
                              {error.metadata?.error && (
                                <div className="text-xs mt-1">{error.metadata.error}</div>
                              )}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}