"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { api } from "@/lib/api"

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
  avatar: string
  location: {
    state: string
    lga: string
    address: string
  }
  verification: {
    email: boolean
    phone: boolean
    bvn: boolean
    identity: boolean
  }
  preferences: {
    theme: "light" | "dark" | "system"
    language: string
    notifications: {
      email: boolean
      sms: boolean
      push: boolean
    }
    privacy: {
      profileVisibility: "public" | "private"
      dataSharing: boolean
      analytics: boolean
    }
  }
}

const mockUser: UserProfile = {
  id: "1",
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  phone: "+234 801 234 5678",
  role: "farmer",
  avatar: "/placeholder.svg",
  location: {
    state: "Lagos",
    lga: "Ikeja",
    address: "123 Farm Road, Ikeja, Lagos State",
  },
  verification: {
    email: true,
    phone: true,
    bvn: false,
    identity: false,
  },
  preferences: {
    theme: "light",
    language: "en",
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
    privacy: {
      profileVisibility: "public",
      dataSharing: true,
      analytics: true,
    },
  },
}

export function SettingsPage() {
  const [user, setUser] = useState<UserProfile>(mockUser)
  const [activeTab, setActiveTab] = useState("profile")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [bvnForm, setBvnForm] = useState({ bvn: "", firstName: "", lastName: "", dateOfBirth: "", phoneNumber: "" })
  const [bvnStatus, setBvnStatus] = useState<string | null>(null)

  useEffect(() => {
    // Prefill from user
    setBvnForm({ bvn: "", firstName: user.firstName, lastName: user.lastName, dateOfBirth: "1990-01-01", phoneNumber: user.phone })
  }, [])

  const updateProfile = async (updates: Partial<UserProfile>) => {
    setIsLoading(true)
    try {
      // API call to update profile
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setUser((prev) => ({ ...prev, ...updates }))
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updatePreferences = (preferences: Partial<UserProfile["preferences"]>) => {
    setUser((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, ...preferences },
    }))
  }

  const handleBVNVerification = async () => {
    setIsLoading(true)
    try {
      const payload = bvnForm
      const resp = await api.verifyBVN(payload)
      if (resp.success) {
        setUser((prev) => ({ ...prev, verification: { ...prev.verification, bvn: true } }))
      }
    } catch (error) {
      console.error("BVN verification failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBVNOffline = async () => {
    setIsLoading(true)
    try {
      await api.offlineBVNVerification({ bvn: "00000000000", phoneNumber: user.phone })
    } catch {}
    setIsLoading(false)
  }

  const handleBVNResend = async () => {
    setIsLoading(true)
    try {
      await api.resendBVNVerification({ bvn: "00000000000", phoneNumber: user.phone })
    } catch {}
    setIsLoading(false)
  }

  const getVerificationBadge = (verified: boolean) => {
    return verified ? (
      <Badge variant="default" className="ml-2">
        <CheckCircle className="w-3 h-3 mr-1" />
        Verified
      </Badge>
    ) : (
      <Badge variant="secondary" className="ml-2">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Unverified
      </Badge>
    )
  }

  return (
    <DashboardLayout user={user as any}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Settings className="w-4 h-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="account">
              <CreditCard className="w-4 h-4 mr-2" />
              Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-primary" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-muted-foreground">{user.email}</p>
                    <Badge variant="outline" className="mt-1">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm">
                    Change Photo
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={user.firstName} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={user.lastName} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex items-center space-x-2">
                      <Input id="email" value={user.email} />
                      {getVerificationBadge(user.verification.email)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex items-center space-x-2">
                      <Input id="phone" value={user.phone} />
                      {getVerificationBadge(user.verification.phone)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={user.location.address} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select value={user.location.state}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lagos">Lagos</SelectItem>
                        <SelectItem value="Kano">Kano</SelectItem>
                        <SelectItem value="Ogun">Ogun</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lga">Local Government Area</Label>
                    <Input id="lga" value={user.location.lga} />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button disabled={isLoading}>{isLoading ? "Saving..." : "Save Changes"}</Button>
                </div>
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card>
              <CardHeader>
                <CardTitle>Account Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <div>
                        <h4 className="font-medium">Email Verified</h4>
                        <p className="text-sm text-muted-foreground">Your email address is verified</p>
                      </div>
                    </div>
                    <Badge variant="default">Verified</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <div>
                        <h4 className="font-medium">Phone Verified</h4>
                        <p className="text-sm text-muted-foreground">Your phone number is verified</p>
                      </div>
                    </div>
                    <Badge variant="default">Verified</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-5 h-5 text-warning" />
                      <div>
                        <h4 className="font-medium">BVN Verification</h4>
                        <p className="text-sm text-muted-foreground">Verify your Bank Verification Number</p>
                        {bvnStatus && <p className="text-xs mt-1">Status: {bvnStatus}</p>}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                          <div className="space-y-1">
                            <Label htmlFor="bvn">BVN</Label>
                            <Input id="bvn" value={bvnForm.bvn} onChange={e=> setBvnForm({ ...bvnForm, bvn: e.target.value })} placeholder="11-digit BVN" />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="dob">Date of Birth</Label>
                            <Input id="dob" type="date" value={bvnForm.dateOfBirth} onChange={e=> setBvnForm({ ...bvnForm, dateOfBirth: e.target.value })} />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="first">First Name</Label>
                            <Input id="first" value={bvnForm.firstName} onChange={e=> setBvnForm({ ...bvnForm, firstName: e.target.value })} />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="last">Last Name</Label>
                            <Input id="last" value={bvnForm.lastName} onChange={e=> setBvnForm({ ...bvnForm, lastName: e.target.value })} />
                          </div>
                          <div className="space-y-1 md:col-span-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" value={bvnForm.phoneNumber} onChange={e=> setBvnForm({ ...bvnForm, phoneNumber: e.target.value })} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleBVNVerification} disabled={isLoading}>
                        {isLoading ? "Verifying..." : "Verify BVN"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleBVNOffline} disabled={isLoading}>
                        Offline
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleBVNResend} disabled={isLoading}>
                        Resend
                      </Button>
                      <Button variant="outline" size="sm" onClick={async ()=>{ const r = await api.getVerificationStatus(user.id); if ((r as any).success) setBvnStatus('verified'); }} disabled={isLoading}>
                        Check Status
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-5 h-5 text-warning" />
                      <div>
                        <h4 className="font-medium">Identity Verification</h4>
                        <p className="text-sm text-muted-foreground">Upload government-issued ID</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Upload ID
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            {/* Password & Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="w-5 h-5 mr-2 text-primary" />
                  Password & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter current password"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" placeholder="Enter new password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Update Password</Button>
                </div>
              </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smartphone className="w-5 h-5 mr-2 text-primary" />
                  Two-Factor Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SMS Authentication</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive verification codes via SMS for additional security
                    </p>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Authenticator App</h4>
                    <p className="text-sm text-muted-foreground">Use an authenticator app for verification codes</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Setup
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Login Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Login Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Current Session</h4>
                      <p className="text-sm text-muted-foreground">Lagos, Nigeria • Chrome on Windows</p>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Mobile App</h4>
                      <p className="text-sm text-muted-foreground">Lagos, Nigeria • 2 hours ago</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Revoke
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-primary" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={user.preferences.notifications.email}
                      onCheckedChange={(checked) =>
                        updatePreferences({
                          notifications: { ...user.preferences.notifications, email: checked },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">SMS Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                    </div>
                    <Switch
                      checked={user.preferences.notifications.sms}
                      onCheckedChange={(checked) =>
                        updatePreferences({
                          notifications: { ...user.preferences.notifications, sms: checked },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Push Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
                    </div>
                    <Switch
                      checked={user.preferences.notifications.push}
                      onCheckedChange={(checked) =>
                        updatePreferences({
                          notifications: { ...user.preferences.notifications, push: checked },
                        })
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Notification Types</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Order Updates</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Payment Confirmations</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Weather Alerts</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">System Updates</span>
                      <Switch />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            {/* App Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="w-5 h-5 mr-2 text-primary" />
                  App Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select
                      value={user.preferences.theme}
                      onValueChange={(value: "light" | "dark" | "system") => updatePreferences({ theme: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                    <Select value={user.preferences.language}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ha">Hausa</SelectItem>
                        <SelectItem value="yo">Yoruba</SelectItem>
                        <SelectItem value="ig">Igbo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Profile Visibility</h4>
                    <p className="text-sm text-muted-foreground">Control who can see your profile information</p>
                  </div>
                  <Select
                    value={user.preferences.privacy.profileVisibility}
                    onValueChange={(value: "public" | "private") =>
                      updatePreferences({
                        privacy: { ...user.preferences.privacy, profileVisibility: value },
                      })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Data Sharing</h4>
                    <p className="text-sm text-muted-foreground">Allow sharing of anonymized data for research</p>
                  </div>
                  <Switch
                    checked={user.preferences.privacy.dataSharing}
                    onCheckedChange={(checked) =>
                      updatePreferences({
                        privacy: { ...user.preferences.privacy, dataSharing: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Analytics</h4>
                    <p className="text-sm text-muted-foreground">Help improve the app with usage analytics</p>
                  </div>
                  <Switch
                    checked={user.preferences.privacy.analytics}
                    onCheckedChange={(checked) =>
                      updatePreferences({
                        privacy: { ...user.preferences.privacy, analytics: checked },
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Export Data</h4>
                    <p className="text-sm text-muted-foreground">Download a copy of your account data</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Data Retention</h4>
                    <p className="text-sm text-muted-foreground">Manage how long your data is stored</p>
                  </div>
                  <Select defaultValue="indefinite">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1year">1 Year</SelectItem>
                      <SelectItem value="2years">2 Years</SelectItem>
                      <SelectItem value="indefinite">Indefinite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                  <div>
                    <h4 className="font-medium text-destructive">Delete Account</h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
