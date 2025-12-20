import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Public routes - accessible without authentication
  const publicRoutes = ['/portal', '/portal/prihlaseni', '/portal/reset-hesla', '/portal/onboarding']
  const isPublicRoute = publicRoutes.includes(path)

  // Portal routes (excluding public routes)
  const isPortalRoute = path.startsWith('/portal')

  // If it's a public route, allow access
  if (isPublicRoute) {
    // If user is already logged in and tries to access login page, redirect to dashboard
    if (user && path === '/portal/prihlaseni') {
      return NextResponse.redirect(new URL('/portal/dashboard', request.url))
    }
    return response
  }

  // If it's a portal route and user is not authenticated, redirect to login
  if (isPortalRoute && !user) {
    const redirectUrl = new URL('/portal/prihlaseni', request.url)
    // Store the original URL to redirect back after login
    redirectUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(redirectUrl)
  }

  // User is authenticated - let them through
  // Role checking is handled in the respective layouts (e.g., admin layout)
  return response
}

export const config = {
  matcher: ['/portal/:path*'],
}
