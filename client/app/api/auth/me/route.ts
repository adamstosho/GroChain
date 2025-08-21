import { NextRequest, NextResponse } from "next/server"

// Proxy to backend protected endpoint using Bearer token from Authorization header
export async function GET(request: NextRequest) {
  try {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
    
    // Get the Authorization header from the request
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json({ 
        status: 'error', 
        message: 'No authorization header provided' 
      }, { status: 401 })
    }
    
    // Forward the request to the backend with the Authorization header
    const resp = await fetch(`${base}/api/auth/protected`, {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })
    
    const data = await resp.json().catch(() => ({}))
    
    if (!resp.ok || data.status !== 'success') {
      return NextResponse.json({ 
        status: 'error', 
        message: data.message || `HTTP ${resp.status}` 
      }, { status: resp.status })
    }
    
    return NextResponse.json({ status: 'success', data })
  } catch (e) {
    console.error('Frontend /api/auth/me error:', e)
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to fetch user' 
    }, { status: 500 })
  }
}





