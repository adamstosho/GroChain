"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/Checkbox"
import { Alert, AlertDescription } from "@/components/ui/Alert"
import { ArrowLeft, Eye, EyeOff, Leaf, ShoppingCart, Building2, Users, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { ErrorBoundary } from "@/components/error-boundary"
import { RegistrationErrorBoundary } from "@/components/auth/registration-error-boundary"
import { RegistrationSuccess } from "@/components/auth/registration-success"
import { PasswordStrengthIndicator } from "@/components/auth/password-strength-indicator"

const roleConfig = {
  farmer: {
    title: "Farmer Registration",
    description: "Join thousands of farmers building trust in Nigerian agriculture",
    icon: Leaf,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950/20",
  },
  buyer: {
    title: "Buyer Registration",
    description: "Access verified products from trusted Nigerian farmers",
    icon: ShoppingCart,
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
  },
  partner: {
    title: "Partner Registration",
    description: "Partner with us to onboard farmers and earn commissions",
    icon: Building2,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
  },
  aggregator: {
    title: "Aggregator Registration",
    description: "Aggregate products from multiple farmers",
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
  },
}

interface RegistrationFormProps {
  role: string
}

interface FormData {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
}

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  password?: string
  confirmPassword?: string
  agreeToTerms?: string
  submit?: string
}

interface ValidationRules {
  [key: string]: {
    required?: boolean
    minLength?: number
    pattern?: RegExp
    custom?: (value: string, formData: FormData) => string | undefined
  }
}

const validationRules: ValidationRules = {
  name: {
    required: true,
    minLength: 2,
    custom: (value) => {
      if (value.trim().length < 2) return "Name must be at least 2 characters"
      if (!/^[a-zA-Z\s]+$/.test(value.trim())) return "Name can only contain letters and spaces"
      return undefined
    }
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value) => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address"
      return undefined
    }
  },
  phone: {
    required: true,
    pattern: /^(\+234|0)[789][01]\d{8}$/,
    custom: (value) => {
      const cleanPhone = value.replace(/\s/g, "")
      if (!/^(\+234|0)[789][01]\d{8}$/.test(cleanPhone)) {
        return "Please enter a valid Nigerian phone number (e.g., +2348012345678 or 08012345678)"
      }
      return undefined
    }
  },
  password: {
    required: true,
    minLength: 8,
    custom: (value) => {
      if (value.length < 8) return "Password must be at least 8 characters"
      if (!/(?=.*[a-z])/.test(value)) return "Password must contain at least one lowercase letter"
      if (!/(?=.*[A-Z])/.test(value)) return "Password must contain at least one uppercase letter"
      if (!/(?=.*\d)/.test(value)) return "Password must contain at least one number"
      return undefined
    }
  },
  confirmPassword: {
    required: true,
    custom: (value, formData) => {
      if (value !== formData.password) return "Passwords do not match"
      return undefined
    }
  },
  agreeToTerms: {
    required: true,
    custom: (value) => {
      if (!value) return "You must agree to the terms and conditions"
      return undefined
    }
  }
}

function RegistrationFormContent({ role }: RegistrationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSuccess, setIsSuccess] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const router = useRouter()
  const config = roleConfig[role as keyof typeof roleConfig]

  useEffect(() => {
    if (!config) {
      router.push("/register")
      return
    }
  }, [config, router])

  if (!config) {
    return null
  }

  const validateField = (name: string, value: any): string | undefined => {
    const rule = validationRules[name]
    if (!rule) return undefined

    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`
    }

    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} must be at least ${rule.minLength} characters`
    }

    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} format is invalid`
    }

    if (rule.custom) {
      return rule.custom(value, formData)
    }

    return undefined
  }

  const handleFieldChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
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
    const error = validateField(name, formData[name as keyof FormData])
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    Object.keys(validationRules).forEach(field => {
      const error = validateField(field, formData[field as keyof FormData])
      if (error) {
        newErrors[field as keyof FormErrors] = error
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
      const response = await api.register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.replace(/\s/g, ""),
        password: formData.password,
        role: role,
      })

      if (response.success) {
        setIsSuccess(true)
        // Redirect after a short delay to show success message
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        setErrors({ submit: response.error || "Registration failed. Please try again." })
      }
    } catch (error) {
      console.error("Registration error:", error)
      setErrors({ 
        submit: "Network error. Please check your connection and try again." 
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <RegistrationSuccess
        userData={{
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: role
        }}
        onContinue={() => {
          // Use setTimeout to avoid calling router.push during render
          setTimeout(() => {
            router.push("/dashboard")
          }, 0)
        }}
      />
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
                href="/register"
                className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>

              <div className="flex justify-center mb-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${config.bgColor}`}>
                  <config.icon className={`w-8 h-8 ${config.color}`} />
                </div>
              </div>

              <CardTitle className="text-2xl font-heading">{config.title}</CardTitle>
              <p className="text-muted-foreground">{config.description}</p>
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
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    onBlur={() => handleFieldBlur("name")}
                    className={errors.name ? "border-destructive" : ""}
                    disabled={isLoading}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    onBlur={() => handleFieldBlur("email")}
                    className={errors.email ? "border-destructive" : ""}
                    disabled={isLoading}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={formData.phone}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                    onBlur={() => handleFieldBlur("phone")}
                    className={errors.phone ? "border-destructive" : ""}
                    disabled={isLoading}
                  />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => handleFieldChange("password", e.target.value)}
                      onBlur={() => handleFieldBlur("password")}
                      className={errors.password ? "border-destructive pr-10" : "pr-10"}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  
                  {/* Password Strength Indicator */}
                  <PasswordStrengthIndicator 
                    password={formData.password} 
                    showDetails={true}
                    className="mt-3"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleFieldChange("confirmPassword", e.target.value)}
                      onBlur={() => handleFieldBlur("confirmPassword")}
                      className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleFieldChange("agreeToTerms", checked)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                {errors.agreeToTerms && <p className="text-sm text-destructive">{errors.agreeToTerms}</p>}

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

// Wrapped with Specialized Registration Error Boundary
export function RegistrationForm({ role }: RegistrationFormProps) {
  return (
    <RegistrationErrorBoundary role={role}>
      <RegistrationFormContent role={role} />
    </RegistrationErrorBoundary>
  )
}
