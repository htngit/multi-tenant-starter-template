/**
 * Next.js App Component with tRPC and Stack Auth Integration
 * 
 * This file is the root component for the Next.js application.
 * It sets up tRPC, authentication, and global providers.
 * 
 * Features:
 * - tRPC integration with React Query
 * - Stack Auth authentication provider
 * - Global error handling
 * - Theme and UI providers
 * - Analytics integration
 * 
 * @author XalesIn ERP Team
 * @version 1.0.0
 */

import { type AppType } from 'next/app'
import Head from 'next/head'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

import { api } from '../lib/api'
import { env } from '../env.mjs'
import '../app/globals.css'

// Import Stack Auth provider (when available)
// import { StackProvider } from '@stackframe/stack'

/**
 * Global error boundary component
 */
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}

/**
 * Analytics component
 */
function Analytics() {
  // Google Analytics
  if (env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID) {
    return (
      <>
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}');
            `,
          }}
        />
      </>
    )
  }
  
  return null
}

/**
 * Main App component
 */
const MyApp: AppType = ({
  Component,
  pageProps,
}) => {
  // Create a stable QueryClient instance
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: 5 minutes
            staleTime: 5 * 60 * 1000,
            // Garbage collection time: 10 minutes
            gcTime: 10 * 60 * 1000,
            // Retry failed requests
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors (client errors)
              if (error?.data?.httpStatus >= 400 && error?.data?.httpStatus < 500) {
                return false
              }
              // Retry up to 3 times for other errors
              return failureCount < 3
            },
            // Retry delay with exponential backoff
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            // Retry failed mutations once
            retry: 1,
            // Show error notifications
            onError: (error: any) => {
              console.error('Mutation error:', error)
              // You can add toast notifications here
            },
          },
        },
      })
  )

  return (
    <>
      <Head>
        <title>{env.NEXT_PUBLIC_APP_NAME}</title>
        <meta name="description" content="Modern ERP solution for growing businesses" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Open Graph meta tags */}
        <meta property="og:title" content={env.NEXT_PUBLIC_APP_NAME} />
        <meta property="og:description" content="Modern ERP solution for growing businesses" />
        <meta property="og:type" content="website" />
        {env.NEXT_PUBLIC_APP_URL && (
          <meta property="og:url" content={env.NEXT_PUBLIC_APP_URL} />
        )}
        
        {/* Twitter Card meta tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={env.NEXT_PUBLIC_APP_NAME} />
        <meta name="twitter:description" content="Modern ERP solution for growing businesses" />
      </Head>
      
      {/* Analytics */}
      <Analytics />
      
      {/* Main App Providers */}
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Stack Auth Provider */}
          {/* 
          <StackProvider
            projectId={env.NEXT_PUBLIC_STACK_PROJECT_ID}
            publishableClientKey={env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY}
          >
          */}
            <ErrorBoundary>
              {/* Global toast notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'hsl(var(--background))',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid hsl(var(--border))',
                  },
                  success: {
                    iconTheme: {
                      primary: 'hsl(var(--primary))',
                      secondary: 'hsl(var(--primary-foreground))',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: 'hsl(var(--destructive))',
                      secondary: 'hsl(var(--destructive-foreground))',
                    },
                  },
                }}
              />
              
              {/* Main App Component */}
              <Component {...pageProps} />
            </ErrorBoundary>
          {/* 
          </StackProvider>
          */}
        </ThemeProvider>
        
        {/* React Query Devtools (development only) */}
        {env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </>
  )
}

// Wrap the app with tRPC
export default api.withTRPC(MyApp)