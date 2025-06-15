import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Get the protocol from X-Forwarded-Proto header or request protocol
  const protocol =
    request.headers.get('x-forwarded-proto') || request.nextUrl.protocol
  // Get the host from X-Forwarded-Host header or request host
  const host =
    request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
  // Construct the base URL - ensure protocol has :// format
  const baseUrl = `${protocol}${protocol.endsWith(':') ? '//' : '://'}${host}`

  // Create a response
  let response: NextResponse

  // Handle Supabase session if configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseAnonKey) {
    response = await updateSession(request)

    // Check authentication for protected routes
    // Allow access to auth pages and public assets without auth check
    if (
      !pathname.startsWith('/auth/') &&
      !pathname.startsWith('/_next/') &&
      !pathname.startsWith('/api/') &&
      pathname !== '/favicon.ico' &&
      !pathname.startsWith('/images/') &&
      !pathname.startsWith('/static/')
    ) {
      // Create Supabase client to check user authentication
      const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value
            },
            set(name: string, value: string, options: any) {
              // Don't modify cookies here as updateSession already handles it
            },
            remove(name: string, options: any) {
              // Don't modify cookies here as updateSession already handles it
            },
          },
        }
      )

      const {
        data: { user },
      } = await supabase.auth.getUser()

      // If no user, check search attempts and handle free trial
      if (!user) {
        // Get current search count from cookies
        const searchCount = parseInt(request.cookies.get('free_searches')?.value || '0')
        
        // Check if this is a search request (add your search detection logic here)
        // This could be a POST to /api/search, or a specific query parameter, etc.
        const isSearchRequest = 
          request.method === 'POST' && pathname.startsWith('/api/') ||
          searchParams.has('q') ||
          pathname.includes('/search')

        if (isSearchRequest) {
          // If user has already used their 2 free searches, redirect to login
          if (searchCount >= 10) {
            const loginUrl = new URL('/auth/login', request.url)
            return NextResponse.redirect(loginUrl)
          }
          
          // Increment search count
          const newSearchCount = searchCount + 1
          response.cookies.set('free_searches', newSearchCount.toString(), {
            maxAge: 60 * 60 * 24 * 7, // 7 days
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          })
        } else {
          // For non-search requests, allow access to main pages but not other protected features
          // You can add more specific route protection here if needed
        }
      }
    }
  } else {
    // If Supabase is not configured, just pass the request through
    response = NextResponse.next({
      request
    })
  }

  // Add request information to response headers
  response.headers.set('x-url', request.url)
  response.headers.set('x-host', host)
  response.headers.set('x-protocol', protocol)
  response.headers.set('x-base-url', baseUrl)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}