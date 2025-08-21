import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
    const resp = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'include'
    })
    const data = await resp.json().catch(() => ({}))
    if (resp.ok && (data.status === 'success')) {
      const token = data.accessToken || data.data?.accessToken
      const response = NextResponse.json(data)
      if (token) {
        response.cookies.set('auth_token', token, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          maxAge: 60 * 60 * 24,
        })
      }
      return response
    }
    return NextResponse.json(data, { status: resp.status || 400 })
  } catch (e) {
    return NextResponse.json({ status: 'error', message: 'Login failed' }, { status: 500 })
  }
}






