#!/usr/bin/env tsx
/**
 * Performance Testing Script for Supabase SSR Optimization
 * 
 * This script tests various performance aspects of the Supabase SSR implementation
 * including query performance, cache efficiency, and real-time subscription latency.
 */

import { createClient } from '@supabase/supabase-js';
import { performance } from 'perf_hooks';
import { UnifiedCache } from '../lib/cache';
import { PerformanceMonitor } from '../lib/performance';
import { withRetry } from '../lib/supabase';
import type { Database } from '../lib/database.types';

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const TEST_ITERATIONS = 100;
const CONCURRENT_REQUESTS = 10;

// Initialize clients
const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
const cache = new UnifiedCache();
const monitor = new PerformanceMonitor();

interface TestResult {
  testName: string;
  averageTime: number;
  minTime: number;
  maxTime: number;
  successRate: number;
  throughput: number;
  errors: string[];
}

class PerformanceTester {
  private results: TestResult[] = [];

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Supabase SSR Performance Tests\n');

    await this.testQueryPerformance();
    await this.testCacheEfficiency();
    await this.testConcurrentQueries();
    await this.testRealtimeLatency();
    await this.testBatchOperations();
    await this.testErrorHandling();

    this.generateReport();
  }

  private async testQueryPerformance(): Promise<void> {
    console.log('📊 Testing Query Performance...');
    
    const times: number[] = [];
    const errors: string[] = [];
    let successCount = 0;

    for (let i = 0; i < TEST_ITERATIONS; i++) {
      try {
        const start = performance.now();
        
        const { data, error } = await supabase
          .from('products')
          .select('id, name, sku, price, stock_quantity')
          .limit(50);

        const end = performance.now();
        
        if (error) {
          errors.push(`Query ${i}: ${error.message}`);
        } else {
          times.push(end - start);
          successCount++;
        }
      } catch (err) {
        errors.push(`Query ${i}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    this.results.push({
      testName: 'Query Performance',
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      successRate: (successCount / TEST_ITERATIONS) * 100,
      throughput: successCount / (times.reduce((a, b) => a + b, 0) / 1000),
      errors: errors.slice(0, 5) // Show first 5 errors
    });
  }

  private async testCacheEfficiency(): Promise<void> {
    console.log('💾 Testing Cache Efficiency...');
    
    const cacheKey = 'test-products';
    const testData = { products: Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Product ${i}` })) };
    
    // Test cache write
    const writeStart = performance.now();
    await cache.set(cacheKey, testData, 60000);
    const writeTime = performance.now() - writeStart;
    
    // Test cache read (hit)
    const readStart = performance.now();
    const cachedData = await cache.get(cacheKey);
    const readTime = performance.now() - readStart;
    
    // Test cache miss
    const missStart = performance.now();
    const missData = await cache.get('non-existent-key');
    const missTime = performance.now() - missStart;
    
    // Test multiple concurrent reads
    const concurrentStart = performance.now();
    await Promise.all(
      Array.from({ length: 50 }, () => cache.get(cacheKey))
    );
    const concurrentTime = performance.now() - concurrentStart;
    
    this.results.push({
      testName: 'Cache Efficiency',
      averageTime: (writeTime + readTime + missTime + concurrentTime) / 4,
      minTime: Math.min(writeTime, readTime, missTime, concurrentTime),
      maxTime: Math.max(writeTime, readTime, missTime, concurrentTime),
      successRate: cachedData && !missData ? 100 : 0,
      throughput: 50 / (concurrentTime / 1000),
      errors: []
    });
  }

  private async testConcurrentQueries(): Promise<void> {
    console.log('⚡ Testing Concurrent Query Performance...');
    
    const times: number[] = [];
    const errors: string[] = [];
    let successCount = 0;

    const batches = Math.ceil(TEST_ITERATIONS / CONCURRENT_REQUESTS);
    
    for (let batch = 0; batch < batches; batch++) {
      const start = performance.now();
      
      const promises = Array.from({ length: CONCURRENT_REQUESTS }, async (_, i) => {
        try {
          const { data, error } = await supabase
            .from('products')
            .select('id, name')
            .range(i * 10, (i + 1) * 10 - 1);
            
          if (error) throw new Error(error.message);
          return data;
        } catch (err) {
          errors.push(`Concurrent query ${batch}-${i}: ${err instanceof Error ? err.message : 'Unknown error'}`);
          throw err;
        }
      });
      
      try {
        await Promise.all(promises);
        const end = performance.now();
        times.push(end - start);
        successCount += CONCURRENT_REQUESTS;
      } catch {
        // Some queries failed, but we continue
      }
    }

    this.results.push({
      testName: 'Concurrent Queries',
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      successRate: (successCount / TEST_ITERATIONS) * 100,
      throughput: successCount / (times.reduce((a, b) => a + b, 0) / 1000),
      errors: errors.slice(0, 5)
    });
  }

  private async testRealtimeLatency(): Promise<void> {
    console.log('📡 Testing Realtime Subscription Latency...');
    
    const latencies: number[] = [];
    const errors: string[] = [];
    let messageCount = 0;
    
    return new Promise((resolve) => {
      const channel = supabase
        .channel('test-channel')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'products' },
          (payload) => {
            const latency = Date.now() - payload.commit_timestamp;
            latencies.push(latency);
            messageCount++;
            
            if (messageCount >= 10) {
              channel.unsubscribe();
              
              this.results.push({
                testName: 'Realtime Latency',
                averageTime: latencies.reduce((a, b) => a + b, 0) / latencies.length,
                minTime: Math.min(...latencies),
                maxTime: Math.max(...latencies),
                successRate: (messageCount / 10) * 100,
                throughput: messageCount / 10,
                errors
              });
              
              resolve();
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            // Trigger some database changes for testing
            this.triggerDatabaseChanges();
          }
        });
      
      // Timeout after 30 seconds
      setTimeout(() => {
        channel.unsubscribe();
        errors.push('Realtime test timeout');
        
        this.results.push({
          testName: 'Realtime Latency',
          averageTime: latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
          minTime: latencies.length > 0 ? Math.min(...latencies) : 0,
          maxTime: latencies.length > 0 ? Math.max(...latencies) : 0,
          successRate: (messageCount / 10) * 100,
          throughput: messageCount / 30,
          errors
        });
        
        resolve();
      }, 30000);
    });
  }

  private async triggerDatabaseChanges(): Promise<void> {
    // Simulate database changes for realtime testing
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await supabase
        .from('products')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', 1); // Assuming product with ID 1 exists
    }
  }

  private async testBatchOperations(): Promise<void> {
    console.log('📦 Testing Batch Operations...');
    
    const times: number[] = [];
    const errors: string[] = [];
    let successCount = 0;

    for (let i = 0; i < 10; i++) {
      try {
        const start = performance.now();
        
        // Simulate batch operation
        const operations = Array.from({ length: 10 }, (_, j) => 
          supabase
            .from('products')
            .select('id, name')
            .eq('id', j + 1)
        );
        
        await Promise.all(operations);
        
        const end = performance.now();
        times.push(end - start);
        successCount++;
      } catch (err) {
        errors.push(`Batch ${i}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    this.results.push({
      testName: 'Batch Operations',
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      successRate: (successCount / 10) * 100,
      throughput: successCount / (times.reduce((a, b) => a + b, 0) / 1000),
      errors
    });
  }

  private async testErrorHandling(): Promise<void> {
    console.log('🛡️ Testing Error Handling and Retry Logic...');
    
    const times: number[] = [];
    const errors: string[] = [];
    let retryCount = 0;

    for (let i = 0; i < 5; i++) {
      try {
        const start = performance.now();
        
        // Test retry logic with intentionally failing query
        await withRetry(async () => {
          retryCount++;
          const { data, error } = await supabase
            .from('non_existent_table')
            .select('*');
            
          if (error) throw new Error(error.message);
          return data;
        }, 3, 1000);
        
        const end = performance.now();
        times.push(end - start);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`Retry test ${i}: ${errorMsg}`);
      }
    }

    this.results.push({
      testName: 'Error Handling',
      averageTime: times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0,
      minTime: times.length > 0 ? Math.min(...times) : 0,
      maxTime: times.length > 0 ? Math.max(...times) : 0,
      successRate: 0, // Expected to fail
      throughput: retryCount / 5,
      errors: errors.slice(0, 3)
    });
  }

  private generateReport(): void {
    console.log('\n📋 Performance Test Report');
    console.log('=' .repeat(80));
    
    this.results.forEach(result => {
      console.log(`\n🔍 ${result.testName}`);
      console.log('-'.repeat(40));
      console.log(`Average Time: ${result.averageTime.toFixed(2)}ms`);
      console.log(`Min Time: ${result.minTime.toFixed(2)}ms`);
      console.log(`Max Time: ${result.maxTime.toFixed(2)}ms`);
      console.log(`Success Rate: ${result.successRate.toFixed(1)}%`);
      console.log(`Throughput: ${result.throughput.toFixed(2)} ops/sec`);
      
      if (result.errors.length > 0) {
        console.log(`Errors: ${result.errors.length}`);
        result.errors.forEach(error => console.log(`  - ${error}`));
      }
    });
    
    // Overall summary
    const avgTime = this.results.reduce((sum, r) => sum + r.averageTime, 0) / this.results.length;
    const avgSuccessRate = this.results.reduce((sum, r) => sum + r.successRate, 0) / this.results.length;
    const totalThroughput = this.results.reduce((sum, r) => sum + r.throughput, 0);
    
    console.log('\n📊 Overall Summary');
    console.log('=' .repeat(40));
    console.log(`Average Response Time: ${avgTime.toFixed(2)}ms`);
    console.log(`Average Success Rate: ${avgSuccessRate.toFixed(1)}%`);
    console.log(`Total Throughput: ${totalThroughput.toFixed(2)} ops/sec`);
    
    // Performance recommendations
    this.generateRecommendations();
  }

  private generateRecommendations(): void {
    console.log('\n💡 Performance Recommendations');
    console.log('=' .repeat(50));
    
    const queryResult = this.results.find(r => r.testName === 'Query Performance');
    if (queryResult && queryResult.averageTime > 100) {
      console.log('⚠️  Query performance is slow. Consider:');
      console.log('   - Adding database indexes');
      console.log('   - Optimizing query structure');
      console.log('   - Implementing query caching');
    }
    
    const cacheResult = this.results.find(r => r.testName === 'Cache Efficiency');
    if (cacheResult && cacheResult.averageTime > 10) {
      console.log('⚠️  Cache performance could be improved. Consider:');
      console.log('   - Using faster cache storage');
      console.log('   - Optimizing cache key structure');
      console.log('   - Implementing cache warming');
    }
    
    const realtimeResult = this.results.find(r => r.testName === 'Realtime Latency');
    if (realtimeResult && realtimeResult.averageTime > 1000) {
      console.log('⚠️  Realtime latency is high. Consider:');
      console.log('   - Optimizing subscription filters');
      console.log('   - Reducing payload size');
      console.log('   - Implementing connection pooling');
    }
    
    console.log('\n✅ Test completed successfully!');
  }
}

// Run tests if script is executed directly
if (require.main === module) {
  const tester = new PerformanceTester();
  tester.runAllTests().catch(console.error);
}

export { PerformanceTester };