/**
 * Test Script for Stack Auth Token Error Fix
 * 
 * This script validates the authentication error handling and monitoring system.
 * Run this script to ensure the fix is working correctly.
 */

import { authMonitor } from '../lib/auth-monitoring'

/**
 * Mock request object for testing
 */
function createMockRequest(options: {
  pathname?: string
  hasAuthCookies?: boolean
  userAgent?: string
} = {}): Request {
  const headers = new Headers()
  
  if (options.hasAuthCookies) {
    headers.set('cookie', 'stack-auth-token=test; session-id=test')
  }
  
  if (options.userAgent) {
    headers.set('user-agent', options.userAgent)
  }
  
  return {
    headers,
    url: `https://example.com${options.pathname || '/dashboard'}`
  } as Request
}

/**
 * Mock error objects for testing
 */
const mockErrors = {
  tokenError: {
    name: 'StackAuthError',
    message: "Cannot use 'in' operator to search for 'accessToken' in undefined",
    stack: 'Error at _getOrCreateTokenStore...'
  },
  sessionError: {
    name: 'SessionError',
    message: 'Session expired or invalid',
    stack: 'Error at validateSession...'
  },
  authError: {
    name: 'AuthError',
    message: 'Authentication failed - invalid credentials',
    stack: 'Error at authenticate...'
  },
  unknownError: {
    name: 'UnknownError',
    message: 'Something went wrong',
    stack: 'Error at unknown...'
  }
}

/**
 * Test suite for authentication error handling
 */
class AuthFixTester {
  private testResults: { name: string; passed: boolean; details?: string }[] = []

  /**
   * Run all tests
   */
  async runAllTests(): Promise<void> {
    console.log('🧪 Starting Stack Auth Fix Tests...\n')
    
    // Test error categorization
    this.testErrorCategorization()
    
    // Test pattern detection
    this.testPatternDetection()
    
    // Test monitoring functionality
    this.testMonitoringFunctionality()
    
    // Test recommendations
    this.testRecommendations()
    
    // Display results
    this.displayResults()
  }

  /**
   * Test error categorization
   */
  private testErrorCategorization(): void {
    console.log('📊 Testing Error Categorization...')
    
    const request = createMockRequest({ pathname: '/dashboard' })
    
    // Test token error
    authMonitor.logAuthError(mockErrors.tokenError, request, '/dashboard')
    
    // Test session error
    authMonitor.logAuthError(mockErrors.sessionError, request, '/profile')
    
    // Test auth error
    authMonitor.logAuthError(mockErrors.authError, request, '/api/users')
    
    // Test unknown error
    authMonitor.logAuthError(mockErrors.unknownError, request, '/settings')
    
    const stats = authMonitor.getStats()
    const hasCorrectCategorization = 
      stats.errorTypeCounts.token_error >= 1 &&
      stats.errorTypeCounts.session_expired >= 1 &&
      stats.errorTypeCounts.auth_failure >= 1 &&
      stats.errorTypeCounts.unknown >= 1
    
    this.testResults.push({
      name: 'Error Categorization',
      passed: hasCorrectCategorization,
      details: `Categories: ${JSON.stringify(stats.errorTypeCounts)}`
    })
  }

  /**
   * Test pattern detection
   */
  private testPatternDetection(): void {
    console.log('🔍 Testing Pattern Detection...')
    
    const request = createMockRequest({ pathname: '/dashboard' })
    
    // Generate multiple token errors to trigger pattern detection
    for (let i = 0; i < 4; i++) {
      authMonitor.logAuthError(mockErrors.tokenError, request, `/test-${i}`)
    }
    
    const hasTokenPattern = authMonitor.hasTokenErrorPattern()
    
    this.testResults.push({
      name: 'Token Error Pattern Detection',
      passed: hasTokenPattern,
      details: `Pattern detected: ${hasTokenPattern}`
    })
  }

  /**
   * Test monitoring functionality
   */
  private testMonitoringFunctionality(): void {
    console.log('📈 Testing Monitoring Functionality...')
    
    const stats = authMonitor.getStats()
    
    const hasValidStats = 
      stats.totalErrors > 0 &&
      stats.recentErrors.length > 0 &&
      Object.keys(stats.errorTypeCounts).length > 0
    
    this.testResults.push({
      name: 'Monitoring Statistics',
      passed: hasValidStats,
      details: `Total errors: ${stats.totalErrors}, Recent: ${stats.recentErrors.length}`
    })
  }

  /**
   * Test recommendations system
   */
  private testRecommendations(): void {
    console.log('💡 Testing Recommendations System...')
    
    const recommendations = authMonitor.getRecommendations()
    
    const hasRecommendations = recommendations.length > 0
    
    this.testResults.push({
      name: 'Recommendations Generation',
      passed: hasRecommendations,
      details: `Generated ${recommendations.length} recommendations`
    })
    
    if (hasRecommendations) {
      console.log('📋 Current Recommendations:')
      recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`)
      })
    }
  }

  /**
   * Display test results
   */
  private displayResults(): void {
    console.log('\n📊 Test Results Summary:')
    console.log('=' .repeat(50))
    
    let passedTests = 0
    
    this.testResults.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL'
      console.log(`${status} ${result.name}`)
      
      if (result.details) {
        console.log(`     ${result.details}`)
      }
      
      if (result.passed) passedTests++
    })
    
    console.log('=' .repeat(50))
    console.log(`Results: ${passedTests}/${this.testResults.length} tests passed`)
    
    if (passedTests === this.testResults.length) {
      console.log('🎉 All tests passed! Stack Auth fix is working correctly.')
    } else {
      console.log('⚠️  Some tests failed. Please review the implementation.')
    }
  }
}

/**
 * Environment validation
 */
function validateEnvironment(): boolean {
  console.log('🔧 Validating Environment Configuration...')
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_STACK_PROJECT_ID',
    'STACK_SECRET_SERVER_KEY',
    'NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY'
  ]
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.log('❌ Missing environment variables:')
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`)
    })
    return false
  }
  
  console.log('✅ All required environment variables are present')
  return true
}

/**
 * Main test execution
 */
async function main(): Promise<void> {
  try {
    console.log('🚀 Stack Auth Token Error Fix - Test Suite')
    console.log('=' .repeat(50))
    
    // Validate environment
    const envValid = validateEnvironment()
    if (!envValid) {
      console.log('\n⚠️  Environment validation failed. Some tests may not work correctly.')
    }
    
    console.log('\n')
    
    // Run tests
    const tester = new AuthFixTester()
    await tester.runAllTests()
    
    console.log('\n🏁 Test suite completed!')
    
  } catch (error) {
    console.error('❌ Test suite failed:', error)
    process.exit(1)
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  main()
}

export { AuthFixTester, validateEnvironment }