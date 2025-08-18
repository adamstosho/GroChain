import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/harvests',
  '/marketplace/create',
  '/orders',
  '/payments',
  '/commissions',
  '/partners',
  '/notifications',
  '/analytics',
  '/settings',
  '/profile',
  '/ai',
  '/image-recognition',
  '/iot',
  '/ussd'
]

// Define public routes that should redirect authenticated users
const authRoutes = [
  '/login',
  '/register'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get token from cookies
  const token = request.cookies.get('auth_token')?.value
  
  console.log('🔍 Middleware - Path:', pathname, 'Token:', token ? 'present' : 'missing')
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )

  console.log('🔍 Middleware - Protected route:', isProtectedRoute, 'Auth route:', isAuthRoute)

  // Redirect unauthenticated users to login for protected routes
  if (isProtectedRoute && !token) {
    console.log('🔍 Middleware - Redirecting to login (no token for protected route)')
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages (and avoid loops)
  if (isAuthRoute && token) {
    console.log('🔍 Middleware - Authenticated user on auth page, redirecting')
    // Check if there's a redirect parameter
    const redirect = request.nextUrl.searchParams.get('redirect')
    if (redirect && redirect !== '/login' && redirect !== '/register') {
      console.log('🔍 Middleware - Redirecting to original destination:', redirect)
      return NextResponse.redirect(new URL(redirect, request.url))
    }
    console.log('🔍 Middleware - Redirecting to dashboard')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  console.log('🔍 Middleware - Allowing request to proceed')

  // Create response and add security headers
  const response = NextResponse.next()
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  // If user is authenticated and accessing a protected route, ensure the cookie persists
  if (token && isProtectedRoute) {
    // Refresh the cookie expiration
    response.cookies.set('auth_token', token, {
      path: '/',
      maxAge: 86400, // 24 hours
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    })
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}