import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/harvests',
  '/marketplace/create',
  '/payments',
  '/commissions',
  '/partners',
  '/notifications',
  '/settings',
  '/profile',
  '/ai',
  '/image-recognition',
  '/iot'
]

// Define public routes that should redirect authenticated users
const authRoutes = [
  '/login',
  '/register'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check for token in multiple places to handle both client-side and server-side auth
  let token = request.cookies.get('auth_token')?.value || 
              request.headers.get('authorization')?.replace('Bearer ', '')
  
  // For client-side navigation, we can't access localStorage in middleware
  // So we'll rely on cookies and headers, and let the client-side auth context handle the rest
  // This prevents redirect loops while maintaining security

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Only redirect unauthenticated users to login if we have a token check
  // For client-side navigation, let the auth context handle authentication
  if (isProtectedRoute && !token) {
    // Check if this is a client-side navigation (has _rsc parameter)
    const isClientNavigation = request.nextUrl.searchParams.has('_rsc')
    
    if (!isClientNavigation) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Redirect authenticated users away from auth pages only if we have a token
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Add security headers
  const response = NextResponse.next()
  
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

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
