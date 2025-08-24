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
  Users,
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Target,
  TrendingUp,
  FileText,
  Save,
  Loader2,
  Plus,
  Trash2,
  Edit,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

interface PartnerProfile {
  id: string
  name: string
  email: string
  phone: string
  organization: string
  address: string
  state: string
  lga: string
  website: string
  description: string
  services: string[]
  targetRegions: string[]
  commissionRate: number
  status: string
  verified: boolean
}

interface PartnerSettings {
  notifications: {
    newFarmers: boolean
    harvestUpdates: boolean
    marketOpportunities: boolean
    commissionPayments: boolean
    systemUpdates: boolean
  }
  dashboard: {
    defaultView: string
    refreshInterval: number
    showAnalytics: boolean
    compactMode: boolean
  }
  farmerManagement: {
    autoApprove: boolean
    requireVerification: boolean
    maxFarmers: number
    allowBulkUpload: boolean
  }
}

export function PartnerSettingsPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Partner profile state
  const [profile, setProfile] = useState<PartnerProfile>({
    id: "",
    name: "",
    email: "",
    phone: "",
    organization: "",
    address: "",
    state: "",
    lga: "",
    website: "",
    description: "",
    services: [],
    targetRegions: [],
    commissionRate: 0,
    status: "",
    verified: false
  })

  // Partner settings state
  const [settings, setSettings] = useState<PartnerSettings>({
    notifications: {
      newFarmers: true,
      harvestUpdates: true,
      marketOpportunities: true,
      commissionPayments: true,
      systemUpdates: true
    },
    dashboard: {
      defaultView: "overview",
      refreshInterval: 5,
      showAnalytics: true,
      compactMode: false
    },
    farmerManagement: {
      autoApprove: false,
      requireVerification: true,
      maxFarmers: 1000,
      allowBulkUpload: true
    }
  })

  // New service/region state
  const [newService, setNewService] = useState("")
  const [newRegion, setNewRegion] = useState("")

  // Load partner data on component mount
  useEffect(() => {
    if (user) {
      loadPartnerData()
    }
  }, [user])

  const loadPartnerData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Load partner profile
      const profileResponse = await api.get(`/api/partner-settings/profile/me`)
      if (profileResponse.data.status === 'success') {
        setProfile(profileResponse.data.data)
      }

      // Load partner settings
      const settingsResponse = await api.get(`/api/partner-settings/settings/me`)
      if (settingsResponse.data.status === 'success') {
        setSettings(settingsResponse.data.data)
      }
    } catch (error) {
      console.error('Error loading partner data:', error)
      toast({
        title: "Error",
        description: "Failed to load partner data",
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
      const response = await api.put(`/api/partner-settings/profile/me`, {
        name: profile.name,
        phone: profile.phone,
        organization: profile.organization,
        address: profile.address,
        state: profile.state,
        lga: profile.lga,
        website: profile.website,
        description: profile.description,
        services: profile.services,
        targetRegions: profile.targetRegions,
        commissionRate: profile.commissionRate
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

  const handleSettingsSave = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      const response = await api.put(`/api/partner-settings/settings/me`, settings)

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

  const addService = () => {
    if (newService.trim() && !profile.services.includes(newService.trim())) {
      setProfile({
        ...profile,
        services: [...profile.services, newService.trim()]
      })
      setNewService("")
    }
  }

  const removeService = (service: string) => {
    setProfile({
      ...profile,
      services: profile.services.filter(s => s !== service)
    })
  }

  const addRegion = () => {
    if (newRegion.trim() && !profile.targetRegions.includes(newRegion.trim())) {
      setProfile({
        ...profile,
        targetRegions: [...profile.targetRegions, newRegion.trim()]
      })
      setNewRegion("")
    }
  }

  const removeRegion = (region: string) => {
    setProfile({
      ...profile,
      targetRegions: profile.targetRegions.filter(r => r !== region)
    })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading partner settings...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Partner Settings</h1>
            <p className="text-muted-foreground">
              Manage your partner organization settings and preferences
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Organization
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Services & Regions
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* Organization Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization Name</Label>
                    <Input
                      id="organization"
                      value={profile.organization}
                      onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                      placeholder="Enter organization name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Contact Person</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      placeholder="Enter contact person name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profile.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select value={profile.state} onValueChange={(value) => setProfile({ ...profile, state: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lagos">Lagos</SelectItem>
                        <SelectItem value="Kano">Kano</SelectItem>
                        <SelectItem value="Kaduna">Kaduna</SelectItem>
                        <SelectItem value="Katsina">Katsina</SelectItem>
                        <SelectItem value="Oyo">Oyo</SelectItem>
                        <SelectItem value="Rivers">Rivers</SelectItem>
                        <SelectItem value="Bauchi">Bauchi</SelectItem>
                        <SelectItem value="Jigawa">Jigawa</SelectItem>
                        <SelectItem value="Enugu">Enugu</SelectItem>
                        <SelectItem value="Zamfara">Zamfara</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lga">LGA</Label>
                    <Input
                      id="lga"
                      value={profile.lga}
                      onChange={(e) => setProfile({ ...profile, lga: e.target.value })}
                      placeholder="Enter LGA"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    placeholder="Enter full address"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={profile.website}
                      onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                      placeholder="Enter website URL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                    <Input
                      id="commissionRate"
                      type="number"
                      value={profile.commissionRate}
                      onChange={(e) => setProfile({ ...profile, commissionRate: parseFloat(e.target.value) || 0 })}
                      placeholder="Enter commission rate"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Organization Description</Label>
                  <Textarea
                    id="description"
                    value={profile.description}
                    onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                    placeholder="Describe your organization and services"
                    rows={4}
                  />
                </div>
                <Button onClick={handleProfileSave} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Organization Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services & Regions Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Services Offered</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Add New Service</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      placeholder="Enter service name"
                      onKeyPress={(e) => e.key === 'Enter' && addService()}
                    />
                    <Button onClick={addService} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Current Services</Label>
                  <div className="flex flex-wrap gap-2">
                    {profile.services.map((service, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {service}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeService(service)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                    {profile.services.length === 0 && (
                      <p className="text-sm text-muted-foreground">No services added yet</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Target Regions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Add New Region</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newRegion}
                      onChange={(e) => setNewRegion(e.target.value)}
                      placeholder="Enter region name"
                      onKeyPress={(e) => e.key === 'Enter' && addRegion()}
                    />
                    <Button onClick={addRegion} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Current Target Regions</Label>
                  <div className="flex flex-wrap gap-2">
                    {profile.targetRegions.map((region, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {region}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeRegion(region)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                    {profile.targetRegions.length === 0 && (
                      <p className="text-sm text-muted-foreground">No target regions added yet</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Farmers</Label>
                      <p className="text-sm text-muted-foreground">Get notified when new farmers register</p>
                    </div>
                    <Switch
                      checked={settings.notifications.newFarmers}
                      onCheckedChange={(checked) => setSettings({ ...settings, notifications: { ...settings.notifications, newFarmers: checked } })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Harvest Updates</Label>
                      <p className="text-sm text-muted-foreground">Get notified about harvest activities</p>
                    </div>
                    <Switch
                      checked={settings.notifications.harvestUpdates}
                      onCheckedChange={(checked) => setSettings({ ...settings, notifications: { ...settings.notifications, harvestUpdates: checked } })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Market Opportunities</Label>
                      <p className="text-sm text-muted-foreground">Get notified about market opportunities</p>
                    </div>
                    <Switch
                      checked={settings.notifications.marketOpportunities}
                      onCheckedChange={(checked) => setSettings({ ...settings, notifications: { ...settings.notifications, marketOpportunities: checked } })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Commission Payments</Label>
                      <p className="text-sm text-muted-foreground">Get notified about commission payments</p>
                    </div>
                    <Switch
                      checked={settings.notifications.commissionPayments}
                      onCheckedChange={(checked) => setSettings({ ...settings, notifications: { ...settings.notifications, commissionPayments: checked } })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dashboard Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Default View</Label>
                    <Select value={settings.dashboard.defaultView} onValueChange={(value) => setSettings({ ...settings, dashboard: { ...settings.dashboard, defaultView: value } })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="overview">Overview</SelectItem>
                        <SelectItem value="farmers">Farmers</SelectItem>
                        <SelectItem value="harvests">Harvests</SelectItem>
                        <SelectItem value="analytics">Analytics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Refresh Interval (minutes)</Label>
                    <Select value={settings.dashboard.refreshInterval.toString()} onValueChange={(value) => setSettings({ ...settings, dashboard: { ...settings.dashboard, refreshInterval: parseInt(value) } })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 minute</SelectItem>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Analytics</Label>
                      <p className="text-sm text-muted-foreground">Display analytics and charts on dashboard</p>
                    </div>
                    <Switch
                      checked={settings.dashboard.showAnalytics}
                      onCheckedChange={(checked) => setSettings({ ...settings, dashboard: { ...settings.dashboard, showAnalytics: checked } })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Compact Mode</Label>
                      <p className="text-sm text-muted-foreground">Use compact layout for dashboard</p>
                    </div>
                    <Switch
                      checked={settings.dashboard.compactMode}
                      onCheckedChange={(checked) => setSettings({ ...settings, dashboard: { ...settings.dashboard, compactMode: checked } })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Farmer Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-approve Farmers</Label>
                      <p className="text-sm text-muted-foreground">Automatically approve new farmer registrations</p>
                    </div>
                    <Switch
                      checked={settings.farmerManagement.autoApprove}
                      onCheckedChange={(checked) => setSettings({ ...settings, farmerManagement: { ...settings.farmerManagement, autoApprove: checked } })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Verification</Label>
                      <p className="text-sm text-muted-foreground">Require identity verification for farmers</p>
                    </div>
                    <Switch
                      checked={settings.farmerManagement.requireVerification}
                      onCheckedChange={(checked) => setSettings({ ...settings, farmerManagement: { ...settings.farmerManagement, requireVerification: checked } })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Maximum Farmers</Label>
                    <Input
                      type="number"
                      value={settings.farmerManagement.maxFarmers}
                      onChange={(e) => setSettings({ ...settings, farmerManagement: { ...settings.farmerManagement, maxFarmers: parseInt(e.target.value) || 0 } })}
                      placeholder="Enter maximum number of farmers"
                      min="1"
                      max="10000"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Bulk Upload</Label>
                      <p className="text-sm text-muted-foreground">Allow bulk farmer registration via CSV</p>
                    </div>
                    <Switch
                      checked={settings.farmerManagement.allowBulkUpload}
                      onCheckedChange={(checked) => setSettings({ ...settings, farmerManagement: { ...settings.farmerManagement, allowBulkUpload: checked } })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSettingsSave} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Preferences
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
