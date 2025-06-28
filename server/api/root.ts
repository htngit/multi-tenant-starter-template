/**
 * Root tRPC Router for XalesIn ERP
 * 
 * This file combines all feature routers into a single app router.
 * It serves as the main entry point for all tRPC API endpoints.
 * 
 * Architecture:
 * - Auth Router: Authentication and user management
 * - Inventory Router: Product and inventory management
 * - Financial Router: Accounting and financial operations
 * - Reports Router: Business intelligence and reporting
 * - Admin Router: System administration
 * 
 * @author XalesIn ERP Team
 * @version 1.0.0
 */

import { createTRPCRouter } from '../../lib/trpc'
import { authRouter } from './routers/auth'
import { inventoryRouter } from './routers/inventory'
import { financialRouter } from './routers/financial'
import { reportsRouter } from './routers/reports'
import { adminRouter } from './routers/admin'
import { tenantRouter } from './routers/tenant'
import { usersRouter } from './routers/users'
import { permissionsRouter } from './routers/permissions'

/**
 * Main application router
 * 
 * This is the primary router for the tRPC API.
 * All feature routers are mounted here.
 */
export const appRouter = createTRPCRouter({
  // Authentication and authorization
  auth: authRouter,
  
  // User management
  users: usersRouter,
  
  // Tenant/organization management
  tenant: tenantRouter,
  
  // Permission and role management
  permissions: permissionsRouter,
  
  // Core business modules
  inventory: inventoryRouter,
  financial: financialRouter,
  
  // Analytics and reporting
  reports: reportsRouter,
  
  // System administration
  admin: adminRouter,
})

/**
 * Export type definition of API
 * This is used by the client to get type safety
 */
export type AppRouter = typeof appRouter

/**
 * Export router for use in other parts of the application
 */
export { appRouter as default }