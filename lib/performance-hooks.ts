'use client';

import React from 'react';
import { performanceMonitor } from './performance';
import type { PerformanceStats, QueryBreakdown } from './performance';

/**
 * React hook for accessing performance metrics in client components
 * Provides real-time updates of performance statistics and query breakdowns
 */
export function usePerformanceMetrics() {
  const [stats, setStats] = React.useState<PerformanceStats | null>(null);
  const [breakdown, setBreakdown] = React.useState<QueryBreakdown>({});

  React.useEffect(() => {
    const updateMetrics = () => {
      setStats(performanceMonitor.getStats());
      setBreakdown(performanceMonitor.getQueryBreakdown());
    };

    // Initial load
    updateMetrics();

    // Update every 5 seconds
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  return { stats, breakdown };
}