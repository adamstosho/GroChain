import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Temporarily disable middleware to allow client-side auth to work
// TODO: Re-enable middleware once token synchronization is fully implemented
export function middleware(request: NextRequest) {
  // For now, let all requests through and rely on client-side auth checking
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/marketplace/:path*'],
}




