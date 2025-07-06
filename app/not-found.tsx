import Link from 'next/link'

/**
 * Not Found Page
 * 
 * This page is displayed when a route is not found.
 * It does not use any Stack Auth hooks or complex components to avoid build-time errors.
 */

// Force dynamic rendering to prevent build-time errors
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          backgroundColor: '#ffffff'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '2rem'
          }}>
            <h1 style={{
              fontSize: '4rem',
              fontWeight: 'bold',
              color: '#666',
              margin: '0 0 1rem 0'
            }}>404</h1>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '0 0 1rem 0'
            }}>Page Not Found</h2>
            <p style={{
              color: '#666',
              margin: '0 0 2rem 0',
              maxWidth: '400px'
            }}>
              Sorry, we couldn&apos;t find the page you&apos;re looking for.
            </p>
            
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Link href="/" style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                backgroundColor: '#000',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '0.375rem'
              }}>
                Go Home
              </Link>
              
              <Link href="/dashboard" style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                border: '1px solid #ccc',
                color: '#000',
                textDecoration: 'none',
                borderRadius: '0.375rem'
              }}>
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}