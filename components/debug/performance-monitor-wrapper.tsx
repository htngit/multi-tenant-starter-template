'use client';

import dynamic from 'next/dynamic';

const PerformanceMonitor = dynamic(() => import("./performance-monitor").then(mod => ({ default: mod.PerformanceMonitor })), {
  ssr: false
});

export function PerformanceMonitorWrapper() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return <PerformanceMonitor />;
}