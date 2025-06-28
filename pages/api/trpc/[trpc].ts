/**
 * tRPC API Handler for Next.js
 * 
 * This file handles all tRPC API requests in the Next.js application.
 * It integrates with Stack Auth for authentication and Supabase for data operations.
 * 
 * Route: /api/trpc/[...trpc]
 * 
 * @author XalesIn ERP Team
 * @version 1.0.0
 */

import { createNextApiHandler } from '@trpc/server/adapters/next'
import { env } from '../../../env.mjs'
import { appRouter } from '../../../server/api/root'
import { createTRPCContext } from '../../../lib/trpc'

// Export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    env.NODE_ENV === 'development'
      ? ({ path, error }) => {
          console.error(
            `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`
          )
        }
      : undefined,
})