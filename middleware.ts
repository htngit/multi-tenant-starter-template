/**
 * Next.js Middleware for XalesIn ERP
 * 
 * This middleware handles:
 * - Authentication validation via Stack Auth
 * - Route protection based on user permissions
 * - Tenant context injection
 * - Request/response processing with Supabase
 * 
 * @author XalesIn ERP Team
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from './lib/supabase'
import { stackServerApp } from './lib/stack-auth'

/**
 * Protected routes that require authentication
 */
const PROTECTED_ROUTES = [
  '/dashboard',
  '/api/inventory',
  '/api/financial',
  '/api/documents',
  '/api/parties',
  '/api/sales',
  '/api/purchasing',
  '/api/reports',
]

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  '/',
  '/auth',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/pricing',
  '/features',
  '/contact',
  '/privacy',
  '/terms',
]

/**
 * API routes that require special handling
 */
const API_ROUTES = {
  AUTH: '/api/auth',
  WEBHOOK: '/api/webhook',
  HEALTH: '/api/health',
}

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { supabase, response } = createMiddlewareClient(request)

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/assets') ||
    pathname.includes('.')
  ) {
    return response
  }

  // Handle health check endpoint
  if (pathname === API_ROUTES.HEALTH) {
    return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
  }

  // Handle webhook endpoints (no auth required)
  if (pathname.startsWith(API_ROUTES.WEBHOOK)) {
    return response
  }

  // Check if route requires authentication
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  )
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route)
  )

  try {
    // Get user from Stack Auth
    const user = await stackServerApp.getUser()
    
    // Handle unauthenticated users
    if (!user) {
      if (isProtectedRoute) {
        // Redirect to login for protected routes
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }
      
      // Allow access to public routes
      if (isPublicRoute) {
        return response
      }
      
      // For API routes, return 401
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
      
      return response
    }

    // User is authenticated
    const selectedTeam = user.selectedTeam
    
    // Check if user has selected a tenant/team
    if (!selectedTeam && isProtectedRoute) {
      // Redirect to team selection if no team is selected
      const teamSelectUrl = new URL('/dashboard/select-team', request.url)
      return NextResponse.redirect(teamSelectUrl)
    }

    // Add user context to request headers for downstream consumption
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', user.id)
    requestHeaders.set('x-user-email', user.primaryEmail || '')
    
    if (selectedTeam) {
      requestHeaders.set('x-tenant-id', selectedTeam.id)
      requestHeaders.set('x-tenant-name', selectedTeam.displayName)
    }

    // Handle API routes with authentication
    if (pathname.startsWith('/api/')) {
      return handleApiRoute(request, response, user, selectedTeam, requestHeaders)
    }

    // Handle dashboard routes
    if (pathname.startsWith('/dashboard')) {
      return handleDashboardRoute(request, response, user, selectedTeam, requestHeaders)
    }

    // For authenticated users accessing public routes, allow access
    const modifiedResponse = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    return modifiedResponse

  } catch (error) {
    console.error('Middleware error:', error)
    
    // For API routes, return error response
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
    
    // For other routes, redirect to error page or allow access
    if (isPublicRoute) {
      return response
    }
    
    const errorUrl = new URL('/error', request.url)
    return NextResponse.redirect(errorUrl)
  }
}

/**
 * Handle API route authentication and authorization
 */
async function handleApiRoute(
  request: NextRequest,
  response: NextResponse,
  user: any,
  selectedTeam: any,
  requestHeaders: Headers
) {
  const { pathname } = request.nextUrl

  // Skip auth routes
  if (pathname.startsWith(API_ROUTES.AUTH)) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Check tenant requirement for business API routes
  const requiresTenant = [
    '/api/inventory',
    '/api/financial',
    '/api/documents',
    '/api/parties',
    '/api/sales',
    '/api/purchasing',
    '/api/reports',
  ].some(route => pathname.startsWith(route))

  if (requiresTenant && !selectedTeam) {
    return NextResponse.json(
      { error: 'Tenant selection required' },
      { status: 400 }
    )
  }

  // TODO: Add permission-based authorization here
  // Example:
  // const requiredPermission = getRequiredPermission(pathname, request.method)
  // if (requiredPermission && !hasPermission(user, selectedTeam, requiredPermission)) {
  //   return NextResponse.json(
  //     { error: 'Insufficient permissions' },
  //     { status: 403 }
  //   )
  // }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

/**
 * Handle dashboard route authentication and authorization
 */
async function handleDashboardRoute(
  request: NextRequest,
  response: NextResponse,
  user: any,
  selectedTeam: any,
  requestHeaders: Headers
) {
  const { pathname } = request.nextUrl

  // Handle team-specific dashboard routes
  if (pathname.includes('/dashboard/') && pathname.split('/').length > 2) {
    const pathSegments = pathname.split('/')
    const teamIdFromPath = pathSegments[2]
    
    // Verify user has access to the requested team
    if (selectedTeam && selectedTeam.id !== teamIdFromPath) {
      // Check if user is member of the requested team
      const userTeams = user.teams || []
      const hasAccess = userTeams.some((team: any) => team.id === teamIdFromPath)
      
      if (!hasAccess) {
        // Redirect to user's current team dashboard
        const redirectUrl = new URL(`/dashboard/${selectedTeam.id}`, request.url)
        return NextResponse.redirect(redirectUrl)
      }
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

/**
 * Get required permission for a specific API route and method
 */
function getRequiredPermission(pathname: string, method: string): string | null {
  // Define permission mapping for API routes
  const permissionMap: Record<string, Record<string, string>> = {
    '/api/inventory': {
      GET: 'inventory:read',
      POST: 'inventory:write',
      PUT: 'inventory:write',
      PATCH: 'inventory:write',
      DELETE: 'inventory:delete',
    },
    '/api/financial': {
      GET: 'financial:read',
      POST: 'financial:write',
      PUT: 'financial:write',
      PATCH: 'financial:write',
      DELETE: 'financial:delete',
    },
    '/api/documents': {
      GET: 'document:read',
      POST: 'document:write',
      PUT: 'document:write',
      PATCH: 'document:write',
      DELETE: 'document:delete',
    },
    '/api/parties': {
      GET: 'party:read',
      POST: 'party:write',
      PUT: 'party:write',
      PATCH: 'party:write',
      DELETE: 'party:delete',
    },
    '/api/sales': {
      GET: 'sales:read',
      POST: 'sales:write',
      PUT: 'sales:write',
      PATCH: 'sales:write',
      DELETE: 'sales:delete',
    },
    '/api/purchasing': {
      GET: 'purchasing:read',
      POST: 'purchasing:write',
      PUT: 'purchasing:write',
      PATCH: 'purchasing:write',
      DELETE: 'purchasing:delete',
    },
    '/api/reports': {
      GET: 'reporting:read',
      POST: 'reporting:write',
      PUT: 'reporting:write',
      PATCH: 'reporting:write',
      DELETE: 'reporting:delete',
    },
  }

  // Find matching route
  for (const [route, methods] of Object.entries(permissionMap)) {
    if (pathname.startsWith(route)) {
      return methods[method] || null
    }
  }

  return null
}

/**
 * Middleware configuration
 */
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
}