import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ status: "success" })
  response.cookies.set("auth_token", "", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  })
  return response
}


