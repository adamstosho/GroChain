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
  Save,
  Loader2,
  MapPin,
  Leaf,
  Calendar,
  DollarSign,
  FileText,
  Plus,
  Trash2,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

interface FarmerProfile {
  id: string
  name: string
  email: string
  phone: string
  role: string
  status: string
  partner: string
  location: {
    state: string
    lga: string
    address: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  farmDetails: {
    farmSize: number
    farmSizeUnit: string
    primaryCrops: string[]
    irrigationType: string
    soilType: string
    farmingExperience: string
    education: string
    householdSize: number
    annualIncome: number
  }
  verification: {
    email: boolean
    phone: boolean
    identity: boolean
    location: boolean
    farm: boolean
  }
}

interface FarmerPreferences {
  theme: "light" | "dark" | "system"
  language: string
  notifications: {
    sms: boolean
    email: boolean
    push: boolean
    harvest: boolean
    marketplace: boolean
    weather: boolean
    training: boolean
    financial: boolean
  }
  privacy: {
    profileVisibility: "public" | "private" | "friends"
    dataSharing: boolean
    locationSharing: boolean
    financialSharing: boolean
  }
}

interface FarmerSettings {
  farming: {
    defaultCrop: string
    harvestReminders: boolean
    weatherAlerts: boolean
    pestAlerts: boolean
    marketPriceAlerts: boolean
  }
  financial: {
    autoSave: boolean
    savingsGoal: number
    investmentPreferences: string[]
    riskTolerance: "low" | "medium" | "high"
  }
  learning: {
    showTutorials: boolean
    trainingReminders: boolean
    preferredTopics: string[]
    learningStyle: "visual" | "audio" | "text" | "hands-on"
  }
}

export function FarmerSettingsPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Farmer profile state
  const [profile, setProfile] = useState<FarmerProfile>({
    id: "",
    name: "",
    email: "",
    phone: "",
    role: "",
    status: "",
    partner: "",
    location: {
      state: "",
      lga: "",
      address: "",
      coordinates: {
        lat: 0,
        lng: 0
      }
    },
    farmDetails: {
      farmSize: 0,
      farmSizeUnit: "acres",
      primaryCrops: [],
      irrigationType: "",
      soilType: "",
      farmingExperience: "",
      education: "",
      householdSize: 0,
      annualIncome: 0
    },
    verification: {
      email: false,
      phone: false,
      identity: false,
      location: false,
      farm: false
    }
  })

  // Farmer preferences state
  const [preferences, setPreferences] = useState<FarmerPreferences>({
    theme: "light",
    language: "en",
    notifications: {
      sms: true,
      email: true,
      push: false,
      harvest: true,
      marketplace: true,
      weather: true,
      training: true,
      financial: true
    },
    privacy: {
      profileVisibility: "public",
      dataSharing: true,
      locationSharing: false,
      financialSharing: false
    }
  })

  // Farmer settings state
  const [settings, setSettings] = useState<FarmerSettings>({
    farming: {
      defaultCrop: "",
      harvestReminders: true,
      weatherAlerts: true,
      pestAlerts: true,
      marketPriceAlerts: true
    },
    financial: {
      autoSave: true,
      savingsGoal: 0,
      investmentPreferences: [],
      riskTolerance: "medium"
    },
    learning: {
      showTutorials: true,
      trainingReminders: true,
      preferredTopics: [],
      learningStyle: "visual"
    }
  })

  // New crop/topic state
  const [newCrop, setNewCrop] = useState("")
  const [newTopic, setNewTopic] = useState("")

  // Load farmer data on component mount
  useEffect(() => {
    if (user) {
      loadFarmerData()
    }
  }, [user])

  const loadFarmerData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Load farmer profile
      const profileResponse = await api.get(`/api/farmers/profile/me`)
      if (profileResponse.data.status === 'success') {
        setProfile(profileResponse.data.data)
      }

      // Load farmer preferences
      const preferencesResponse = await api.get(`/api/farmers/preferences/me`)
      if (preferencesResponse.data.status === 'success') {
        setPreferences(preferencesResponse.data.data)
      }

      // Load farmer settings
      const settingsResponse = await api.get(`/api/farmers/settings/me`)
      if (settingsResponse.data.status === 'success') {
        setSettings(settingsResponse.data.data)
      }
    } catch (error) {
      console.error('Error loading farmer data:', error)
      toast({
        title: "Error",
        description: "Failed to load farmer data",
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
      const response = await api.put(`/api/farmers/profile/me`, {
        name: profile.name,
        phone: profile.phone,
        location: profile.location,
        farmDetails: profile.farmDetails
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
      const response = await api.put(`/api/farmers/preferences/me`, {
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
      const response = await api.put(`/api/farmers/settings/me`, settings)

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

  const addCrop = () => {
    if (newCrop.trim() && !profile.farmDetails.primaryCrops.includes(newCrop.trim())) {
      setProfile({
        ...profile,
        farmDetails: {
          ...profile.farmDetails,
          primaryCrops: [...profile.farmDetails.primaryCrops, newCrop.trim()]
        }
      })
      setNewCrop("")
    }
  }

  const removeCrop = (crop: string) => {
    setProfile({
      ...profile,
      farmDetails: {
        ...profile.farmDetails,
        primaryCrops: profile.farmDetails.primaryCrops.filter(c => c !== crop)
      }
    })
  }

  const addTopic = () => {
    if (newTopic.trim() && !settings.learning.preferredTopics.includes(newTopic.trim())) {
      setSettings({
        ...settings,
        learning: {
          ...settings.learning,
          preferredTopics: [...settings.learning.preferredTopics, newTopic.trim()]
        }
      })
      setNewTopic("")
    }
  }

  const removeTopic = (topic: string) => {
    setSettings({
      ...settings,
      learning: {
        ...settings.learning,
        preferredTopics: settings.learning.preferredTopics.filter(t => t !== topic)
      }
    })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading farmer settings...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Farmer Settings</h1>
            <p className="text-muted-foreground">
              Manage your farming profile and preferences
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="farm" className="flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Farm Details
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="farming" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Farming
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
                      {profile.verification.email ? (
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
                      {profile.verification.phone ? (
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
                    <Label htmlFor="education">Education Level</Label>
                    <Select value={profile.farmDetails.education} onValueChange={(value) => setProfile({ ...profile, farmDetails: { ...profile.farmDetails, education: value } })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Formal Education</SelectItem>
                        <SelectItem value="primary">Primary School</SelectItem>
                        <SelectItem value="secondary">Secondary School</SelectItem>
                        <SelectItem value="tertiary">Tertiary Education</SelectItem>
                        <SelectItem value="postgraduate">Postgraduate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience">Farming Experience</Label>
                    <Select value={profile.farmDetails.farmingExperience} onValueChange={(value) => setProfile({ ...profile, farmDetails: { ...profile.farmDetails, farmingExperience: value } })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (3-5 years)</SelectItem>
                        <SelectItem value="experienced">Experienced (6-10 years)</SelectItem>
                        <SelectItem value="expert">Expert (10+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="householdSize">Household Size</Label>
                    <Input
                      id="householdSize"
                      type="number"
                      value={profile.farmDetails.householdSize}
                      onChange={(e) => setProfile({ ...profile, farmDetails: { ...profile.farmDetails, householdSize: parseInt(e.target.value) || 0 } })}
                      placeholder="Number of family members"
                      min="1"
                      max="20"
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

          {/* Farm Details Tab */}
          <TabsContent value="farm" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Farm Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="farmSize">Farm Size</Label>
                    <div className="flex gap-2">
                      <Input
                        id="farmSize"
                        type="number"
                        value={profile.farmDetails.farmSize}
                        onChange={(e) => setProfile({ ...profile, farmDetails: { ...profile.farmDetails, farmSize: parseFloat(e.target.value) || 0 } })}
                        placeholder="Enter farm size"
                        min="0"
                        step="0.1"
                      />
                      <Select value={profile.farmDetails.farmSizeUnit} onValueChange={(value) => setProfile({ ...profile, farmDetails: { ...profile.farmDetails, farmSizeUnit: value } })}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="acres">Acres</SelectItem>
                          <SelectItem value="hectares">Hectares</SelectItem>
                          <SelectItem value="squareMeters">Square Meters</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="annualIncome">Annual Income (₦)</Label>
                    <Input
                      id="annualIncome"
                      type="number"
                      value={profile.farmDetails.annualIncome}
                      onChange={(e) => setProfile({ ...profile, farmDetails: { ...profile.farmDetails, annualIncome: parseInt(e.target.value) || 0 } })}
                      placeholder="Enter annual income"
                      min="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="irrigationType">Irrigation Type</Label>
                    <Select value={profile.farmDetails.irrigationType} onValueChange={(value) => setProfile({ ...profile, farmDetails: { ...profile.farmDetails, irrigationType: value } })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select irrigation type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rainfed">Rainfed</SelectItem>
                        <SelectItem value="drip">Drip Irrigation</SelectItem>
                        <SelectItem value="sprinkler">Sprinkler</SelectItem>
                        <SelectItem value="flood">Flood Irrigation</SelectItem>
                        <SelectItem value="none">No Irrigation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="soilType">Soil Type</Label>
                    <Select value={profile.farmDetails.soilType} onValueChange={(value) => setProfile({ ...profile, farmDetails: { ...profile.farmDetails, soilType: value } })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select soil type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clay">Clay</SelectItem>
                        <SelectItem value="loamy">Loamy</SelectItem>
                        <SelectItem value="sandy">Sandy</SelectItem>
                        <SelectItem value="silt">Silt</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Primary Crops</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newCrop}
                      onChange={(e) => setNewCrop(e.target.value)}
                      placeholder="Enter crop name"
                      onKeyPress={(e) => e.key === 'Enter' && addCrop()}
                    />
                    <Button onClick={addCrop} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.farmDetails.primaryCrops.map((crop, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {crop}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeCrop(crop)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                    {profile.farmDetails.primaryCrops.length === 0 && (
                      <p className="text-sm text-muted-foreground">No crops added yet</p>
                    )}
                  </div>
                </div>
                <Button onClick={handleProfileSave} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Farm Details
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select value={profile.location.state} onValueChange={(value) => setProfile({ ...profile, location: { ...profile.location, state: value } })}>
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
                      value={profile.location.lga}
                      onChange={(e) => setProfile({ ...profile, location: { ...profile.location, lga: e.target.value } })}
                      placeholder="Enter LGA"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Farm Address</Label>
                  <Textarea
                    id="address"
                    value={profile.location.address}
                    onChange={(e) => setProfile({ ...profile, location: { ...profile.location, address: e.target.value } })}
                    placeholder="Enter detailed farm address"
                    rows={3}
                  />
                </div>
                <Button onClick={handleProfileSave} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Location
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
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      <Label>Marketplace Updates</Label>
                      <p className="text-sm text-muted-foreground">Get notified about marketplace opportunities</p>
                    </div>
                    <Switch
                      checked={preferences.notifications.marketplace}
                      onCheckedChange={(checked) => setPreferences({ ...preferences, notifications: { ...preferences.notifications, marketplace: checked } })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weather Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified about weather conditions</p>
                    </div>
                    <Switch
                      checked={preferences.notifications.weather}
                      onCheckedChange={(checked) => setPreferences({ ...preferences, notifications: { ...preferences.notifications, weather: checked } })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Training Opportunities</Label>
                      <p className="text-sm text-muted-foreground">Get notified about training programs</p>
                    </div>
                    <Switch
                      checked={preferences.notifications.training}
                      onCheckedChange={(checked) => setPreferences({ ...preferences, notifications: { ...preferences.notifications, training: checked } })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      <Label>Location Sharing</Label>
                      <p className="text-sm text-muted-foreground">Share your farm location for better services</p>
                    </div>
                    <Switch
                      checked={preferences.privacy.locationSharing}
                      onCheckedChange={(checked) => setPreferences({ ...preferences, privacy: { ...preferences.privacy, locationSharing: checked } })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Financial Data Sharing</Label>
                      <p className="text-sm text-muted-foreground">Share financial data for credit scoring</p>
                    </div>
                    <Switch
                      checked={preferences.privacy.financialSharing}
                      onCheckedChange={(checked) => setPreferences({ ...preferences, privacy: { ...preferences.privacy, financialSharing: checked } })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handlePreferencesSave} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Preferences
            </Button>
          </TabsContent>

          {/* Farming Settings Tab */}
          <TabsContent value="farming" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Farming Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Default Crop</Label>
                    <Select value={settings.farming.defaultCrop} onValueChange={(value) => setSettings({ ...settings, farming: { ...settings.farming, defaultCrop: value } })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select default crop" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rice">Rice</SelectItem>
                        <SelectItem value="maize">Maize</SelectItem>
                        <SelectItem value="cassava">Cassava</SelectItem>
                        <SelectItem value="yam">Yam</SelectItem>
                        <SelectItem value="sorghum">Sorghum</SelectItem>
                        <SelectItem value="millet">Millet</SelectItem>
                        <SelectItem value="beans">Beans</SelectItem>
                        <SelectItem value="groundnut">Groundnut</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Harvest Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get reminders for harvest time</p>
                    </div>
                    <Switch
                      checked={settings.farming.harvestReminders}
                      onCheckedChange={(checked) => setSettings({ ...settings, farming: { ...settings.farming, harvestReminders: checked } })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weather Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get weather alerts for farming</p>
                    </div>
                    <Switch
                      checked={settings.farming.weatherAlerts}
                      onCheckedChange={(checked) => setSettings({ ...settings, farming: { ...settings.farming, weatherAlerts: checked } })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Pest Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get alerts about pest outbreaks</p>
                    </div>
                    <Switch
                      checked={settings.farming.pestAlerts}
                      onCheckedChange={(checked) => setSettings({ ...settings, farming: { ...settings.farming, pestAlerts: checked } })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Market Price Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get alerts about market price changes</p>
                    </div>
                    <Switch
                      checked={settings.farming.marketPriceAlerts}
                      onCheckedChange={(checked) => setSettings({ ...settings, farming: { ...settings.farming, marketPriceAlerts: checked } })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Tutorials</Label>
                      <p className="text-sm text-muted-foreground">Show farming tutorials and tips</p>
                    </div>
                    <Switch
                      checked={settings.learning.showTutorials}
                      onCheckedChange={(checked) => setSettings({ ...settings, learning: { ...settings.learning, showTutorials: checked } })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Training Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get reminders about training programs</p>
                    </div>
                    <Switch
                      checked={settings.learning.trainingReminders}
                      onCheckedChange={(checked) => setSettings({ ...settings, learning: { ...settings.learning, trainingReminders: checked } })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Learning Style</Label>
                    <Select value={settings.learning.learningStyle} onValueChange={(value) => setSettings({ ...settings, learning: { ...settings.learning, learningStyle: value as any } })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select learning style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visual">Visual (Videos, Images)</SelectItem>
                        <SelectItem value="audio">Audio (Podcasts, Radio)</SelectItem>
                        <SelectItem value="text">Text (Articles, Books)</SelectItem>
                        <SelectItem value="hands-on">Hands-on (Practical)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Topics</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        placeholder="Enter topic name"
                        onKeyPress={(e) => e.key === 'Enter' && addTopic()}
                      />
                      <Button onClick={addTopic} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {settings.learning.preferredTopics.map((topic, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {topic}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => removeTopic(topic)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                      {settings.learning.preferredTopics.length === 0 && (
                        <p className="text-sm text-muted-foreground">No topics added yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSettingsSave} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Farming Settings
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
