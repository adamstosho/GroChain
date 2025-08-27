import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protect dashboard routes using the auth_token cookie set by backend
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = pathname.startsWith('/dashboard')
  if (!isProtected) return NextResponse.next()

  const authCookie = request.cookies.get('auth_token')?.value
  if (!authCookie) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}




