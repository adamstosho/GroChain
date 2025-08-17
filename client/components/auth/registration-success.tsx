"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/Alert"
import { CheckCircle2, Loader2, AlertCircle, ExternalLink, Mail, Phone } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface RegistrationSuccessProps {
  userData: {
    name: string
    email: string
    phone: string
    role: string
  }
  onContinue: () => void
}

export function RegistrationSuccess({ userData, onContinue }: RegistrationSuccessProps) {
  const [countdown, setCountdown] = useState(5)
  const [error, setError] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onContinue()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [onContinue])

  const handleManualContinue = () => {
    try {
      onContinue()
    } catch (err) {
      setError("Failed to redirect. Please try again.")
      console.error("Navigation error:", err)
    }
  }

  const handleResendVerification = async () => {
    try {
      // TODO: Implement resend verification email
      console.log("Resending verification email to:", userData.email)
    } catch (err) {
      setError("Failed to resend verification email. Please try again.")
      console.error("Resend error:", err)
    }
  }

  if (error) {
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
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h2>
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div className="space-y-3">
                  <Button onClick={handleManualContinue} className="w-full">
                    Try Again
                  </Button>
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full">
                      Go to Dashboard
                    </Button>
                  </Link>
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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Welcome to GroChain!
              </CardTitle>
              <p className="text-muted-foreground">
                Your account has been created successfully
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* User Info */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-foreground">Account Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{userData.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{userData.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{userData.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">Role:</span>
                    <span className="font-medium capitalize">{userData.role}</span>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Next Steps</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span>Check your email for verification link</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span>Complete your profile setup</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span>Explore your dashboard</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button onClick={handleManualContinue} className="w-full">
                  Continue to Dashboard
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleResendVerification}
                  className="w-full"
                >
                  Resend Verification Email
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Redirecting automatically in {countdown} seconds...
                </p>
              </div>

              {/* Help Links */}
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center mb-3">
                  Need help? Check out our resources:
                </p>
                <div className="flex justify-center space-x-4 text-xs">
                  <Link href="/help" className="text-primary hover:underline">
                    Help Center
                  </Link>
                  <Link href="/contact" className="text-primary hover:underline">
                    Contact Support
                  </Link>
                  <Link href="/docs" className="text-primary hover:underline">
                    Documentation
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
