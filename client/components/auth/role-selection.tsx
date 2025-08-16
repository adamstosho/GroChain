"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Leaf, ShoppingCart, Building2, Users } from "lucide-react"
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
  },
  {
    id: "buyer",
    title: "Buyer",
    description: "Find and purchase verified products",
    icon: ShoppingCart,
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
  {
    id: "partner",
    title: "Partner",
    description: "Onboard farmers and provide support",
    icon: Building2,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  {
    id: "aggregator",
    title: "Aggregator",
    description: "Aggregate products from multiple farmers",
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    borderColor: "border-purple-200 dark:border-purple-800",
  },
]

export function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<string>("")
  const router = useRouter()

  const handleContinue = () => {
    if (selectedRole) {
      router.push(`/register/${selectedRole}`)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>

            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                <Leaf className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>

            <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Create Account</h1>
            <p className="text-muted-foreground">Join Nigeria's digital agriculture platform</p>
          </div>

          {/* Role Selection */}
          <div className="space-y-4 mb-8">
            <h2 className="text-lg font-heading font-semibold text-foreground mb-4">Select Your Role</h2>

            <div className="space-y-3" role="radiogroup" aria-label="Select your role">
              {roles.map((role) => (
                <motion.div key={role.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Card
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedRole === role.id ? `ring-2 ring-primary ${role.borderColor}` : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${role.bgColor}`}>
                          <role.icon className={`w-6 h-6 ${role.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-heading font-semibold text-foreground">{role.title}</h3>
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            selectedRole === role.id ? "bg-primary border-primary" : "border-muted-foreground"
                          }`}
                        >
                          {selectedRole === role.id && (
                            <div className="w-full h-full rounded-full bg-primary-foreground scale-50" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Continue Button */}
          <Button onClick={handleContinue} disabled={!selectedRole} className="w-full" size="lg">
            Continue
          </Button>

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
