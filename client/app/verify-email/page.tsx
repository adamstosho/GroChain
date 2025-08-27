"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"

export default function VerifyEmailPage() {
  const router = useRouter()
  const params = useSearchParams()
  const { toast } = useToast()
  const [token, setToken] = useState("")
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    const t = params.get("token")
    if (t) setToken(t)
    const e = params.get("email")
    if (e) setEmail(e)
  }, [params])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setSubmitting(true)
    try {
      await api.verifyEmail(token)
      toast({ title: "Email verified", description: "You can now sign in." })
      router.push("/login")
    } catch (err: any) {
      toast({
        title: "Verification failed",
        description: err?.message || "Invalid or expired link.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setResending(true)
    try {
      await api.resendVerification(email)
      toast({ title: "Verification sent", description: "Check your inbox for a new link." })
    } catch (err: any) {
      toast({
        title: "Resend failed",
        description: err?.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <Card>
        <CardHeader>
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>Paste your token or use the link from your email.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleVerify} className="space-y-3">
            <Label htmlFor="token">Verification token</Label>
            <Input id="token" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Token from email" />
            <Button type="submit" disabled={!token || submitting} className="w-full">
              {submitting ? "Verifying..." : "Verify Email"}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">— or —</div>

          <form onSubmit={handleResend} className="space-y-3">
            <Label htmlFor="email">Resend to email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            <Button type="submit" variant="outline" disabled={!email || resending} className="w-full">
              {resending ? "Sending..." : "Resend Verification Link"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


