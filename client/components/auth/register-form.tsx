"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/auth"
import { Leaf, ShoppingCart, Users, Eye, EyeOff, Mail, User, Phone, Lock, MapPin, AlertCircle } from "lucide-react"

export function RegisterForm() {
  const [step, setStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    location: "",
    role: "",
    smsCode: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [smsSent, setSmsSent] = useState(false)
  const [smsLoading, setSmsLoading] = useState(false)
  const [smsVerified, setSmsVerified] = useState(false)

  const router = useRouter()
  const { toast } = useToast()
  const { register } = useAuthStore()

  const roles = [
    {
      id: "farmer",
      title: "Farmer",
      description: "Register and manage your farm products",
      icon: Leaf,
      features: ["Log harvests", "Track inventory", "Access marketplace", "Get credit scores"],
      color: "bg-primary/10 text-primary border-primary/20",
    },
    {
      id: "buyer",
      title: "Buyer",
      description: "Find and purchase verified products",
      icon: ShoppingCart,
      features: ["Browse products", "Verify quality", "Secure payments", "Track orders"],
      color: "bg-secondary/10 text-secondary border-secondary/20",
    },
    {
      id: "partner",
      title: "Partner",
      description: "Onboard farmers and provide support",
      icon: Users,
      features: ["Bulk onboarding", "Earn commissions", "Analytics dashboard", "Farmer support"],
      color: "bg-accent/10 text-accent border-accent/20",
    },
  ]

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId)
    setFormData({ ...formData, role: roleId })
    setError("")
  }

  const handleNext = () => {
    if (step === 1 && !selectedRole) {
      toast({
        title: "Please select a role",
        description: "Choose your role to continue with registration.",
        variant: "destructive",
      })
      return
    }

    if (step === 2) {
      if (!formData.name || !formData.email || !formData.phone) {
        setError("Please fill in all required fields")
        return
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address")
        return
      }

      // Basic phone validation for Nigerian numbers
      const phoneRegex = /^(\+234|234|0)?[789]\d{9}$/
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        setError("Please enter a valid Nigerian phone number")
        return
      }
    }

    if (step === 3 && !smsVerified) {
      setError("Please verify your phone number to continue")
      return
    }

    setError("")
    setStep(step + 1)
  }

  const handleBack = () => {
    setError("")
    setStep(step - 1)
  }

  const sendSMSVerification = async () => {
    if (!formData.phone) {
      setError("Phone number is required")
      return
    }

    setSmsLoading(true)
    setError("")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/send-sms-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.phone,
          purpose: 'registration'
        }),
      })

      const data = await response.json()

      if (data.status === 'success') {
        setSmsSent(true)
        toast({
          title: "Verification code sent",
          description: "Please check your phone for the verification code.",
        })
      } else {
        throw new Error(data.message || 'Failed to send verification code')
      }
    } catch (error: any) {
      console.error('SMS verification error:', error)
      setError(error.message || 'Failed to send verification code')
      toast({
        title: "Failed to send code",
        description: error.message || 'Please try again.',
        variant: "destructive",
      })
    } finally {
      setSmsLoading(false)
    }
  }

  const verifySMSCode = async () => {
    if (!formData.smsCode || formData.smsCode.length !== 6) {
      setError("Please enter a valid 6-digit verification code")
      return
    }

    setSmsLoading(true)
    setError("")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/verify-sms-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.phone,
          code: formData.smsCode,
          purpose: 'registration'
        }),
      })

      const data = await response.json()

      if (data.status === 'success') {
        setSmsVerified(true)
        toast({
          title: "Phone verified successfully",
          description: "Your phone number has been verified.",
        })
      } else {
        throw new Error(data.message || 'Invalid verification code')
      }
    } catch (error: any) {
      console.error('SMS verification error:', error)
      setError(error.message || 'Invalid verification code')
      toast({
        title: "Verification failed",
        description: error.message || 'Please check your code and try again.',
        variant: "destructive",
      })
    } finally {
      setSmsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match")
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setIsLoading(true)

    try {
      console.log("[v0] Attempting registration with data:", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        location: formData.location,
      })

      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        location: formData.location,
        smsCode: formData.smsCode,
      })

      toast({
        title: "Verify your email",
        description: "We sent you a verification link. Please verify to sign in.",
      })
      router.push("/login?verify=1")
    } catch (error: any) {
      console.error("[v0] Registration error:", error)

      let errorMessage = "Registration failed. Please try again."

      if (error.message) {
        if (error.message.includes("Network error")) {
          errorMessage =
            "Unable to connect to server. Please check your internet connection and ensure the backend server is running."
        } else if (error.message.includes("email already exists") || error.message.includes("already registered")) {
          errorMessage = "An account with this email already exists. Please try logging in instead."
        } else {
          errorMessage = error.message
        }
      }

      setError(errorMessage)
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-2 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {i}
            </div>
            {i < 4 && <div className={`h-0.5 w-8 mx-2 ${i < step ? "bg-primary" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Step 1: Role Selection */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold">Choose Your Role</h2>
            <p className="text-muted-foreground">Select how you'll use GroChain</p>
          </div>

          <div className="grid gap-4">
            {roles.map((role) => (
              <Card
                key={role.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedRole === role.id ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
                }`}
                onClick={() => handleRoleSelect(role.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${role.color}`}>
                        <role.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{role.title}</CardTitle>
                        <CardDescription>{role.description}</CardDescription>
                      </div>
                    </div>
                    <div
                      className={`h-4 w-4 rounded-full border-2 ${
                        selectedRole === role.id ? "bg-primary border-primary" : "border-muted-foreground"
                      }`}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Key Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {role.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button onClick={handleNext} className="w-full" disabled={!selectedRole}>
            Continue to Registration
          </Button>
        </div>
      )}

      {/* Step 2: Basic Information */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            <p className="text-muted-foreground">Tell us about yourself</p>
          </div>

          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className="pl-10"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+234 800 000 0000"
                  className="pl-10"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  type="text"
                  placeholder="City, State"
                  className="pl-10"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
          </form>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
              Back
            </Button>
            <Button onClick={handleNext} className="flex-1">
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: SMS Verification */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold">Verify Your Phone Number</h2>
            <p className="text-muted-foreground">We'll send you a verification code</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Phone Number</p>
                  <p className="text-sm text-muted-foreground">{formData.phone}</p>
                </div>
              </div>
            </div>

            {!smsSent ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Click the button below to send a verification code to your phone number.
                </p>
                <Button 
                  onClick={sendSMSVerification} 
                  disabled={smsLoading}
                  className="w-full"
                >
                  {smsLoading ? "Sending..." : "Send Verification Code"}
                </Button>
              </div>
            ) : !smsVerified ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smsCode">Verification Code</Label>
                  <Input
                    id="smsCode"
                    type="text"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    value={formData.smsCode}
                    onChange={(e) => setFormData({ ...formData, smsCode: e.target.value.replace(/\D/g, '') })}
                    className="text-center text-lg tracking-widest"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the 6-digit code sent to your phone
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setSmsSent(false)
                      setFormData({ ...formData, smsCode: "" })
                    }}
                    className="flex-1"
                  >
                    Change Number
                  </Button>
                  <Button 
                    onClick={verifySMSCode} 
                    disabled={smsLoading || formData.smsCode.length !== 6}
                    className="flex-1"
                  >
                    {smsLoading ? "Verifying..." : "Verify Code"}
                  </Button>
                </div>

                <div className="text-center">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={sendSMSVerification}
                    disabled={smsLoading}
                    className="text-sm"
                  >
                    Resend Code
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-green-800">Phone Verified Successfully</p>
                    <p className="text-sm text-green-600">Your phone number has been verified</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
              Back
            </Button>
            <Button 
              onClick={handleNext} 
              className="flex-1"
              disabled={!smsVerified}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Password Creation */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold">Create Password</h2>
            <p className="text-muted-foreground">Secure your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="pl-10 pr-10"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Password must contain:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>At least 8 characters</li>
                <li>One uppercase letter</li>
                <li>One lowercase letter</li>
                <li>One number</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <Button type="button" variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link href="/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </div>
    </div>
  )
}
