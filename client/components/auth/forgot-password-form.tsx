"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/Alert"
import { ArrowLeft, Mail, Loader2, AlertCircle, CheckCircle2, Leaf } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
import { RegistrationErrorBoundary } from "@/components/auth/registration-error-boundary"

interface ForgotPasswordFormData {
  email: string
}

interface ForgotPasswordFormErrors {
  email?: string
  submit?: string
}

function ForgotPasswordFormContent() {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<ForgotPasswordFormErrors>({})
  const [isSuccess, setIsSuccess] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = (name: string, value: string): string | undefined => {
    if (name === "email") {
      if (!value.trim()) return "Email is required"
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "Please enter a valid email address"
      }
    }
    return undefined
  }

  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name as keyof ForgotPasswordFormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }

    // Validate field on blur
    if (touched[name]) {
      const error = validateField(name, value)
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }

  const handleFieldBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    const error = validateField(name, formData[name as keyof ForgotPasswordFormData])
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const validateForm = (): boolean => {
    const newErrors: ForgotPasswordFormErrors = {}
    
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field as keyof ForgotPasswordFormData])
      if (error) {
        newErrors[field as keyof ForgotPasswordFormErrors] = error
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await api.forgotPassword({ email: formData.email.trim().toLowerCase() })
      
      if (response.success) {
        setIsSuccess(true)
        // Log the response for debugging
        console.log("Forgot password response:", response)
      } else {
        setErrors({ submit: response.error || "Failed to send reset link. Please try again." })
      }
    } catch (error) {
      console.error("Forgot password error:", error)
      setErrors({ 
        submit: "Network error. Please check your connection and try again." 
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Check Your Email</h2>
                <p className="text-muted-foreground mb-4">
                  We've sent a password reset link to <strong>{formData.email}</strong>
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-sm text-blue-800">
                  <p className="font-medium mb-2">📧 Email Status:</p>
                  <p>• If you have an account, a reset link has been sent</p>
                  <p>• Check your spam/junk folder if you don't see it</p>
                  <p>• The link expires in 1 hour</p>
                </div>
                <div className="space-y-3">
                  <Link href="/login">
                    <Button className="w-full">
                      Back to Login
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsSuccess(false)}
                    className="w-full"
                  >
                    Send Another Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
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
                  <Leaf className="w-8 h-8 text-primary-foreground" />
                </div>
              </div>

              <CardTitle className="text-2xl font-heading">Forgot Password</CardTitle>
              <p className="text-muted-foreground">
                Enter your email address and we'll send you a link to reset your password
              </p>
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3 text-sm text-yellow-800">
                  <p className="font-medium">🔧 Development Mode</p>
                  <p>Emails are logged to console. Check server logs for password reset links.</p>
                </div>
              )}
            </CardHeader>

            <CardContent>
              {errors.submit && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.submit}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleFieldChange("email", e.target.value)}
                      onBlur={() => handleFieldBlur("email")}
                      className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending Reset Link...
                    </>
                  ) : (
                    "Send Reset Link"
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
                      Remember your password?
                    </span>
                  </div>
                </div>

                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

// Wrapped with Error Boundary
export function ForgotPasswordForm() {
  return (
    <RegistrationErrorBoundary>
      <ForgotPasswordFormContent />
    </RegistrationErrorBoundary>
  )
}
