"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "@/lib/api"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  Settings,
  Bell,
  Globe,
  Shield,
  Download,
  Upload,
  Eye,
  EyeOff,
  Lock,
  Smartphone,
  Mail,
  Calendar,
  Languages,
  Palette,
  Database,
  AlertTriangle,
  CheckCircle,
  X,
  Save,
  RefreshCw,
  Trash2,
  FileText,
  CreditCard,
  UserCheck,
  BellOff,
  BellRing,
  Server,
  Monitor,
  Key,
  Activity,
  BarChart3,
  Cog,
  Users,
  Database as DatabaseIcon
} from "lucide-react"

interface AdminSettings {
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
    systemAlerts: boolean
    userReports: boolean
    securityEvents: boolean
    performanceMetrics: boolean
    backupStatus: boolean
    complianceAlerts: boolean
    maintenanceUpdates: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private' | 'staff'
    showLocation: boolean
    showContact: boolean
    showPermissions: boolean
    showActivityLogs: boolean
    showSystemAccess: boolean
  }
  system: {
    dashboardLayout: string
    reportFormat: string
    dataRefreshRate: string
    sessionTimeout: number
    autoLogout: boolean
    auditLogging: boolean
    performanceMonitoring: boolean
  }
  preferences: {
    language: string
    theme: 'light' | 'dark' | 'auto'
    currency: string
    timezone: string
    dateFormat: string
    numberFormat: string
    timeFormat: string
  }
  security: {
    twoFactorEnabled: boolean
    sessionTimeout: number
    loginNotifications: boolean
    passwordExpiry: number
    biometricAuth: boolean
    ipWhitelist: boolean
    deviceManagement: boolean
  }
  data: {
    autoBackup: boolean
    backupFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly'
    retentionPeriod: number
    exportFormat: 'csv' | 'json' | 'pdf' | 'xml'
    dataArchiving: boolean
    realTimeSync: boolean
  }
}

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'yo', name: 'Yoruba', flag: '🇳🇬' },
  { code: 'ig', name: 'Igbo', flag: '🇳🇬' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' }
]

const currencies = [
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' }
]

const timezones = [
  'Africa/Lagos',
  'Africa/Abidjan',
  'Africa/Accra',
  'Africa/Addis_Ababa',
  'Africa/Cairo',
  'Africa/Johannesburg'
]

const dateFormats = [
  'DD/MM/YYYY',
  'MM/DD/YYYY',
  'YYYY-MM-DD',
  'DD-MM-YYYY'
]

const dashboardLayouts = [
  'Compact', 'Detailed', 'Minimal', 'Custom', 'Executive',
  'Operational', 'Analytical', 'Developer', 'Security'
]

const reportFormats = [
  'PDF', 'Excel', 'Word', 'PowerPoint', 'Web Dashboard',
  'Printed Report', 'Email Summary', 'API Response'
]

const dataRefreshRates = [
  'Real-time', '30 seconds', '1 minute', '5 minutes',
  '15 minutes', '1 hour', 'Manual'
]

const numberFormats = [
  '1,234.56', '1.234,56', '1 234.56', '1234.56',
  '1,234,567.89', '1.234.567,89'
]

const timeFormats = [
  '12-hour (AM/PM)', '24-hour', 'ISO 8601', 'Custom'
]

export function AdminSettings() {
  const [settings, setSettings] = useState<AdminSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      
      // Fetch user preferences and settings from API
      const [preferencesResponse, settingsResponse] = await Promise.all([
        apiService.request('/api/users/preferences/me'),
        apiService.request('/api/users/settings/me')
      ])

      // Combine and set default values
      const defaultSettings: AdminSettings = {
        notifications: {
          email: true,
          sms: true,
          push: false,
          systemAlerts: true,
          userReports: true,
          securityEvents: true,
          performanceMetrics: true,
          backupStatus: true,
          complianceAlerts: true,
          maintenanceUpdates: true
        },
        privacy: {
          profileVisibility: 'staff',
          showLocation: true,
          showContact: true,
          showPermissions: false,
          showActivityLogs: true,
          showSystemAccess: false
        },
        system: {
          dashboardLayout: 'Detailed',
          reportFormat: 'PDF',
          dataRefreshRate: '5 minutes',
          sessionTimeout: 30,
          autoLogout: true,
          auditLogging: true,
          performanceMonitoring: true
        },
        preferences: {
          language: 'en',
          theme: 'light',
          currency: 'NGN',
          timezone: 'Africa/Lagos',
          dateFormat: 'DD/MM/YYYY',
          numberFormat: '1,234.56',
          timeFormat: '24-hour'
        },
        security: {
          twoFactorEnabled: true,
          sessionTimeout: 30,
          loginNotifications: true,
          passwordExpiry: 90,
          biometricAuth: false,
          ipWhitelist: false,
          deviceManagement: true
        },
        data: {
          autoBackup: true,
          backupFrequency: 'daily',
          retentionPeriod: 365,
          exportFormat: 'csv',
          dataArchiving: true,
          realTimeSync: true
        }
      }

      // Merge with API response
      const mergedSettings = {
        ...defaultSettings,
        ...preferencesResponse?.data,
        ...settingsResponse?.data
      }

      setSettings(mergedSettings)
    } catch (error) {
      console.error("Failed to fetch settings:", error)
      toast({
        title: "Error",
        description: "Failed to load settings. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!settings) return

    try {
      setSaving(true)
      
      // Save settings to API
      await Promise.all([
        apiService.request('/api/users/preferences/me', {
          method: 'PUT',
          body: JSON.stringify({
            notifications: settings.notifications,
            system: settings.system,
            preferences: settings.preferences
          })
        }),
        apiService.request('/api/users/settings/me', {
          method: 'PUT',
          body: JSON.stringify({
            privacy: settings.privacy,
            security: settings.security,
            data: settings.data
          })
        })
      ])
      
      toast({
        title: "Settings Saved Successfully! 🎉",
        description: "Your administrative preferences have been updated.",
        variant: "default"
      })
    } catch (error) {
      console.error("Failed to save settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive"
      })
      return
    }

    try {
      setSaving(true)
      
      await apiService.request('/api/users/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })
      
      toast({
        title: "Password Changed Successfully! 🔐",
        description: "Your password has been updated.",
        variant: "default"
      })
      
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      console.error("Failed to change password:", error)
      toast({
        title: "Error",
        description: "Failed to change password. Please check your current password.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleExportData = async () => {
    try {
      setExporting(true)
      
      // Export admin data using the custom export endpoint
      const response = await apiService.request('/api/export-import/export/custom', {
        method: 'POST',
        body: JSON.stringify({
          format: settings?.data.exportFormat || 'csv',
          dataType: 'admin-data',
          filters: {
            includeUsers: true,
            includeSystemLogs: true,
            includeReports: true
          }
        })
      })
      
      if (response.data?.url) {
        window.open(response.data.url, '_blank')
        toast({
          title: "Export Successful! 📊",
          description: "Your administrative data has been exported.",
          variant: "default"
        })
      } else {
        toast({
          title: "Export Successful! 📊",
          description: "Your administrative data has been exported.",
          variant: "default"
        })
      }
    } catch (error) {
      console.error("Failed to export data:", error)
      toast({
        title: "Export Not Available",
        description: "Data export feature is coming now. Please contact support for data requests.",
        variant: "destructive"
      })
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Failed to load settings</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
          <p className="text-muted-foreground">
            Customize your administrative system and preferences
          </p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <Switch
                  id="email-notifications"
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) =>
                    setSettings(prev => prev ? {
                      ...prev,
                      notifications: { ...prev.notifications, email: checked }
                    } : null)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
                <Switch
                  id="sms-notifications"
                  checked={settings.notifications.sms}
                  onCheckedChange={(checked) =>
                    setSettings(prev => prev ? {
                      ...prev,
                      notifications: { ...prev.notifications, sms: checked }
                    } : null)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <Switch
                  id="push-notifications"
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) =>
                    setSettings(prev => prev ? {
                      ...prev,
                      notifications: { ...prev.notifications, push: checked }
                    } : null)
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="system-alerts">System Alerts</Label>
                <Switch
                  id="system-alerts"
                  checked={settings.notifications.systemAlerts}
                  onCheckedChange={(checked) =>
                    setSettings(prev => prev ? {
                      ...prev,
                      notifications: { ...prev.notifications, systemAlerts: checked }
                    } : null)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="security-events">Security Events</Label>
                <Switch
                  id="security-events"
                  checked={settings.notifications.securityEvents}
                  onCheckedChange={(checked) =>
                    setSettings(prev => prev ? {
                      ...prev,
                      notifications: { ...prev.notifications, securityEvents: checked }
                    } : null)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="backup-status">Backup Status</Label>
                <Switch
                  id="backup-status"
                  checked={settings.notifications.backupStatus}
                  onCheckedChange={(checked) =>
                    setSettings(prev => prev ? {
                      ...prev,
                      notifications: { ...prev.notifications, backupStatus: checked }
                    } : null)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription>Control your data visibility and security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="profile-visibility">Profile Visibility</Label>
                <Select
                  value={settings.privacy.profileVisibility}
                  onValueChange={(value: 'public' | 'private' | 'staff') =>
                    setSettings(prev => prev ? {
                      ...prev,
                      privacy: { ...prev.privacy, profileVisibility: value }
                    } : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="staff">Staff Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-location">Show Location</Label>
                <Switch
                  id="show-location"
                  checked={settings.privacy.showLocation}
                  onCheckedChange={(checked) =>
                    setSettings(prev => prev ? {
                      ...prev,
                      privacy: { ...prev.privacy, showLocation: checked }
                    } : null)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-activity-logs">Show Activity Logs</Label>
                <Switch
                  id="show-activity-logs"
                  checked={settings.privacy.showActivityLogs}
                  onCheckedChange={(checked) =>
                    setSettings(prev => prev ? {
                      ...prev,
                      privacy: { ...prev.privacy, showActivityLogs: checked }
                    } : null)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                <Switch
                  id="two-factor"
                  checked={settings.security.twoFactorEnabled}
                  onCheckedChange={(checked) =>
                    setSettings(prev => prev ? {
                      ...prev,
                      security: { ...prev.security, twoFactorEnabled: checked }
                    } : null)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Preferences
            </CardTitle>
            <CardDescription>Customize your system experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="dashboard-layout">Dashboard Layout</Label>
                <Select
                  value={settings.system.dashboardLayout}
                  onValueChange={(value) =>
                    setSettings(prev => prev ? {
                      ...prev,
                      system: { ...prev.system, dashboardLayout: value }
                    } : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dashboardLayouts.map((layout) => (
                      <SelectItem key={layout} value={layout}>
                        {layout}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="data-refresh-rate">Data Refresh Rate</Label>
                <Select
                  value={settings.system.dataRefreshRate}
                  onValueChange={(value) =>
                    setSettings(prev => prev ? {
                      ...prev,
                      system: { ...prev.system, dataRefreshRate: value }
                    } : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dataRefreshRates.map((rate) => (
                      <SelectItem key={rate} value={rate}>
                        {rate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-logout">Auto Logout</Label>
                <Switch
                  id="auto-logout"
                  checked={settings.system.autoLogout}
                  onCheckedChange={(checked) =>
                    setSettings(prev => prev ? {
                      ...prev,
                      system: { ...prev.system, autoLogout: checked }
                    } : null)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="audit-logging">Audit Logging</Label>
                <Switch
                  id="audit-logging"
                  checked={settings.system.auditLogging}
                  onCheckedChange={(checked) =>
                    setSettings(prev => prev ? {
                      ...prev,
                      system: { ...prev.system, auditLogging: checked }
                    } : null)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Language & Region
            </CardTitle>
            <CardDescription>Set your local preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={settings.preferences.language}
                  onValueChange={(value) =>
                    setSettings(prev => prev ? {
                      ...prev,
                      preferences: { ...prev.preferences, language: value }
                    } : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={settings.preferences.currency}
                  onValueChange={(value) =>
                    setSettings(prev => prev ? {
                      ...prev,
                      preferences: { ...prev.preferences, currency: value }
                    } : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="number-format">Number Format</Label>
                <Select
                  value={settings.preferences.numberFormat}
                  onValueChange={(value) =>
                    setSettings(prev => prev ? {
                      ...prev,
                      preferences: { ...prev.preferences, numberFormat: value }
                    } : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {numberFormats.map((format) => (
                      <SelectItem key={format} value={format}>
                        {format}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
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
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <Button onClick={handleChangePassword} disabled={saving || !currentPassword || !newPassword || !confirmPassword}>
            <Lock className="mr-2 h-4 w-4" />
            {saving ? "Changing..." : "Change Password"}
          </Button>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DatabaseIcon className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>Manage your system data and exports</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-backup">Auto Backup</Label>
                <Switch
                  id="auto-backup"
                  checked={settings.data.autoBackup}
                  onCheckedChange={(checked) =>
                    setSettings(prev => prev ? {
                      ...prev,
                      data: { ...prev.data, autoBackup: checked }
                    } : null)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="data-archiving">Data Archiving</Label>
                <Switch
                  id="data-archiving"
                  checked={settings.data.dataArchiving}
                  onCheckedChange={(checked) =>
                    setSettings(prev => prev ? {
                      ...prev,
                      data: { ...prev.data, dataArchiving: checked }
                    } : null)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="real-time-sync">Real-time Sync</Label>
                <Switch
                  id="real-time-sync"
                  checked={settings.data.realTimeSync}
                  onCheckedChange={(checked) =>
                    setSettings(prev => prev ? {
                      ...prev,
                      data: { ...prev.data, realTimeSync: checked }
                    } : null)
                  }
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="export-format">Export Format</Label>
                <Select
                  value={settings.data.exportFormat}
                  onValueChange={(value: 'csv' | 'json' | 'pdf' | 'xml') =>
                    setSettings(prev => prev ? {
                      ...prev,
                      data: { ...prev.data, exportFormat: value }
                    } : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="xml">XML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleExportData} disabled={exporting} variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                {exporting ? "Exporting..." : "Export Admin Data"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
