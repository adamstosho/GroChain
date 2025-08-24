"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  CreditCard,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Download,
  Trash2,
  Save,
  Loader2,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  role: string
  status: string
  emailVerified: boolean
  phoneVerified: boolean
  notificationPreferences: {
    sms: boolean
    email: boolean
    ussd: boolean
    push: boolean
    marketing: boolean
    transaction: boolean
    harvest: boolean
    marketplace: boolean
  }
}

interface UserPreferences {
  theme: "light" | "dark" | "system"
  language: string
  notifications: {
    sms: boolean
    email: boolean
    ussd: boolean
    push: boolean
    marketing: boolean
    transaction: boolean
    harvest: boolean
    marketplace: boolean
  }
  privacy: {
    profileVisibility: "public" | "private" | "friends"
    dataSharing: boolean
    analytics: boolean
    locationSharing: boolean
  }
}

interface UserSettings {
  security: {
    twoFactorEnabled: boolean
    loginNotifications: boolean
    sessionTimeout: number
    passwordExpiry: number
  }
  display: {
    compactMode: boolean
    showTutorials: boolean
    autoSave: boolean
    defaultCurrency: string
  }
  performance: {
    cacheEnabled: boolean
    offlineMode: boolean
    syncFrequency: string
  }
}

export function SettingsPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Profile state
  const [profile, setProfile] = useState<UserProfile>({
    id: "",
    name: "",
    email: "",
    phone: "",
    role: "",
    status: "",
    emailVerified: false,
    phoneVerified: false,
    notificationPreferences: {
      sms: true,
      email: true,
      ussd: false,
      push: false,
      marketing: true,
      transaction: true,
      harvest: true,
      marketplace: true
    }
  })

  // Preferences state
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: "light",
    language: "en",
    notifications: {
      sms: true,
      email: true,
      ussd: false,
      push: false,
      marketing: true,
      transaction: true,
      harvest: true,
      marketplace: true
    },
    privacy: {
      profileVisibility: "public",
      dataSharing: true,
      analytics: true,
      locationSharing: false
    }
  })

  // Settings state
  const [settings, setSettings] = useState<UserSettings>({
    security: {
      twoFactorEnabled: false,
      loginNotifications: true,
      sessionTimeout: 60,
      passwordExpiry: 90
    },
    display: {
      compactMode: false,
      showTutorials: true,
      autoSave: true,
      defaultCurrency: "NGN"
    },
    performance: {
      cacheEnabled: true,
      offlineMode: false,
      syncFrequency: "realtime"
    }
  })

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false
  })

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Load profile
      const profileResponse = await api.get(`/api/users/profile/me`)
      if (profileResponse.data.status === 'success') {
        setProfile(profileResponse.data.data)
      }

      // Load preferences
      const preferencesResponse = await api.get(`/api/users/preferences/me`)
      if (preferencesResponse.data.status === 'success') {
        setPreferences(preferencesResponse.data.data)
      }

      // Load settings
      const settingsResponse = await api.get(`/api/users/settings/me`)
      if (settingsResponse.data.status === 'success') {
        setSettings(settingsResponse.data.data)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSave = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      const response = await api.put(`/api/users/profile/me`, {
        name: profile.name,
        phone: profile.phone
      })

      if (response.data.status === 'success') {
        toast({
          title: "Success",
          description: "Profile updated successfully"
        })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePreferencesSave = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      const response = await api.put(`/api/users/preferences/me`, {
        theme: preferences.theme,
        language: preferences.language,
        privacy: preferences.privacy,
        notifications: preferences.notifications
      })

      if (response.data.status === 'success') {
        toast({
          title: "Success",
          description: "Preferences updated successfully"
        })
      }
    } catch (error) {
      console.error('Error updating preferences:', error)
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSettingsSave = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      const response = await api.put(`/api/users/settings/me`, {
        security: settings.security,
        display: settings.display,
        performance: settings.performance
      })

      if (response.data.status === 'success') {
        toast({
          title: "Success",
          description: "Settings updated successfully"
        })
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!user) return
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive"
      })
      return
    }

    setSaving(true)
    try {
      const response = await api.post(`/api/users/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })

      if (response.data.status === 'success') {
        toast({
          title: "Success",
          description: "Password changed successfully"
        })
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          showCurrentPassword: false,
          showNewPassword: false,
          showConfirmPassword: false
        })
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading settings...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profile.email}
                      disabled
                      className="bg-muted"
                    />
                    <div className="flex items-center gap-2">
                      {profile.emailVerified ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Not Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="Enter your phone number"
                    />
                    <div className="flex items-center gap-2">
                      {profile.phoneVerified ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Not Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={profile.role}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>
                <Button onClick={handleProfileSave} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>App Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme</Label>
                      <Select value={preferences.theme} onValueChange={(value) => setPreferences({ ...preferences, theme: value as any })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select value={preferences.language} onValueChange={(value) => setPreferences({ ...preferences, language: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="yo">Yoruba</SelectItem>
                          <SelectItem value="ig">Igbo</SelectItem>
                          <SelectItem value="ha">Hausa</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Default Currency</Label>
                      <Select value={settings.display.defaultCurrency} onValueChange={(value) => setSettings({ ...settings, display: { ...settings.display, defaultCurrency: value } })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                          <SelectItem value="USD">US Dollar ($)</SelectItem>
                          <SelectItem value="EUR">Euro (€)</SelectItem>
                          <SelectItem value="GBP">British Pound (£)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Privacy Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Profile Visibility</Label>
                        <p className="text-sm text-muted-foreground">Control who can see your profile</p>
                      </div>
                      <Select value={preferences.privacy.profileVisibility} onValueChange={(value) => setPreferences({ ...preferences, privacy: { ...preferences.privacy, profileVisibility: value as any } })}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="friends">Friends</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Data Sharing</Label>
                        <p className="text-sm text-muted-foreground">Allow data sharing for analytics</p>
                      </div>
                      <Switch
                        checked={preferences.privacy.dataSharing}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, privacy: { ...preferences.privacy, dataSharing: checked } })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Location Sharing</Label>
                        <p className="text-sm text-muted-foreground">Share your location for better services</p>
                      </div>
                      <Switch
                        checked={preferences.privacy.locationSharing}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, privacy: { ...preferences.privacy, locationSharing: checked } })}
                      />
                    </div>
                  </div>
                </div>
                <Button onClick={handlePreferencesSave} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Password</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={passwordData.showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          placeholder="Enter current password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setPasswordData({ ...passwordData, showCurrentPassword: !passwordData.showCurrentPassword })}
                        >
                          {passwordData.showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={passwordData.showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          placeholder="Enter new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setPasswordData({ ...passwordData, showNewPassword: !passwordData.showNewPassword })}
                        >
                          {passwordData.showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={passwordData.showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          placeholder="Confirm new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setPasswordData({ ...passwordData, showConfirmPassword: !passwordData.showConfirmPassword })}
                        >
                          {passwordData.showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <Button onClick={handlePasswordChange} disabled={saving} className="w-full">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                      Change Password
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Security Options</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                      </div>
                      <Switch
                        checked={settings.security.twoFactorEnabled}
                        onCheckedChange={(checked) => setSettings({ ...settings, security: { ...settings.security, twoFactorEnabled: checked } })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Login Notifications</Label>
                        <p className="text-sm text-muted-foreground">Get notified of new login attempts</p>
                      </div>
                      <Switch
                        checked={settings.security.loginNotifications}
                        onCheckedChange={(checked) => setSettings({ ...settings, security: { ...settings.security, loginNotifications: checked } })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Select value={settings.security.sessionTimeout.toString()} onValueChange={(value) => setSettings({ ...settings, security: { ...settings.security, sessionTimeout: parseInt(value) } })}>
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
                </div>
                <Button onClick={handleSettingsSave} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Security Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notification Channels</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={preferences.notifications.email}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, notifications: { ...preferences.notifications, email: checked } })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                      </div>
                      <Switch
                        checked={preferences.notifications.sms}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, notifications: { ...preferences.notifications, sms: checked } })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
                      </div>
                      <Switch
                        checked={preferences.notifications.push}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, notifications: { ...preferences.notifications, push: checked } })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>USSD Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via USSD</p>
                      </div>
                      <Switch
                        checked={preferences.notifications.ussd}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, notifications: { ...preferences.notifications, ussd: checked } })}
                      />
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notification Categories</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Harvest Notifications</Label>
                        <p className="text-sm text-muted-foreground">Get notified about harvest activities</p>
                      </div>
                      <Switch
                        checked={preferences.notifications.harvest}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, notifications: { ...preferences.notifications, harvest: checked } })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Marketplace Notifications</Label>
                        <p className="text-sm text-muted-foreground">Get notified about marketplace activities</p>
                      </div>
                      <Switch
                        checked={preferences.notifications.marketplace}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, notifications: { ...preferences.notifications, marketplace: checked } })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Transaction Notifications</Label>
                        <p className="text-sm text-muted-foreground">Get notified about financial transactions</p>
                      </div>
                      <Switch
                        checked={preferences.notifications.transaction}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, notifications: { ...preferences.notifications, transaction: checked } })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Marketing Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive promotional and marketing content</p>
                      </div>
                      <Switch
                        checked={preferences.notifications.marketing}
                        onCheckedChange={(checked) => setPreferences({ ...preferences, notifications: { ...preferences.notifications, marketing: checked } })}
                      />
                    </div>
                  </div>
                </div>
                <Button onClick={handlePreferencesSave} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Notification Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
