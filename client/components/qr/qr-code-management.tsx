"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import {
  ArrowLeft,
  Search,
  QrCode,
  Download,
  Share2,
  Eye,
  BarChart3,
  Calendar,
  MapPin,
  Package,
  Plus,
} from "lucide-react"
import Link from "next/link"
import { QRCodeGenerator } from "./qr-code-generator"
import { generateQRCodeData } from "@/lib/qr-utils"

// No mock data - QR codes will be fetched from real APIs

const statusColors: Record<"verified" | "pending" | "rejected", "default" | "secondary" | "destructive"> = {
  verified: "default",
  pending: "secondary",
  rejected: "destructive",
}

export function QRCodeManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [selectedQR, setSelectedQR] = useState<string | null>(null)
  const [qrCodes, setQrCodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch QR codes from backend
  useEffect(() => {
    const fetchQRCodes = async () => {
      try {
        setLoading(true)
        const response = await api.getUserQRCodes()
        if (response.success && response.data) {
          setQrCodes(response.data)
        } else {
          setQrCodes([])
        }
      } catch (error) {
        console.error("Failed to fetch QR codes:", error)
        setError("Failed to load QR codes")
        setQrCodes([])
      } finally {
        setLoading(false)
      }
    }

    fetchQRCodes()
  }, [])

  const filteredQRCodes = qrCodes
    .filter((qr) => {
      const matchesSearch =
        qr.cropType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        qr.batchId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        qr.location?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || qr.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      }
      if (sortBy === "scans") {
        return (b.scans || 0) - (a.scans || 0)
      }
      if (sortBy === "crop") {
        return (a.cropType || "").localeCompare(b.cropType || "")
      }
      return 0
    })

  const totalScans = qrCodes.reduce((sum, qr) => sum + (qr.scans || 0), 0)
  const verifiedCount = qrCodes.filter((qr) => qr.status === "verified").length

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <Link
                href="/dashboard"
                className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-heading font-bold text-foreground mb-2">QR Code Management</h1>
              <p className="text-muted-foreground">Manage and track your product QR codes</p>
            </div>
            <Link href="/harvests/new">
              <Button size="lg" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create New QR Code
              </Button>
            </Link>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="codes">QR Codes</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total QR Codes</p>
                        <p className="text-2xl font-bold text-foreground">{qrCodes.length}</p>
                      </div>
                      <QrCode className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Verified</p>
                        <p className="text-2xl font-bold text-success">{verifiedCount}</p>
                      </div>
                      <Badge className="w-8 h-8 rounded-full p-0 bg-success">✓</Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Scans</p>
                        <p className="text-2xl font-bold text-foreground">{totalScans}</p>
                      </div>
                      <Eye className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg. Scans</p>
                        <p className="text-2xl font-bold text-foreground">
                          {qrCodes.length > 0 ? Math.round(totalScans / qrCodes.length) : 0}
                        </p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent QR Code Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {qrCodes
                      .sort((a, b) => new Date(b.lastScanned || 0).getTime() - new Date(a.lastScanned || 0).getTime())
                      .slice(0, 5)
                      .map((qr, index) => (
                        <motion.div
                          key={qr.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 border border-border rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <QrCode className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground">{qr.batchId}</h4>
                              <p className="text-sm text-muted-foreground">{qr.cropType}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{qr.scans} scans</p>
                            <p className="text-xs text-muted-foreground">
                              Last: {new Date(qr.lastScanned).toLocaleDateString()}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="codes" className="space-y-6">
              {/* Filters */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="Search by crop type, batch ID, or location..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Date Created</SelectItem>
                        <SelectItem value="scans">Scan Count</SelectItem>
                        <SelectItem value="crop">Crop Type</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* QR Code Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQRCodes.map((qr, index) => (
                  <motion.div
                    key={qr.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex items-center justify-between">
                            <Badge variant={statusColors[qr.status as keyof typeof statusColors]}>{qr.status}</Badge>
                            <Badge variant="outline">{qr.batchId}</Badge>
                          </div>

                          {/* QR Code */}
                          <div className="flex justify-center">
                            <QRCodeGenerator
                              data={generateQRCodeData({
                                qrCode: qr.batchId,
                                cropType: qr.cropType,
                                quantity: qr.quantity,
                                unit: qr.unit,
                                harvestDate: qr.harvestDate,
                                location: qr.location,
                                farmer: { id: "farmer-1" },
                              })}
                              size={150}
                              className="border-0 shadow-none"
                            />
                          </div>

                          {/* Details */}
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center text-muted-foreground">
                              <Package className="w-3 h-3 mr-2" />
                              <span>
                                {qr.cropType} ({qr.quantity} {qr.unit})
                              </span>
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <Calendar className="w-3 h-3 mr-2" />
                              <span>{new Date(qr.harvestDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <MapPin className="w-3 h-3 mr-2" />
                              <span>{qr.location}</span>
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <Eye className="w-3 h-3 mr-2" />
                              <span>{qr.scans} scans</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                              <Share2 className="w-3 h-3 mr-1" />
                              Share
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {filteredQRCodes.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No QR codes found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || statusFilter !== "all"
                        ? "Try adjusting your search or filters"
                        : "Start by creating your first product"}
                    </p>
                    <Link href="/harvests/new">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create QR Code
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>QR Code Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Analytics Dashboard</h3>
                    <p className="text-muted-foreground">
                      Detailed analytics and insights will be available in the next update
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
