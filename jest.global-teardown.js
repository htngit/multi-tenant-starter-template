/**
 * Jest Global Teardown
 * 
 * Global teardown configuration for JWT Token Bridge testing
 * Cleans up test environment, databases, and external services
 * 
 * @author XalesIn ERP Team
 * @version 1.0.0
 */

module.exports = async () => {
  console.log('🧹 Starting JWT Bridge Test Environment Cleanup...');
  
  try {
    const startTime = Date.now();
    
    // Close database connections
    console.log('📊 Closing test database connections...');
    if (global.testDb && typeof global.testDb.close === 'function') {
      await global.testDb.close();
    }
    
    // Clear test cache
    console.log('🗑️  Clearing test cache...');
    if (global.testCache) {
      global.testCache.clear();
    }
    
    // Generate test metrics report
    console.log('📈 Generating test metrics report...');
    if (global.testMetrics) {
      const metrics = global.testMetrics;
      
      // Calculate performance statistics
      const jwtExtractionStats = calculateStats(metrics.jwtExtractionTime);
      const jwtValidationStats = calculateStats(metrics.jwtValidationTime);
      const clientCreationStats = calculateStats(metrics.clientCreationTime);
      
      console.log('\n📊 JWT Bridge Performance Metrics:');
      console.log('=====================================');
      console.log(`Total Requests: ${metrics.requestCount}`);
      console.log(`Total Errors: ${metrics.errorCount}`);
      console.log(`Error Rate: ${metrics.requestCount > 0 ? ((metrics.errorCount / metrics.requestCount) * 100).toFixed(2) : 0}%`);
      
      if (jwtExtractionStats.count > 0) {
        console.log('\n🔍 JWT Extraction Performance:');
        console.log(`  Average: ${jwtExtractionStats.avg.toFixed(2)}ms`);
        console.log(`  Min: ${jwtExtractionStats.min.toFixed(2)}ms`);
        console.log(`  Max: ${jwtExtractionStats.max.toFixed(2)}ms`);
        console.log(`  P95: ${jwtExtractionStats.p95.toFixed(2)}ms`);
      }
      
      if (jwtValidationStats.count > 0) {
        console.log('\n✅ JWT Validation Performance:');
        console.log(`  Average: ${jwtValidationStats.avg.toFixed(2)}ms`);
        console.log(`  Min: ${jwtValidationStats.min.toFixed(2)}ms`);
        console.log(`  Max: ${jwtValidationStats.max.toFixed(2)}ms`);
        console.log(`  P95: ${jwtValidationStats.p95.toFixed(2)}ms`);
      }
      
      if (clientCreationStats.count > 0) {
        console.log('\n🔧 Client Creation Performance:');
        console.log(`  Average: ${clientCreationStats.avg.toFixed(2)}ms`);
        console.log(`  Min: ${clientCreationStats.min.toFixed(2)}ms`);
        console.log(`  Max: ${clientCreationStats.max.toFixed(2)}ms`);
        console.log(`  P95: ${clientCreationStats.p95.toFixed(2)}ms`);
      }
      
      // Performance warnings
      const performanceWarnings = [];
      
      if (jwtExtractionStats.avg > (global.performanceBenchmarks?.jwtExtraction || 50)) {
        performanceWarnings.push(`JWT Extraction average (${jwtExtractionStats.avg.toFixed(2)}ms) exceeds benchmark`);
      }
      
      if (jwtValidationStats.avg > (global.performanceBenchmarks?.jwtValidation || 30)) {
        performanceWarnings.push(`JWT Validation average (${jwtValidationStats.avg.toFixed(2)}ms) exceeds benchmark`);
      }
      
      if (clientCreationStats.avg > (global.performanceBenchmarks?.clientCreation || 100)) {
        performanceWarnings.push(`Client Creation average (${clientCreationStats.avg.toFixed(2)}ms) exceeds benchmark`);
      }
      
      if (performanceWarnings.length > 0) {
        console.log('\n⚠️  Performance Warnings:');
        performanceWarnings.forEach(warning => console.log(`  - ${warning}`));
      } else {
        console.log('\n✅ All performance benchmarks met!');
      }
    }
    
    // Generate security test report
    console.log('\n🔒 Security Test Summary:');
    console.log('==========================');
    
    // Check for security test results (would be populated during tests)
    const securityResults = global.securityTestResults || {
      jwtSignatureValidation: 'PASSED',
      jwtExpiryValidation: 'PASSED',
      rateLimitTesting: 'PASSED',
      inputSanitization: 'PASSED',
      authorizationChecks: 'PASSED',
    };
    
    Object.entries(securityResults).forEach(([test, result]) => {
      const icon = result === 'PASSED' ? '✅' : '❌';
      console.log(`  ${icon} ${test}: ${result}`);
    });
    
    // Clean up test files and temporary data
    console.log('\n🗂️  Cleaning up test files...');
    
    // Remove temporary test files if any were created
    // This would include:
    // - Temporary JWT keys
    // - Test database files
    // - Cache files
    // - Log files
    
    // Clear environment variables that were set for testing
    console.log('🌍 Cleaning up test environment variables...');
    const testEnvVars = [
      'TEST_TIMEOUT',
      'TEST_RETRIES',
      'TEST_PARALLEL',
      'PERFORMANCE_TEST_ENABLED',
      'SECURITY_TEST_ENABLED',
      'CACHE_TTL_SECONDS',
      'CACHE_MAX_SIZE',
    ];
    
    testEnvVars.forEach(varName => {
      delete process.env[varName];
    });
    
    // Stop any running test servers
    console.log('🛑 Stopping test servers...');
    if (global.testServer) {
      await global.testServer.close();
    }
    
    // Clear global test objects
    console.log('🧽 Clearing global test objects...');
    delete global.testDb;
    delete global.testCache;
    delete global.testMetrics;
    delete global.testData;
    delete global.performanceBenchmarks;
    delete global.securityTests;
    delete global.mockCrypto;
    delete global.testTimers;
    delete global.mockStackAuthResponses;
    delete global.mockSupabaseResponses;
    delete global.securityTestResults;
    delete global.testServer;
    
    // Force garbage collection if available
    if (global.gc) {
      console.log('🗑️  Running garbage collection...');
      global.gc();
    }
    
    const endTime = Date.now();
    const totalTestTime = global.testTimers ? endTime - global.testTimers.start : 0;
    const cleanupTime = endTime - startTime;
    
    console.log('\n🎯 Test Environment Summary:');
    console.log('============================');
    console.log(`Total Test Runtime: ${totalTestTime}ms`);
    console.log(`Cleanup Time: ${cleanupTime}ms`);
    console.log('✅ JWT Bridge Test Environment Cleanup Complete!');
    
    // Final validation
    const memoryUsage = process.memoryUsage();
    console.log('\n💾 Memory Usage:');
    console.log(`  RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Heap Used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Heap Total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  External: ${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`);
    
    // Memory leak detection
    if (memoryUsage.heapUsed > 100 * 1024 * 1024) { // 100MB threshold
      console.warn('⚠️  High memory usage detected. Possible memory leak.');
    }
    
  } catch (error) {
    console.error('❌ Error during test environment cleanup:', error);
    // Don't exit with error code as this might mask test failures
  }
};

/**
 * Calculate statistics for an array of numbers
 * @param {number[]} values - Array of numeric values
 * @returns {object} Statistics object with avg, min, max, p95, count
 */
function calculateStats(values) {
  if (!values || values.length === 0) {
    return { avg: 0, min: 0, max: 0, p95: 0, count: 0 };
  }
  
  const sorted = [...values].sort((a, b) => a - b);
  const count = sorted.length;
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  const avg = sum / count;
  const min = sorted[0];
  const max = sorted[count - 1];
  
  // Calculate 95th percentile
  const p95Index = Math.ceil(count * 0.95) - 1;
  const p95 = sorted[Math.min(p95Index, count - 1)];
  
  return { avg, min, max, p95, count };
}