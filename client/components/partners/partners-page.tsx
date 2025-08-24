"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, UserPlus, Search, Filter, Eye, MapPin, Calendar, TrendingUp, Upload, Download, FileText, CheckCircle, XCircle, Loader2, AlertCircle, Plus, Trash2, Edit, Send, Phone, Mail, Globe, Building2 } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import Link from "next/link"
import { toast } from "sonner"

interface Partner {
  id: string
  name: string
  email: string
  phone: string
  location: string
  joinDate: string
  status: "active" | "pending" | "inactive"
  productsCount: number
  totalSales: number
  commission: number
  lastActive: string
}

const mockPartners: Partner[] = [
  {
    id: "1",
    name: "Adunni Adebayo",
    email: "adunni@example.com",
    phone: "+234 801 234 5678",
    location: "Lagos State",
    joinDate: "2025-01-15",
    status: "active",
    productsCount: 8,
    totalSales: 125000,
    commission: 6250,
    lastActive: "2025-01-16T10:30:00Z",
  },
  {
    id: "2",
    name: "Ibrahim Musa",
    email: "ibrahim@example.com",
    phone: "+234 802 345 6789",
    location: "Kano State",
    joinDate: "2025-01-12",
    status: "pending",
    productsCount: 0,
    totalSales: 0,
    commission: 0,
    lastActive: "2025-01-12T14:20:00Z",
  },
  {
    id: "3",
    name: "Grace Okafor",
    email: "grace@example.com",
    phone: "+234 803 456 7890",
    location: "Ogun State",
    joinDate: "2025-01-10",
    status: "active",
    productsCount: 12,
    totalSales: 180000,
    commission: 9000,
    lastActive: "2025-01-16T08:45:00Z",
  },
  {
    id: "4",
    name: "Chinedu Okwu",
    email: "chinedu@example.com",
    phone: "+234 804 567 8901",
    location: "Anambra State",
    joinDate: "2025-01-08",
    status: "inactive",
    productsCount: 5,
    totalSales: 45000,
    commission: 2250,
    lastActive: "2025-01-14T16:15:00Z",
  },
]

const mockStats = {
  totalPartners: 156,
  activePartners: 142,
  pendingPartners: 8,
  totalCommission: 45000,
}

export function PartnersPage() {
  const { user } = useAuth()

  const [partners, setPartners] = useState<Partner[]>(mockPartners)
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>(mockPartners)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("partners")
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false)
  const [uploadingCSV, setUploadingCSV] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvPreview, setCsvPreview] = useState<any[]>([])
  const [newPartner, setNewPartner] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    organization: '',
    role: '',
    notes: ''
  })
  const [addingPartner, setAddingPartner] = useState(false)

  useEffect(() => {
    let filtered = partners

    if (searchTerm) {
      filtered = filtered.filter(
        (partner) =>
          partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          partner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          partner.location.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((partner) => partner.status === statusFilter)
    }

    setFilteredPartners(filtered)
  }, [partners, searchTerm, statusFilter])

  const getStatusBadge = (status: Partner["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/csv') {
      setCsvFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const rows = text.split('\n').map(row => row.split(','))
        const headers = rows[0]
        const data = rows.slice(1).map(row => {
          const obj: any = {}
          headers.forEach((header, index) => {
            obj[header.trim()] = row[index]?.trim() || ''
          })
          return obj
        })
        setCsvPreview(data.slice(0, 5)) // Show first 5 rows
      }
      reader.readAsText(file)
    } else {
      toast.error("Please select a valid CSV file")
    }
  }

  const uploadPartnersCSV = async () => {
    if (!csvFile) return

    try {
      setUploadingCSV(true)
      const formData = new FormData()
      formData.append('csv', csvFile)

      const response = await api.uploadPartnersCSV(formData)
      
      if (response.success) {
        toast.success("Partners uploaded successfully!")
        setShowBulkUploadModal(false)
        setCsvFile(null)
        setCsvPreview([])
        // Refresh partners list
        // fetchPartners()
      } else {
        toast.error(response.error || "Failed to upload partners")
      }
    } catch (error) {
      console.error("CSV upload error:", error)
      toast.error("Failed to upload partners")
    } finally {
      setUploadingCSV(false)
    }
  }

  const addNewPartner = async () => {
    try {
      setAddingPartner(true)
      
      const response = await api.post("/api/partners", newPartner)
      
      if (response.success) {
        toast.success("Partner added successfully!")
        setShowAddPartnerModal(false)
        setNewPartner({
          name: '',
          email: '',
          phone: '',
          location: '',
          organization: '',
          role: '',
          notes: ''
        })
        // Refresh partners list
        // fetchPartners()
      } else {
        toast.error(response.error || "Failed to add partner")
      }
    } catch (error) {
      console.error("Add partner error:", error)
      toast.error("Failed to add partner")
    } finally {
      setAddingPartner(false)
    }
  }

  const sendInvitation = async (partnerId: string) => {
    try {
      const response = await api.post(`/api/partners/${partnerId}/invite`)
      
      if (response.success) {
        toast.success("Invitation sent successfully!")
      } else {
        toast.error(response.error || "Failed to send invitation")
      }
    } catch (error) {
      console.error("Send invitation error:", error)
      toast.error("Failed to send invitation")
    }
  }

  return (
    <DashboardLayout user={user as any}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Partner Management</h1>
            <p className="text-muted-foreground">Manage your farmer network and track performance</p>
          </div>
          <div className="flex gap-2">
            <Link href="/partners/bulk">
              <Button variant="outline" size="lg" className="bg-transparent">
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Button>
            </Link>
            <Link href="/partners/onboard">
              <Button size="lg">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Partner
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="partners">Partners</TabsTrigger>
            <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="partners" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Partners</p>
                        <p className="text-2xl font-bold text-foreground">{mockStats.totalPartners}</p>
                      </div>
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Partners</p>
                        <p className="text-2xl font-bold text-foreground">{mockStats.activePartners}</p>
                      </div>
                      <UserPlus className="w-8 h-8 text-success" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Pending</p>
                        <p className="text-2xl font-bold text-foreground">{mockStats.pendingPartners}</p>
                      </div>
                      <Users className="w-8 h-8 text-warning" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Commission</p>
                        <p className="text-2xl font-bold text-foreground">
                          ₦{mockStats.totalCommission.toLocaleString()}
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search partners by name, email, or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Partners List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-primary" />
                  Partners ({filteredPartners.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredPartners.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No partners found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || statusFilter !== "all"
                        ? "Try adjusting your search or filter criteria"
                        : "Start by onboarding your first partner"}
                    </p>
                    <Link href="/partners/onboard">
                      <Button>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Partner
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPartners.map((partner, index) => (
                      <motion.div
                        key={partner.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">{partner.name}</h4>
                            <p className="text-sm text-muted-foreground">{partner.email}</p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {partner.location}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(partner.joinDate).toLocaleDateString()}
                              </span>
                              <span>{partner.productsCount} products</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="font-medium text-foreground">₦{partner.commission.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">
                              ₦{partner.totalSales.toLocaleString()} sales
                            </p>
                            {getStatusBadge(partner.status)}
                          </div>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="onboarding" className="space-y-6">
            {/* Bulk Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Bulk Partner Onboarding
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">CSV Upload</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload a CSV file with partner information to onboard multiple partners at once.
                    </p>
                    <Button onClick={() => setShowBulkUploadModal(true)}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload CSV
                    </Button>
                    <div className="mt-2">
                      <a 
                        href="/farmers-template.csv" 
                        download 
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        Download CSV Template
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Single Partner</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add individual partners manually with detailed information.
                    </p>
                    <Button onClick={() => setShowAddPartnerModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Partner
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Onboarding Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Onboarding Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Partners</span>
                    <span className="font-medium">{mockStats.totalPartners}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Pending Verification</span>
                    <span className="font-medium text-yellow-600">{mockStats.pendingPartners}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Partners</span>
                    <span className="font-medium text-green-600">{mockStats.activePartners}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(mockStats.activePartners / mockStats.totalPartners) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Onboardings */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Onboardings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {partners.slice(0, 3).map((partner) => (
                    <div key={partner.id} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{partner.name}</p>
                          <p className="text-sm text-muted-foreground">{partner.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(partner.status)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => sendInvitation(partner.id)}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Partner Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Detailed analytics and performance metrics will be implemented in the next phase.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

        {/* Bulk Upload Modal */}
        <Dialog open={showBulkUploadModal} onOpenChange={setShowBulkUploadModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Bulk Partner Upload</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* File Upload */}
              <div>
                <Label htmlFor="csv-upload">Select CSV File</Label>
                <Input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  File should contain columns: name, email, phone, location, organization, role
                </p>
              </div>

              {/* CSV Preview */}
              {csvPreview.length > 0 && (
                <div>
                  <Label>CSV Preview (First 5 rows)</Label>
                  <div className="mt-2 border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          {Object.keys(csvPreview[0] || {}).map((header) => (
                            <th key={header} className="px-3 py-2 text-left font-medium">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.map((row, index) => (
                          <tr key={index} className="border-t">
                            {Object.values(row).map((value, cellIndex) => (
                              <td key={cellIndex} className="px-3 py-2">
                                {value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Upload Actions */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowBulkUploadModal(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={uploadPartnersCSV}
                  disabled={!csvFile || uploadingCSV}
                >
                  {uploadingCSV ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Partners
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Partner Modal */}
        <Dialog open={showAddPartnerModal} onOpenChange={setShowAddPartnerModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Partner</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={newPartner.name}
                    onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={newPartner.email}
                    onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="Enter phone number"
                    value={newPartner.phone}
                    onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Enter location"
                    value={newPartner.location}
                    onChange={(e) => setNewPartner({ ...newPartner, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="organization">Organization</Label>
                  <Input
                    id="organization"
                    placeholder="Enter organization name"
                    value={newPartner.organization}
                    onChange={(e) => setNewPartner({ ...newPartner, organization: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={newPartner.role} onValueChange={(value) => setNewPartner({ ...newPartner, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="extension_agent">Extension Agent</SelectItem>
                      <SelectItem value="cooperative_leader">Cooperative Leader</SelectItem>
                      <SelectItem value="ngo_representative">NGO Representative</SelectItem>
                      <SelectItem value="market_association">Market Association</SelectItem>
                      <SelectItem value="aggregator">Aggregator</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about the partner"
                  value={newPartner.notes}
                  onChange={(e) => setNewPartner({ ...newPartner, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddPartnerModal(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={addNewPartner}
                  disabled={addingPartner || !newPartner.name || !newPartner.email || !newPartner.phone}
                >
                  {addingPartner ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Add Partner
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

    </DashboardLayout>
  )
}
