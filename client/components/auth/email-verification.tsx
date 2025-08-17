"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/Alert"
import { Mail, CheckCircle2, AlertCircle, Loader2, RefreshCw, Leaf, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { api } from "@/lib/api"
import { RegistrationErrorBoundary } from "@/components/auth/registration-error-boundary"
import { AuthLayout } from "@/components/auth/auth-layout"

interface EmailVerificationProps {
  email?: string
  isResend?: boolean
}

function EmailVerificationContent({ email: propEmail, isResend = false }: EmailVerificationProps) {
  const [verificationCode, setVerificationCode] = useState("")
  const [email, setEmail] = useState(propEmail || "")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const [countdown, setCountdown] = useState(0)

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get email from URL params if not provided as prop
    const emailParam = searchParams.get('email')
    if (emailParam && !propEmail) {
      setEmail(emailParam)
    }

    // Start countdown for resend button
    if (isResend) {
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [searchParams, propEmail, isResend])

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!verificationCode.trim()) {
      setError("Please enter the verification code")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await api.verifyEmail({ token: verificationCode })
      
      if (response.success) {
        setIsSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login?verified=true")
        }, 3000)
      } else {
        setError(response.error || "Verification failed. Please try again.")
      }
    } catch (error) {
      console.error("Verification error:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!email.trim()) {
      setError("Please enter your email address")
      return
    }

    setIsResending(true)
    setError("")

    try {
      const response = await api.resendVerificationEmail({ email: email.trim().toLowerCase() })
      
      if (response.success) {
        setCountdown(60)
        // Start countdown
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setError(response.error || "Failed to resend verification email. Please try again.")
      }
    } catch (error) {
      console.error("Resend error:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsResending(false)
    }
  }

  if (isSuccess) {
    return (
      <AuthLayout 
        title="Email Verified Successfully!"
        subtitle="Your account has been verified. You can now sign in."
        showFeatures={false}
      >
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Email Verified!</h2>
            <p className="text-muted-foreground mb-4">
              Your email address has been successfully verified. You will be redirected to the login page shortly.
            </p>
            <div className="space-y-3">
              <Link href="/login">
                <Button className="w-full">
                  Continue to Login
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground">
                Redirecting automatically in a few seconds...
              </p>
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout 
      title={isResend ? "Resend Verification Email" : "Verify Your Email"}
      subtitle={isResend 
        ? "Enter your email to receive a new verification code"
        : "We've sent a verification code to your email address"
      }
      showFeatures={!isResend}
    >
      <Card>
        <CardHeader className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>

          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>

          <CardTitle className="text-2xl font-heading">
            {isResend ? "Resend Verification" : "Verify Your Email"}
          </CardTitle>
          <p className="text-muted-foreground">
            {isResend 
              ? "Enter your email address below to receive a new verification code"
              : "Please check your email and enter the verification code below"
            }
          </p>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isResend ? (
            <form onSubmit={handleResendVerification} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isResending}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isResending || countdown > 0}>
                {isResending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : countdown > 0 ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend in {countdown}s
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Resend Verification Code
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerification} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground text-center">
                  Enter the 6-digit code sent to {email}
                </p>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Need help?
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {!isResend && (
                <Button 
                  variant="outline" 
                  onClick={() => router.push("/verify-email?resend=true")}
                  className="w-full"
                  disabled={countdown > 0}
                >
                  {countdown > 0 ? (
                    `Resend in ${countdown}s`
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resend Verification Code
                    </>
                  )}
                </Button>
              )}

              <Link href="/login">
                <Button variant="ghost" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}

// Wrapped with Error Boundary
export function EmailVerification({ email, isResend }: EmailVerificationProps) {
  return (
    <RegistrationErrorBoundary>
      <EmailVerificationContent email={email} isResend={isResend} />
    </RegistrationErrorBoundary>
  )
}
