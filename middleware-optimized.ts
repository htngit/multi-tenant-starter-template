/**
 * Enhanced middleware for Supabase SSR with performance optimization
 * Features:
 * - Supabase session management
 * - Performance monitoring
 * - Cache headers optimization
 * - Request/response logging
 * - Error handling
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { performanceMonitor } from './lib/performance';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/api/trpc',
];

// Routes that should be cached
const cacheableRoutes = [
  '/api/trpc/inventory.getProducts',
  '/api/trpc/inventory.getSummary',
];

// Public routes that don't need auth
const publicRoutes = [
  '/',
  '/auth',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
];

/**
 * Check if route requires authentication
 */
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.startsWith(route));
}

/**
 * Check if route is public
 */
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => pathname === route || pathname.startsWith(route));
}

/**
 * Check if route should be cached
 */
function isCacheableRoute(pathname: string): boolean {
  return cacheableRoutes.some(route => pathname.includes(route));
}

/**
 * Set cache headers for responses
 */
function setCacheHeaders(response: NextResponse, pathname: string): void {
  if (isCacheableRoute(pathname)) {
    // Cache API responses for 2 minutes
    response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=120');
    response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=120');
  } else if (pathname.startsWith('/dashboard')) {
    // Don't cache dashboard pages
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  } else if (isPublicRoute(pathname)) {
    // Cache public pages for 1 hour
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  }
}

/**
 * Add security headers
 */
function setSecurityHeaders(response: NextResponse): void {
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // CSP header for enhanced security
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' blob: data: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://va.vercel-scripts.com",
    "frame-src 'none'",
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', cspHeader);
}

/**
 * Log request for monitoring
 */
function logRequest(request: NextRequest, startTime: number): void {
  const duration = Date.now() - startTime;
  const { pathname, search } = request.nextUrl;
  const method = request.method;
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  
  // Log to performance monitor
  performanceMonitor.recordMetric({
    type: 'request',
    name: `${method} ${pathname}`,
    duration,
    metadata: {
      pathname,
      search,
      method,
      userAgent: userAgent.substring(0, 100), // Truncate long user agents
      ip,
      timestamp: new Date().toISOString(),
    },
  });
  
  // Console log for development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${new Date().toISOString()}] ${method} ${pathname}${search} - ${duration}ms - ${ip}`);
  }
}

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const { pathname } = request.nextUrl;
  
  try {
    // Create Supabase client
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    );
    
    // Refresh session if expired
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error in middleware:', sessionError);
      
      // If it's a protected route and there's a session error, redirect to login
      if (isProtectedRoute(pathname)) {
        const redirectUrl = new URL('/auth/login', request.url);
        redirectUrl.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(redirectUrl);
      }
    }
    
    // Handle protected routes
    if (isProtectedRoute(pathname)) {
      if (!session) {
        const redirectUrl = new URL('/auth/login', request.url);
        redirectUrl.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(redirectUrl);
      }
      
      // Add user context to headers for downstream processing
      response.headers.set('x-user-id', session.user.id);
      response.headers.set('x-user-email', session.user.email || '');
    }
    
    // Handle authenticated users accessing auth pages
    if (session && (pathname.startsWith('/auth') || pathname === '/login' || pathname === '/signup')) {
      const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/dashboard';
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    
    // Set cache headers
    setCacheHeaders(response, pathname);
    
    // Set security headers
    setSecurityHeaders(response);
    
    // Add performance headers
    const processingTime = Date.now() - startTime;
    response.headers.set('X-Response-Time', `${processingTime}ms`);
    response.headers.set('X-Powered-By', 'XalesIn ERP');
    
    // Log request
    logRequest(request, startTime);
    
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    
    // Log error
    performanceMonitor.recordMetric({
      type: 'error',
      name: 'middleware_error',
      duration: Date.now() - startTime,
      metadata: {
        pathname,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
    });
    
    // For protected routes, redirect to login on error
    if (isProtectedRoute(pathname)) {
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      redirectUrl.searchParams.set('error', 'session_error');
      return NextResponse.redirect(redirectUrl);
    }
    
    // For other routes, continue with basic response
    const response = NextResponse.next();
    setSecurityHeaders(response);
    return response;
  }
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};