"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Lock, 
  Key, 
  Users,
  CheckCircle2,
  AlertCircle,
  Settings,
  ArrowRight,
  Loader2
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { TwoFactorAuth } from "./two-factor-auth"
import { SessionManager } from "./session-manager"
import { PasswordStrengthIndicator } from "./password-strength-indicator"
import { api } from "@/lib/api"

interface SecuritySettingsProps {
  onBack?: () => void
}

export function SecuritySettings({ onBack }: SecuritySettingsProps) {
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false)
  const [showSessionManager, setShowSessionManager] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const { user } = useAuth()

  const securityFeatures = [
    {
      id: "two-factor",
      title: "Two-Factor Authentication",
      description: "Add an extra layer of security with SMS or email verification",
      icon: Shield,
      status: user?.twoFactorEnabled ? "enabled" : "disabled",
      action: () => setShowTwoFactorSetup(true),
      color: user?.twoFactorEnabled ? "text-green-600" : "text-orange-600"
    },
    {
      id: "sessions",
      title: "Active Sessions",
      description: "Manage your active login sessions across devices",
      icon: Users,
      status: "active",
      action: () => setShowSessionManager(true),
      color: "text-blue-600"
    },
    {
      id: "password",
      title: "Password Security",
      description: "Change your password and review security settings",
      icon: Lock,
      status: "secure",
      action: () => setShowPasswordChange(true),
      color: "text-purple-600"
    },
    {
      id: "email-verification",
      title: "Email Verification",
      description: "Verify your email address for account security",
      icon: Mail,
      status: user?.emailVerified ? "verified" : "unverified",
      action: async () => {
        if (user?.emailVerified) return
        await api.resendVerificationEmail({ email: user?.email || "" })
      },
      color: user?.emailVerified ? "text-green-600" : "text-red-600"
    },
    {
      id: "phone-verification",
      title: "Phone Verification",
      description: "Verify your phone number for SMS notifications",
      icon: Smartphone,
      status: user?.phoneVerified ? "verified" : "unverified",
      action: () => setShowTwoFactorSetup(true),
      color: user?.phoneVerified ? "text-green-600" : "text-red-600"
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "enabled":
      case "verified":
      case "secure":
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
      case "disabled":
      case "unverified":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Inactive</Badge>
      case "active":
        return <Badge variant="outline" className="border-blue-200 text-blue-700">Active</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (showTwoFactorSetup) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            onClick={() => setShowTwoFactorSetup(false)}
            size="sm"
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Back to Security
          </Button>
        </div>
        <TwoFactorAuth 
          onSuccess={() => setShowTwoFactorSetup(false)}
          onCancel={() => setShowTwoFactorSetup(false)}
          isSetup={true}
        />
      </div>
    )
  }

  if (showSessionManager) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            onClick={() => setShowSessionManager(false)}
            size="sm"
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Back to Security
          </Button>
        </div>
        <SessionManager />
      </div>
    )
  }

  if (showPasswordChange) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            onClick={() => setShowPasswordChange(false)}
            size="sm"
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Back to Security
          </Button>
        </div>
        <PasswordChangeForm />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Settings</h1>
          <p className="text-muted-foreground">
            Manage your account security and authentication preferences
          </p>
        </div>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        )}
      </div>

      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Security Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {user?.twoFactorEnabled ? "2" : "1"}
              </div>
              <div className="text-sm text-muted-foreground">Factor Auth</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {user?.emailVerified && user?.phoneVerified ? "2" : "1"}
              </div>
              <div className="text-sm text-muted-foreground">Verified</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {user?.lastPasswordChange ? "Recent" : "Update"}
              </div>
              <div className="text-sm text-muted-foreground">Password</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Features */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Security Features</h2>
        <div className="grid gap-4">
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={feature.action}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center`}>
                        <feature.icon className={`w-6 h-6 ${feature.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(feature.status)}
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Security Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Security Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Enable two-factor authentication for extra security</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Use a strong, unique password</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Regularly review active sessions</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Keep your contact information updated</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Password Change Form Component
function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // TODO: Implement password change API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      setError("Failed to change password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Password Changed Successfully!</h2>
          <p className="text-muted-foreground">
            Your password has been updated. Please use your new password for future logins.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lock className="w-5 h-5" />
          <span>Change Password</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your current password"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showCurrentPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showNewPassword ? "Hide" : "Show"}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            <PasswordStrengthIndicator 
              password={newPassword} 
              showDetails={false}
              className="mt-2"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Confirm your new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Changing Password...
              </>
            ) : (
              "Change Password"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
