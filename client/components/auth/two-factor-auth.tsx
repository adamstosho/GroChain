"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/Alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/Checkbox"
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  RefreshCw,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { RegistrationErrorBoundary } from "@/components/auth/registration-error-boundary"
import { AuthLayout } from "@/components/auth/auth-layout"

interface TwoFactorAuthProps {
  onSuccess?: () => void
  onCancel?: () => void
  isSetup?: boolean
}

type TwoFactorMethod = "sms" | "email"
type TwoFactorStep = "method" | "verification" | "success"

function TwoFactorAuthContent({ onSuccess, onCancel, isSetup = false }: TwoFactorAuthProps) {
  const [step, setStep] = useState<TwoFactorStep>("method")
  const [method, setMethod] = useState<TwoFactorMethod>("sms")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [error, setError] = useState("")
  const [countdown, setCountdown] = useState(0)
  const [rememberDevice, setRememberDevice] = useState(false)

  const router = useRouter()

  useEffect(() => {
    if (countdown > 0) {
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
  }, [countdown])

  const handleSendOtp = async () => {
    if (method === "sms" && !phoneNumber.trim()) {
      setError("Please enter your phone number")
      return
    }
    if (method === "email" && !email.trim()) {
      setError("Please enter your email address")
      return
    }

    setIsSendingOtp(true)
    setError("")

    try {
      let response
      if (method === "sms") {
        response = await api.sendSmsOtp(phoneNumber.trim())
      } else {
        // For email OTP, we'll use the resend verification endpoint
        response = await api.resendVerificationEmail({ email: email.trim().toLowerCase() })
      }
      
      if (response.success) {
        setStep("verification")
        setCountdown(60)
      } else {
        setError(response.error || "Failed to send verification code. Please try again.")
      }
    } catch (error) {
      console.error("Send OTP error:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError("Please enter the verification code")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      let response
      if (method === "sms") {
        response = await api.verifySmsOtp(phoneNumber.trim(), otp.trim())
      } else {
        // For email verification, we'll use the verify email endpoint
        response = await api.verifyEmail({ token: otp.trim() })
      }
      
      if (response.success) {
        setStep("success")
        if (onSuccess) {
          onSuccess()
        }
      } else {
        setError(response.error || "Verification failed. Please try again.")
      }
    } catch (error) {
      console.error("Verify OTP error:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = () => {
    setOtp("")
    setError("")
    handleSendOtp()
  }

  if (step === "success") {
    return (
      <AuthLayout 
        title="Two-Factor Authentication Enabled!"
        subtitle="Your account is now protected with an additional layer of security"
        showFeatures={false}
      >
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">2FA Enabled Successfully!</h2>
            <p className="text-muted-foreground mb-4">
              Your two-factor authentication has been set up successfully. 
              {rememberDevice && " This device will be remembered for 30 days."}
            </p>
            <div className="space-y-3">
              <Button onClick={() => router.push("/dashboard")} className="w-full">
                Continue to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    )
  }

  if (step === "verification") {
    return (
      <AuthLayout 
        title="Enter Verification Code"
        subtitle={`We've sent a verification code to your ${method === "sms" ? "phone" : "email"}`}
        showFeatures={false}
      >
        <Card>
          <CardHeader className="text-center">
            <Button
              variant="ghost"
              onClick={() => setStep("method")}
              className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>

            <CardTitle className="text-2xl font-heading">Enter Verification Code</CardTitle>
            <p className="text-muted-foreground">
              We've sent a 6-digit code to {method === "sms" ? phoneNumber : email}
            </p>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleVerifyOtp(); }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Enable 2FA"
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Didn't receive the code?
                  </span>
                </div>
              </div>

              <Button 
                variant="outline" 
                onClick={handleResendOtp}
                className="w-full"
                disabled={countdown > 0}
              >
                {countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend Code
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout 
      title="Set Up Two-Factor Authentication"
      subtitle="Add an extra layer of security to your account"
    >
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>

          <CardTitle className="text-2xl font-heading">Two-Factor Authentication</CardTitle>
          <p className="text-muted-foreground">
            Choose your preferred verification method to secure your account
          </p>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {/* Method Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Verification Method</Label>
              <RadioGroup value={method} onValueChange={(value) => setMethod(value as TwoFactorMethod)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sms" id="sms" />
                  <Label htmlFor="sms" className="flex items-center space-x-2 cursor-pointer">
                    <Smartphone className="w-4 h-4" />
                    <span>SMS (Text Message)</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email" />
                  <Label htmlFor="email" className="flex items-center space-x-2 cursor-pointer">
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Contact Input */}
            <div className="space-y-2">
              <Label htmlFor="contact">
                {method === "sms" ? "Phone Number" : "Email Address"}
              </Label>
              <Input
                id="contact"
                type={method === "sms" ? "tel" : "email"}
                placeholder={method === "sms" ? "+234 800 000 0000" : "your@email.com"}
                value={method === "sms" ? phoneNumber : email}
                onChange={(e) => method === "sms" ? setPhoneNumber(e.target.value) : setEmail(e.target.value)}
                disabled={isSendingOtp}
              />
            </div>

            {/* Remember Device Option */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberDevice"
                checked={rememberDevice}
                onCheckedChange={(checked) => setRememberDevice(checked as boolean)}
              />
              <Label htmlFor="rememberDevice" className="text-sm cursor-pointer">
                Remember this device for 30 days
              </Label>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleSendOtp} 
                className="w-full" 
                size="lg" 
                disabled={isSendingOtp}
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Send Verification Code
                  </>
                )}
              </Button>

              {onCancel && (
                <Button variant="outline" onClick={onCancel} className="w-full">
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {/* Security Info */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start space-x-2">
              <Shield className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Why Two-Factor Authentication?</p>
                <ul className="space-y-1">
                  <li>• Protects your account even if your password is compromised</li>
                  <li>• Required for sensitive operations and withdrawals</li>
                  <li>• Industry standard security practice</li>
                  <li>• Easy to set up and use</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}

// Wrapped with Error Boundary
export function TwoFactorAuth({ onSuccess, onCancel, isSetup }: TwoFactorAuthProps) {
  return (
    <RegistrationErrorBoundary>
      <TwoFactorAuthContent onSuccess={onSuccess} onCancel={onCancel} isSetup={isSetup} />
    </RegistrationErrorBoundary>
  )
}
