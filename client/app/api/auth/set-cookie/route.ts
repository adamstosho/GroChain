import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { token, maxAge } = await request.json().catch(() => ({ token: null }))
    if (!token || typeof token !== "string") {
      return NextResponse.json({ status: "error", message: "Missing token" }, { status: 400 })
    }

    const response = NextResponse.json({ status: "success" })
    response.cookies.set("auth_token", token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: typeof maxAge === "number" ? maxAge : 60 * 60 * 24,
    })
    return response
  } catch (error) {
    return NextResponse.json({ status: "error", message: "Failed to set cookie" }, { status: 500 })
  }
}


