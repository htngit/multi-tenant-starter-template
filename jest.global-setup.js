/**
 * Jest Global Setup
 * 
 * Global setup configuration for JWT Token Bridge testing
 * Initializes test environment, databases, and external services
 * 
 * @author XalesIn ERP Team
 * @version 1.0.0
 */

const { execSync } = require('child_process');
const path = require('path');

module.exports = async () => {
  console.log('🚀 Starting JWT Bridge Test Environment Setup...');
  
  try {
    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.CI = 'true';
    
    // Database setup for testing
    console.log('📊 Setting up test database...');
    
    // Create test database schema if needed
    // This would typically involve:
    // 1. Creating a test database
    // 2. Running migrations
    // 3. Seeding test data
    
    // Mock Supabase test environment
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-service-role';
    
    // Mock Stack Auth test environment
    process.env.STACK_AUTH_PROJECT_ID = 'test-stack-project-id';
    process.env.STACK_AUTH_SECRET_KEY = 'test-stack-secret-key';
    process.env.STACK_AUTH_PUBLISHABLE_CLIENT_KEY = 'test-stack-publishable-key';
    
    // JWT testing configuration
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only-do-not-use-in-production';
    process.env.JWT_ALGORITHM = 'HS256';
    process.env.JWT_EXPIRY = '1h';
    
    // Test-specific configurations
    process.env.TEST_TIMEOUT = '30000';
    process.env.TEST_RETRIES = '3';
    process.env.TEST_PARALLEL = 'true';
    
    // Performance testing configuration
    process.env.PERFORMANCE_TEST_ENABLED = 'true';
    process.env.PERFORMANCE_THRESHOLD_MS = '100';
    
    // Security testing configuration
    process.env.SECURITY_TEST_ENABLED = 'true';
    process.env.RATE_LIMIT_TEST_REQUESTS = '100';
    process.env.RATE_LIMIT_TEST_WINDOW = '60000';
    
    // Cache configuration for testing
    process.env.CACHE_TTL_SECONDS = '300';
    process.env.CACHE_MAX_SIZE = '1000';
    
    // Logging configuration
    process.env.LOG_LEVEL = 'error'; // Reduce noise in tests
    process.env.LOG_FORMAT = 'json';
    
    // Network configuration
    process.env.REQUEST_TIMEOUT_MS = '5000';
    process.env.MAX_RETRIES = '3';
    process.env.RETRY_DELAY_MS = '1000';
    
    console.log('🔧 Initializing test utilities...');
    
    // Initialize test database connections
    global.testDb = {
      // Mock database connection for testing
      query: () => Promise.resolve({ rows: [], rowCount: 0 }),
      close: () => Promise.resolve(undefined),
    };
    
    // Initialize test cache
    global.testCache = new Map();
    
    // Initialize test metrics
    global.testMetrics = {
      jwtExtractionTime: [],
      jwtValidationTime: [],
      clientCreationTime: [],
      requestCount: 0,
      errorCount: 0,
    };
    
    // Setup test HTTP server for mocking external services
    console.log('🌐 Setting up mock HTTP server...');
    
    // Mock Stack Auth API responses
    global.mockStackAuthResponses = {
      '/api/auth/tokens': {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
      },
      '/api/auth/user': {
        id: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User',
        tenantId: 'test-tenant-id',
        roles: ['user'],
        permissions: ['read', 'write'],
      },
      '/api/auth/validate': {
        valid: true,
        claims: {
          sub: 'test-user-id',
          tenant_id: 'test-tenant-id',
          roles: ['user'],
          permissions: ['read', 'write'],
        },
      },
    };
    
    // Mock Supabase API responses
    global.mockSupabaseResponses = {
      '/rest/v1/rpc/set_tenant_context': {
        success: true,
      },
      '/rest/v1/audit_logs': {
        data: [],
        error: null,
      },
      '/rest/v1/inventory_items': {
        data: [],
        error: null,
      },
    };
    
    // Setup test data
    console.log('📝 Preparing test data...');
    
    global.testData = {
      users: [
        {
          id: 'user_1',
          email: 'user1@test.com',
          tenantId: 'tenant_1',
          roles: ['user'],
          permissions: ['inventory.read'],
        },
        {
          id: 'user_2',
          email: 'admin@test.com',
          tenantId: 'tenant_1',
          roles: ['admin'],
          permissions: ['inventory.read', 'inventory.write', 'admin.all'],
        },
      ],
      tenants: [
        {
          id: 'tenant_1',
          name: 'Test Tenant 1',
          settings: {
            jwtEnabled: true,
            rlsEnabled: true,
          },
        },
      ],
      jwtTokens: {
        valid: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEiLCJ0ZW5hbnRfaWQiOiJ0ZW5hbnRfMSIsInJvbGVzIjpbInVzZXIiXSwicGVybWlzc2lvbnMiOlsiaW52ZW50b3J5LnJlYWQiXSwiaWF0IjoxNjM5NTg0MDAwLCJleHAiOjE2Mzk1ODc2MDB9.test-signature',
        expired: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEiLCJleHAiOjE2Mzk1ODAwMDB9.expired-signature',
        invalid: 'invalid.jwt.token',
        malformed: 'not-a-jwt',
      },
    };
    
    // Performance benchmarks
    global.performanceBenchmarks = {
      jwtExtraction: 50, // ms
      jwtValidation: 30, // ms
      clientCreation: 100, // ms
      databaseQuery: 200, // ms
    };
    
    // Security test configurations
    global.securityTests = {
      maxRequestsPerMinute: 100,
      jwtExpiryTolerance: 300, // seconds
      allowedIssuers: ['stack-auth'],
      allowedAudiences: ['xalesin-erp'],
    };
    
    console.log('🔒 Setting up security test environment...');
    
    // Mock crypto functions for consistent testing
    global.mockCrypto = {
      randomBytes: (size) => Buffer.alloc(size, 'test'),
      createHash: () => ({
        update: () => ({
          digest: () => 'test-hash',
        }),
      }),
      createHmac: () => ({
        update: () => ({
          digest: () => 'test-hmac',
        }),
      }),
    };
    
    // Setup test timers
    global.testTimers = {
      start: Date.now(),
      checkpoints: {},
    };
    
    // Mark checkpoint
    global.testTimers.checkpoints.setup = Date.now();
    
    console.log('✅ JWT Bridge Test Environment Setup Complete!');
    console.log(`⏱️  Setup completed in ${Date.now() - global.testTimers.start}ms`);
    
    // Validate setup
    const requiredEnvVars = [
      'NODE_ENV',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'STACK_AUTH_PROJECT_ID',
      'JWT_SECRET',
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
    
    console.log('🎯 All required environment variables are set');
    console.log('🧪 Test environment is ready for JWT Bridge testing');
    
  } catch (error) {
    console.error('❌ Failed to setup test environment:', error);
    process.exit(1);
  }
};