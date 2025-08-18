import { NextRequest, NextResponse } from "next/server"

// Proxy to backend protected endpoint using Bearer from cookie-based storage if present
export async function GET(request: NextRequest) {
  try {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
    // We store only access token in localStorage on client, but for SSR we may not have it.
    // This endpoint is primarily for client-side calls in the app; it simply forwards cookies.
    const resp = await fetch(`${base}/api/auth/protected`, {
      headers: {
        // If you later store httpOnly access token server-side, attach it here as Authorization
        Accept: 'application/json',
      },
      credentials: 'include',
      cache: 'no-store'
    })
    const data = await resp.json().catch(() => ({}))
    if (!resp.ok || data.status !== 'success') {
      return NextResponse.json({ status: 'error', message: data.message || `HTTP ${resp.status}` }, { status: 401 })
    }
    return NextResponse.json({ status: 'success', data })
  } catch (e) {
    return NextResponse.json({ status: 'error', message: 'Failed to fetch user' }, { status: 500 })
  }
}


