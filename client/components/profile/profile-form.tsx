"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "@/lib/api"
import { useAuthStore } from "@/lib/auth"
import { 
  User, 
  MapPin, 
  Building, 
  Save,
  Edit,
  Camera,
  AlertCircle
} from "lucide-react"

interface PartnerProfile {
  _id: string
  name: string
  email: string
  phone: string
  role: "partner"
  status: "active" | "inactive" | "suspended"
  organization: string
  organizationType: "cooperative" | "ngo" | "extension_agency" | "market_association" | "other"
  address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  website?: string
  description?: string
  logo?: string
  contactPerson: {
    name: string
    position: string
    phone: string
    email: string
  }
  services: string[]
  coverageAreas: string[]
  certifications: string[]
  createdAt: Date
  updatedAt: Date
}

export function ProfileForm() {
  const { user, updateUser } = useAuthStore()
  const { toast } = useToast()
  const [profile, setProfile] = useState<PartnerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      // For now, create a mock profile based on the current user
      // This will be replaced with actual API call when backend is ready
      const mockProfile: PartnerProfile = {
        _id: user?._id || "mock-id",
        name: user?.name || "Partner Name",
        email: user?.email || "partner@example.com",
        phone: user?.phone || "+234 800 000 0000",
        role: "partner",
        status: "active",
        organization: "Sample Organization",
        organizationType: "cooperative",
        address: {
          street: "123 Main Street",
          city: "Lagos",
          state: "Lagos",
          postalCode: "100001",
          country: "Nigeria"
        },
        website: "https://example.com",
        description: "A leading agricultural cooperative organization",
        logo: "",
        contactPerson: {
          name: "John Doe",
          position: "Manager",
          phone: "+234 800 000 0001",
          email: "john@example.com"
        },
        services: ["training", "extension", "marketing"],
        coverageAreas: ["Lagos", "Ogun", "Oyo"],
        certifications: ["ISO 9001", "Organic Certified"],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      setProfile(mockProfile)
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!profile) return

    try {
      setIsSaving(true)
      // For now, just update the local state
      // This will be replaced with actual API call when backend is ready
      setProfile({ ...profile, updatedAt: new Date() })
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
        variant: "default"
      })
      setIsEditing(false)
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-lg font-medium">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Profile not found</h3>
        <p className="text-muted-foreground">Unable to load your profile information.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.logo} alt={profile.name} />
              <AvatarFallback className="text-2xl">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl">{profile.name}</CardTitle>
              <CardDescription className="text-lg">
                {profile.organization} • {profile.organizationType.replace('_', ' ')}
              </CardDescription>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={profile.status === 'active' ? 'default' : 'secondary'}>
                  {profile.status}
                </Badge>
                <Badge variant="outline">
                  Partner since {new Date(profile.createdAt).getFullYear()}
                </Badge>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
              {isEditing && (
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={profile.website || ''}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                disabled={!isEditing}
                placeholder="https://example.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={profile.description || ''}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
              disabled={!isEditing}
              placeholder="Tell us about your organization..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                value={profile.address.street}
                onChange={(e) => setProfile({
                  ...profile,
                  address: { ...profile.address, street: e.target.value }
                })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={profile.address.city}
                onChange={(e) => setProfile({
                  ...profile,
                  address: { ...profile.address, city: e.target.value }
                })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={profile.address.state}
                onChange={(e) => setProfile({
                  ...profile,
                  address: { ...profile.address, state: e.target.value }
                })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={profile.address.postalCode}
                onChange={(e) => setProfile({
                  ...profile,
                  address: { ...profile.address, postalCode: e.target.value }
                })}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Organization Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organization">Organization Name</Label>
              <Input
                id="organization"
                value={profile.organization}
                onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organizationType">Organization Type</Label>
              <Select
                value={profile.organizationType}
                onValueChange={(value: any) => setProfile({ ...profile, organizationType: value })}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cooperative">Cooperative</SelectItem>
                  <SelectItem value="ngo">NGO</SelectItem>
                  <SelectItem value="extension_agency">Extension Agency</SelectItem>
                  <SelectItem value="market_association">Market Association</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Contact Person</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Name</Label>
                <Input
                  id="contactName"
                  value={profile.contactPerson.name}
                  onChange={(e) => setProfile({
                    ...profile,
                    contactPerson: { ...profile.contactPerson, name: e.target.value }
                  })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPosition">Position</Label>
                <Input
                  id="contactPosition"
                  value={profile.contactPerson.position}
                  onChange={(e) => setProfile({
                    ...profile,
                    contactPerson: { ...profile.contactPerson, position: e.target.value }
                  })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone</Label>
                <Input
                  id="contactPhone"
                  value={profile.contactPerson.phone}
                  onChange={(e) => setProfile({
                    ...profile,
                    contactPerson: { ...profile.contactPerson, phone: e.target.value }
                  })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={profile.contactPerson.email}
                  onChange={(e) => setProfile({
                    ...profile,
                    contactPerson: { ...profile.contactPerson, email: e.target.value }
                  })}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Services & Coverage</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Services Offered</Label>
                <div className="space-y-2">
                  {['Training', 'Extension', 'Marketing', 'Finance', 'Technology'].map((service) => (
                    <div key={service} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={service}
                        checked={profile.services.includes(service.toLowerCase())}
                        onChange={(e) => {
                          const newServices = e.target.checked
                            ? [...profile.services, service.toLowerCase()]
                            : profile.services.filter(s => s !== service.toLowerCase())
                          setProfile({ ...profile, services: newServices })
                        }}
                        disabled={!isEditing}
                      />
                      <Label htmlFor={service}>{service}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Coverage Areas</Label>
                <Textarea
                  value={profile.coverageAreas.join(', ')}
                  onChange={(e) => setProfile({
                    ...profile,
                    coverageAreas: e.target.value.split(',').map(area => area.trim()).filter(Boolean)
                  })}
                  disabled={!isEditing}
                  placeholder="Enter coverage areas separated by commas"
                  rows={4}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
