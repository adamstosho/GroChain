"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface UserData {
  name: string
  email: string
  phone: string
  role: string
}

interface RegistrationSuccessProps {
  userData: UserData
  onContinue?: () => void
}

export function RegistrationSuccess({ userData, onContinue }: RegistrationSuccessProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Registration Successful!</h2>
              <p className="text-muted-foreground mb-4">
                Welcome to GroChain! Your account has been created successfully.
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Verify Your Email
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      We've sent a verification link to <strong>{userData.email}</strong>. 
                      Please check your email and click the verification link to activate your account.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <p>Didn't receive the email?</p>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-sm text-primary hover:underline"
                    onClick={() => router.push(`/verify-email?resend=true&email=${encodeURIComponent(userData.email)}`)}
                  >
                    Resend verification email
                  </Button>
                </div>
                
                {onContinue && (
                  <Button onClick={onContinue} variant="outline" className="w-full">
                    Go to Login
                  </Button>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
