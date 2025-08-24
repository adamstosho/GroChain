"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Leaf, ShoppingCart, Building2, Users, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const roles = [
  {
    id: "farmer",
    title: "Farmer",
    description: "Register and manage your farm products",
    icon: Leaf,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    borderColor: "border-green-200 dark:border-green-800",
    features: ["Log harvests", "Track inventory", "Access marketplace", "Get credit scores"]
  },
  {
    id: "buyer",
    title: "Buyer",
    description: "Find and purchase verified products",
    icon: ShoppingCart,
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
    borderColor: "border-amber-200 dark:border-amber-800",
    features: ["Browse products", "Verify quality", "Secure payments", "Track orders"]
  },
  {
    id: "partner",
    title: "Partner",
    description: "Onboard farmers and provide support",
    icon: Building2,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    features: ["Bulk onboarding", "Earn commissions", "Analytics dashboard", "Farmer support"]
  },
  {
    id: "aggregator",
    title: "Aggregator",
    description: "Aggregate products from multiple farmers",
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    borderColor: "border-purple-200 dark:border-purple-800",
    features: ["Source products", "Quality control", "Bulk purchasing", "Distribution"]
  },
]

export function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [error, setError] = useState<string>("")
  const router = useRouter()

  const handleContinue = () => {
    if (!selectedRole) {
      setError("Please select a role to continue")
      return
    }

    try {
      // Validate role exists
      const roleExists = roles.find(role => role.id === selectedRole)
      if (!roleExists) {
        throw new Error("Invalid role selected")
      }

      // Clear any previous errors
      setError("")
      
      // Navigate to registration form
      router.push(`/register/${selectedRole}`)
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error("Navigation error:", err)
    }
  }

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId)
    // Clear error when user makes a selection
    if (error) {
      setError("")
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>

            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                <Leaf className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>

            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Join GroChain</h1>
            <p className="text-lg text-muted-foreground">Choose your role in Nigeria's digital agriculture platform</p>
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Role Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {roles.map((role) => (
              <motion.div 
                key={role.id} 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: roles.indexOf(role) * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-200 h-full ${
                    selectedRole === role.id 
                      ? `ring-2 ring-primary ${role.borderColor} shadow-lg` 
                      : "hover:shadow-md hover:border-primary/20"
                  }`}
                  onClick={() => handleRoleSelect(role.id)}
                >
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${role.bgColor} flex-shrink-0`}>
                        <role.icon className={`w-6 h-6 ${role.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading font-semibold text-foreground text-lg">{role.title}</h3>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                          selectedRole === role.id 
                            ? "bg-primary border-primary" 
                            : "border-muted-foreground"
                        }`}
                      >
                        {selectedRole === role.id && (
                          <div className="w-full h-full rounded-full bg-primary-foreground scale-50" />
                        )}
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-foreground mb-2">Key Features:</h4>
                      <ul className="space-y-1">
                        {role.features.map((feature, index) => (
                          <li key={index} className="text-xs text-muted-foreground flex items-center">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <Button 
              onClick={handleContinue} 
              disabled={!selectedRole} 
              className="w-full max-w-md" 
              size="lg"
            >
              Continue to Registration
            </Button>
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
