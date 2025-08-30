"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/auth"
import { 
  Shield, 
  Bell, 
  Eye,
  EyeOff,
  CheckCircle,
  Save,
  Settings
} from "lucide-react"

interface PartnerSettings {
  notificationPreferences: {
    email: boolean
    sms: boolean
    push: boolean
    marketing: boolean
    orderUpdates: boolean
    harvestUpdates: boolean
    paymentUpdates: boolean
    weatherAlerts: boolean
    approvalNotifications: boolean
    onboardingUpdates: boolean
  }
  securitySettings: {
    twoFactorAuth: boolean
    loginNotifications: boolean
    sessionTimeout: number
  }
  passwordData: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }
}

export function SettingsForm() {
  const { user, updateUser } = useAuthStore()
  const { toast } = useToast()
  const [settings, setSettings] = useState<PartnerSettings>({
    notificationPreferences: {
      email: true,
      sms: true,
      push: true,
      marketing: false,
      orderUpdates: true,
      harvestUpdates: true,
      paymentUpdates: true,
      weatherAlerts: true,
      approvalNotifications: true,
      onboardingUpdates: true
    },
    securitySettings: {
      twoFactorAuth: false,
      loginNotifications: true,
      sessionTimeout: 60
    },
    passwordData: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleNotificationToggle = (key: keyof PartnerSettings['notificationPreferences']) => {
    setSettings({
      ...settings,
      notificationPreferences: {
        ...settings.notificationPreferences,
        [key]: !settings.notificationPreferences[key]
      }
    })
  }

  const handleSecurityToggle = (key: keyof PartnerSettings['securitySettings']) => {
    setSettings({
      ...settings,
      securitySettings: {
        ...settings.securitySettings,
        [key]: !settings.securitySettings[key]
      }
    })
  }

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true)
      // For now, just show success message
      // This will be replaced with actual API call when backend is ready
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully",
        variant: "default"
      })
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (settings.passwordData.newPassword !== settings.passwordData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirm password do not match",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSaving(true)
      // For now, just show success message
      // This will be replaced with actual API call when backend is ready
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully",
        variant: "default"
      })
      
      // Clear password fields
      setSettings({
        ...settings,
        passwordData: {
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }
      })
    } catch (error: any) {
      toast({
        title: "Error changing password",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Settings Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Account Settings
          </CardTitle>
          <CardDescription>
            Manage your notification preferences, security settings, and account security
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-medium">Communication Channels</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
                <Switch
                  checked={settings.notificationPreferences.email}
                  onCheckedChange={() => handleNotificationToggle('email')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via SMS
                  </p>
                </div>
                <Switch
                  checked={settings.notificationPreferences.sms}
                  onCheckedChange={() => handleNotificationToggle('sms')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via push notifications
                  </p>
                </div>
                <Switch
                  checked={settings.notificationPreferences.push}
                  onCheckedChange={() => handleNotificationToggle('push')}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label className="text-base font-medium">Notification Types</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Harvest Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications about harvest submissions and approvals
                  </p>
                </div>
                <Switch
                  checked={settings.notificationPreferences.harvestUpdates}
                  onCheckedChange={() => handleNotificationToggle('harvestUpdates')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Payment Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications about payments and commissions
                  </p>
                </div>
                <Switch
                  checked={settings.notificationPreferences.paymentUpdates}
                  onCheckedChange={() => handleNotificationToggle('paymentUpdates')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Approval Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications about pending approvals
                  </p>
                </div>
                <Switch
                  checked={settings.notificationPreferences.approvalNotifications}
                  onCheckedChange={() => handleNotificationToggle('approvalNotifications')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Onboarding Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications about farmer onboarding progress
                  </p>
                </div>
                <Switch
                  checked={settings.notificationPreferences.onboardingUpdates}
                  onCheckedChange={() => handleNotificationToggle('onboardingUpdates')}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Manage your account security preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch
                checked={settings.securitySettings.twoFactorAuth}
                onCheckedChange={() => handleSecurityToggle('twoFactorAuth')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Login Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified of new login attempts
                </p>
              </div>
              <Switch
                checked={settings.securitySettings.loginNotifications}
                onCheckedChange={() => handleSecurityToggle('loginNotifications')}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label className="text-base font-medium">Session Management</Label>
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Select
                value={settings.securitySettings.sessionTimeout.toString()}
                onValueChange={(value) => setSettings({
                  ...settings,
                  securitySettings: {
                    ...settings.securitySettings,
                    sessionTimeout: parseInt(value)
                  }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="480">8 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Security Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your account password for enhanced security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={settings.passwordData.currentPassword}
                  onChange={(e) => setSettings({
                    ...settings,
                    passwordData: {
                      ...settings.passwordData,
                      currentPassword: e.target.value
                    }
                  })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={settings.passwordData.newPassword}
                onChange={(e) => setSettings({
                  ...settings,
                  passwordData: {
                    ...settings.passwordData,
                    newPassword: e.target.value
                  }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={settings.passwordData.confirmPassword}
                onChange={(e) => setSettings({
                  ...settings,
                  passwordData: {
                    ...settings.passwordData,
                    confirmPassword: e.target.value
                  }
                })}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handlePasswordChange}
                disabled={isSaving || !settings.passwordData.currentPassword || !settings.passwordData.newPassword || !settings.passwordData.confirmPassword}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
