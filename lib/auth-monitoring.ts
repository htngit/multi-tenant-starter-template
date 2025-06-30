/**
 * Stack Auth Monitoring and Error Tracking Utility
 * 
 * This utility provides comprehensive monitoring for Stack Auth token errors
 * and helps track authentication issues for debugging and optimization.
 */

interface AuthErrorMetrics {
  timestamp: string
  errorType: 'token_error' | 'auth_failure' | 'session_expired' | 'unknown'
  errorMessage: string
  pathname: string
  userAgent?: string
  hasAuthCookies: boolean
  stackAuthConfig: {
    hasProjectId: boolean
    hasSecretKey: boolean
    hasPublishableKey: boolean
    apiUrl?: string
  }
}

class AuthMonitor {
  private static instance: AuthMonitor
  private errorCount: number = 0
  private lastErrors: AuthErrorMetrics[] = []
  private readonly maxStoredErrors = 10

  private constructor() {}

  static getInstance(): AuthMonitor {
    if (!AuthMonitor.instance) {
      AuthMonitor.instance = new AuthMonitor()
    }
    return AuthMonitor.instance
  }

  /**
   * Log an authentication error with comprehensive context
   */
  logAuthError(error: any, request: Request, pathname: string): void {
    this.errorCount++
    
    const errorType = this.categorizeError(error)
    const metrics: AuthErrorMetrics = {
      timestamp: new Date().toISOString(),
      errorType,
      errorMessage: error?.message || 'Unknown error',
      pathname,
      userAgent: request.headers.get('user-agent')?.substring(0, 100),
      hasAuthCookies: this.hasAuthCookies(request),
      stackAuthConfig: {
        hasProjectId: !!process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
        hasSecretKey: !!process.env.STACK_SECRET_SERVER_KEY,
        hasPublishableKey: !!process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
        apiUrl: process.env.NEXT_PUBLIC_STACK_API_URL
      }
    }

    // Store error for analysis
    this.lastErrors.unshift(metrics)
    if (this.lastErrors.length > this.maxStoredErrors) {
      this.lastErrors.pop()
    }

    // Log with appropriate severity
    if (errorType === 'token_error') {
      console.error('🚨 [AUTH-MONITOR] Critical Token Error:', metrics)
    } else {
      console.warn('⚠️ [AUTH-MONITOR] Auth Error:', metrics)
    }

    // In development, provide additional debugging info
    if (process.env.NODE_ENV === 'development') {
      this.logDebugInfo()
    }
  }

  /**
   * Categorize the error type for better tracking
   */
  private categorizeError(error: any): AuthErrorMetrics['errorType'] {
    const message = error?.message?.toLowerCase() || ''
    
    if (message.includes('accesstoken') || message.includes('token')) {
      return 'token_error'
    }
    if (message.includes('session') || message.includes('expired')) {
      return 'session_expired'
    }
    if (message.includes('auth') || message.includes('unauthorized')) {
      return 'auth_failure'
    }
    
    return 'unknown'
  }

  /**
   * Check if request has authentication cookies
   */
  private hasAuthCookies(request: Request): boolean {
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) return false
    
    return cookieHeader.includes('stack-') || 
           cookieHeader.includes('auth') || 
           cookieHeader.includes('session')
  }

  /**
   * Log debugging information in development
   */
  private logDebugInfo(): void {
    console.group('🔍 [AUTH-MONITOR] Debug Info')
    console.log('Total Errors:', this.errorCount)
    console.log('Recent Error Types:', this.getErrorTypeCounts())
    console.log('Environment Check:', {
      nodeEnv: process.env.NODE_ENV,
      stackProjectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID ? 'Present' : 'Missing',
      stackSecretKey: process.env.STACK_SECRET_SERVER_KEY ? 'Present' : 'Missing',
      stackPublishableKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY ? 'Present' : 'Missing'
    })
    console.groupEnd()
  }

  /**
   * Get count of error types for analysis
   */
  private getErrorTypeCounts(): Record<string, number> {
    return this.lastErrors.reduce((counts, error) => {
      counts[error.errorType] = (counts[error.errorType] || 0) + 1
      return counts
    }, {} as Record<string, number>)
  }

  /**
   * Get monitoring statistics
   */
  getStats(): {
    totalErrors: number
    recentErrors: AuthErrorMetrics[]
    errorTypeCounts: Record<string, number>
  } {
    return {
      totalErrors: this.errorCount,
      recentErrors: [...this.lastErrors],
      errorTypeCounts: this.getErrorTypeCounts()
    }
  }

  /**
   * Check if there's a pattern of token errors (potential SDK issue)
   */
  hasTokenErrorPattern(): boolean {
    const recentTokenErrors = this.lastErrors
      .filter(error => error.errorType === 'token_error')
      .slice(0, 5) // Check last 5 errors
    
    return recentTokenErrors.length >= 3
  }

  /**
   * Get recommendations based on error patterns
   */
  getRecommendations(): string[] {
    const recommendations: string[] = []
    const stats = this.getStats()
    
    if (this.hasTokenErrorPattern()) {
      recommendations.push('Consider updating Stack Auth SDK to latest version')
      recommendations.push('Check for Stack Auth SDK compatibility issues')
    }
    
    if (stats.errorTypeCounts.session_expired > 2) {
      recommendations.push('Review session timeout configuration')
      recommendations.push('Implement automatic token refresh')
    }
    
    if (stats.errorTypeCounts.auth_failure > 2) {
      recommendations.push('Verify Stack Auth environment variables')
      recommendations.push('Check Stack Auth project configuration')
    }
    
    return recommendations
  }
}

// Export singleton instance
export const authMonitor = AuthMonitor.getInstance()

// Export types for external use
export type { AuthErrorMetrics }