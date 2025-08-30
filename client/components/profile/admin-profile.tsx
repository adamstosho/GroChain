"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "@/lib/api"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface AdminProfileData {
  _id: string
  admin: string
  employeeId: string
  department: string
  position: string
  accessLevel: string
  permissions: string[]
  officeLocation: {
    address: string
    city: string
    state: string
    coordinates: {
      latitude: number
      longitude: number
    }
  }
  contactInfo: {
    workPhone: string
    extension: string
    emergencyContact: string
    emergencyPhone: string
  }
  preferences: {
    preferredCommunicationMethod: string
    preferredReportFormat: string
    dashboardLayout: string
    notificationPreferences: string[]
  }
  settings: {
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
    twoFactorAuth: boolean
    sessionTimeout: number
    privacyLevel: string
  }
  verificationStatus: string
  verificationDocuments: Array<{
    type: string
    url: string
    verified: boolean
    uploadedAt: Date
  }>
  performanceMetrics: {
    totalUsersManaged: number
    totalReportsGenerated: number
    averageResponseTime: number
    systemUptime: number
    userSatisfaction: number
  }
  isActive: boolean
  lastActivity: Date
  createdAt: Date
  updatedAt: Date
}

export function AdminProfile() {
  const [profile, setProfile] = useState<AdminProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<AdminProfileData>>({})
  const { toast } = useToast()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getAdminProfile()
      setProfile(response.data)
      setEditData(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch profile data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      await apiService.updateAdminProfile(editData)
      await fetchProfile()
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditData(profile || {})
    setIsEditing(false)
  }

  const handleInputChange = (field: string, value: any) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setEditData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: value
      }
    }))
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No profile data found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Profile</h1>
          <p className="text-muted-foreground">
            Manage your administrative profile and system access
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} disabled={isLoading}>
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Your employment and role details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              {isEditing ? (
                <Input
                  id="employeeId"
                  value={editData.employeeId || ""}
                  onChange={(e) => handleInputChange("employeeId", e.target.value)}
                />
              ) : (
                <p className="text-sm">{profile.employeeId || "Not specified"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              {isEditing ? (
                <select
                  id="department"
                  className="w-full p-2 border rounded-md"
                  value={editData.department || ""}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                >
                  <option value="">Select department</option>
                  <option value="it">Information Technology</option>
                  <option value="operations">Operations</option>
                  <option value="finance">Finance</option>
                  <option value="human_resources">Human Resources</option>
                  <option value="marketing">Marketing</option>
                  <option value="customer_support">Customer Support</option>
                  <option value="compliance">Compliance</option>
                  <option value="security">Security</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <p className="text-sm capitalize">{profile.department?.replace('_', ' ') || "Not specified"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              {isEditing ? (
                <select
                  id="position"
                  className="w-full p-2 border rounded-md"
                  value={editData.position || ""}
                  onChange={(e) => handleInputChange("position", e.target.value)}
                >
                  <option value="">Select position</option>
                  <option value="system_administrator">System Administrator</option>
                  <option value="database_administrator">Database Administrator</option>
                  <option value="network_administrator">Network Administrator</option>
                  <option value="security_administrator">Security Administrator</option>
                  <option value="operations_manager">Operations Manager</option>
                  <option value="team_lead">Team Lead</option>
                  <option value="senior_administrator">Senior Administrator</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <p className="text-sm capitalize">{profile.position?.replace('_', ' ') || "Not specified"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessLevel">Access Level</Label>
              {isEditing ? (
                <select
                  id="accessLevel"
                  className="w-full p-2 border rounded-md"
                  value={editData.accessLevel || ""}
                  onChange={(e) => handleInputChange("accessLevel", e.target.value)}
                >
                  <option value="">Select level</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="support">Support</option>
                  <option value="viewer">Viewer</option>
                </select>
              ) : (
                <p className="text-sm capitalize">{profile.accessLevel?.replace('_', ' ') || "Not specified"}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Office Location */}
        <Card>
          <CardHeader>
            <CardTitle>Office Location</CardTitle>
            <CardDescription>Your work location details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              {isEditing ? (
                <Textarea
                  id="address"
                  value={editData.officeLocation?.address || ""}
                  onChange={(e) => handleNestedChange("officeLocation", "address", e.target.value)}
                />
              ) : (
                <p className="text-sm">{profile.officeLocation?.address || "Not specified"}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                {isEditing ? (
                  <Input
                    id="city"
                    value={editData.officeLocation?.city || ""}
                    onChange={(e) => handleNestedChange("officeLocation", "city", e.target.value)}
                  />
                ) : (
                  <p className="text-sm">{profile.officeLocation?.city || "Not specified"}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                {isEditing ? (
                  <Input
                    id="state"
                    value={editData.officeLocation?.state || ""}
                    onChange={(e) => handleNestedChange("officeLocation", "state", e.target.value)}
                  />
                ) : (
                  <p className="text-sm">{profile.officeLocation?.state || "Not specified"}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Your work contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workPhone">Work Phone</Label>
              {isEditing ? (
                <Input
                  id="workPhone"
                  value={editData.contactInfo?.workPhone || ""}
                  onChange={(e) => handleNestedChange("contactInfo", "workPhone", e.target.value)}
                />
              ) : (
                <p className="text-sm">{profile.contactInfo?.workPhone || "Not specified"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="extension">Extension</Label>
              {isEditing ? (
                <Input
                  id="extension"
                  value={editData.contactInfo?.extension || ""}
                  onChange={(e) => handleNestedChange("contactInfo", "extension", e.target.value)}
                />
              ) : (
                <p className="text-sm">{profile.contactInfo?.extension || "Not specified"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              {isEditing ? (
                <Input
                  id="emergencyContact"
                  value={editData.contactInfo?.emergencyContact || ""}
                  onChange={(e) => handleNestedChange("contactInfo", "emergencyContact", e.target.value)}
                />
              ) : (
                <p className="text-sm">{profile.contactInfo?.emergencyContact || "Not specified"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Emergency Phone</Label>
              {isEditing ? (
                <Input
                  id="emergencyPhone"
                  value={editData.contactInfo?.emergencyPhone || ""}
                  onChange={(e) => handleNestedChange("contactInfo", "emergencyPhone", e.target.value)}
                />
              ) : (
                <p className="text-sm">{profile.contactInfo?.emergencyPhone || "Not specified"}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Permissions and Access */}
        <Card>
          <CardHeader>
            <CardTitle>Permissions & Access</CardTitle>
            <CardDescription>Your system access permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>System Permissions</Label>
              {isEditing ? (
                <div className="space-y-2">
                  {['user_management', 'system_configuration', 'data_management', 'security_settings', 'reporting', 'audit_logs', 'backup_restore', 'api_access', 'database_admin', 'network_admin'].map((permission) => (
                    <label key={permission} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editData.permissions?.includes(permission) || false}
                        onChange={(e) => {
                          const current = editData.permissions || []
                          if (e.target.checked) {
                            handleInputChange("permissions", [...current, permission])
                          } else {
                            handleInputChange("permissions", current.filter(p => p !== permission))
                          }
                        }}
                      />
                      <span className="text-sm capitalize">{permission.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.permissions?.map((permission) => (
                    <Badge key={permission} variant="secondary" className="capitalize">
                      {permission.replace('_', ' ')}
                    </Badge>
                  )) || <p className="text-sm text-muted-foreground">No permissions specified</p>}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Your administrative performance statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {profile.performanceMetrics?.totalUsersManaged || 0}
                </p>
                <p className="text-sm text-muted-foreground">Users Managed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {profile.performanceMetrics?.totalReportsGenerated || 0}
                </p>
                <p className="text-sm text-muted-foreground">Reports Generated</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {profile.performanceMetrics?.averageResponseTime || 0}ms
                </p>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {profile.performanceMetrics?.systemUptime || 0}%
                </p>
                <p className="text-sm text-muted-foreground">System Uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Status */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Status</CardTitle>
            <CardDescription>Your account verification details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Badge
                variant={
                  profile.verificationStatus === "verified" ? "default" :
                  profile.verificationStatus === "pending" ? "secondary" : "destructive"
                }
              >
                {profile.verificationStatus?.charAt(0).toUpperCase() + profile.verificationStatus?.slice(1) || "Pending"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {profile.verificationStatus === "verified" ? "✓ Verified" :
                 profile.verificationStatus === "pending" ? "⏳ Pending Review" : "❌ Rejected"}
              </span>
            </div>

            {profile.verificationDocuments && profile.verificationDocuments.length > 0 && (
              <div className="space-y-2">
                <Label>Verification Documents</Label>
                <div className="space-y-2">
                  {profile.verificationDocuments.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm capitalize">{doc.type}</span>
                      <Badge variant={doc.verified ? "default" : "secondary"}>
                        {doc.verified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preferences and Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences & Settings</CardTitle>
          <CardDescription>Customize your administrative experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Communication Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Communication Preferences</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    checked={editData.settings?.emailNotifications || false}
                    onChange={(e) => handleNestedChange("settings", "emailNotifications", e.target.checked)}
                    disabled={!isEditing}
                  />
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="smsNotifications"
                    checked={editData.settings?.smsNotifications || false}
                    onChange={(e) => handleNestedChange("settings", "smsNotifications", e.target.checked)}
                    disabled={!isEditing}
                  />
                  <Label htmlFor="smsNotifications">SMS Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="pushNotifications"
                    checked={editData.settings?.pushNotifications || false}
                    onChange={(e) => handleNestedChange("settings", "pushNotifications", e.target.checked)}
                    disabled={!isEditing}
                  />
                  <Label htmlFor="pushNotifications">Push Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="twoFactorAuth"
                    checked={editData.settings?.twoFactorAuth || false}
                    onChange={(e) => handleNestedChange("settings", "twoFactorAuth", e.target.checked)}
                    disabled={!isEditing}
                  />
                  <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                </div>
              </div>
            </div>

            {/* System Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">System Preferences</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="preferredCommunicationMethod">Preferred Communication</Label>
                  {isEditing ? (
                    <select
                      id="preferredCommunicationMethod"
                      className="w-full p-2 border rounded-md"
                      value={editData.preferences?.preferredCommunicationMethod || ""}
                      onChange={(e) => handleNestedChange("preferences", "preferredCommunicationMethod", e.target.value)}
                    >
                      <option value="">Select method</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="video_call">Video Call</option>
                      <option value="in_person">In Person</option>
                      <option value="chat">Chat</option>
                    </select>
                  ) : (
                    <p className="text-sm capitalize">
                      {profile.preferences?.preferredCommunicationMethod?.replace('_', ' ') || "Not specified"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredReportFormat">Report Format</Label>
                  {isEditing ? (
                    <select
                      id="preferredReportFormat"
                      className="w-full p-2 border rounded-md"
                      value={editData.preferences?.preferredReportFormat || ""}
                      onChange={(e) => handleNestedChange("preferences", "preferredReportFormat", e.target.value)}
                    >
                      <option value="">Select format</option>
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                      <option value="word">Word</option>
                      <option value="powerpoint">PowerPoint</option>
                      <option value="web_dashboard">Web Dashboard</option>
                    </select>
                  ) : (
                    <p className="text-sm capitalize">
                      {profile.preferences?.preferredReportFormat?.replace('_', ' ') || "Not specified"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dashboardLayout">Dashboard Layout</Label>
                  {isEditing ? (
                    <select
                      id="dashboardLayout"
                      className="w-full p-2 border rounded-md"
                      value={editData.preferences?.dashboardLayout || ""}
                      onChange={(e) => handleNestedChange("preferences", "dashboardLayout", e.target.value)}
                    >
                      <option value="">Select layout</option>
                      <option value="compact">Compact</option>
                      <option value="detailed">Detailed</option>
                      <option value="minimal">Minimal</option>
                      <option value="custom">Custom</option>
                    </select>
                  ) : (
                    <p className="text-sm capitalize">{profile.preferences?.dashboardLayout || "Not specified"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  {isEditing ? (
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={editData.settings?.sessionTimeout || ""}
                      onChange={(e) => handleNestedChange("settings", "sessionTimeout", Number(e.target.value))}
                    />
                  ) : (
                    <p className="text-sm">{profile.settings?.sessionTimeout || "Not specified"} minutes</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

