"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, Plus, Package, Calendar, MapPin, Eye, QrCode, Download, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import Image from "next/image"

const mockHarvests = [
  {
    id: "1",
    cropType: "Tomatoes",
    quantity: "500",
    unit: "kg",
    harvestDate: "2025-01-15",
    location: "Ikeja, Lagos State",
    status: "verified",
    qrCode: "QR001",
    images: ["/tomatoes.jpg"],
    description: "Fresh organic tomatoes from our farm",
    coordinates: { lat: 6.5244, lng: 3.3792 },
  },
  {
    id: "2",
    cropType: "Yam",
    quantity: "200",
    unit: "tubers",
    harvestDate: "2025-01-12",
    location: "Abeokuta, Ogun State",
    status: "pending",
    qrCode: "QR002",
    images: ["/yam.jpg"],
    description: "High quality yam tubers",
    coordinates: { lat: 7.1475, lng: 3.3619 },
  },
  {
    id: "3",
    cropType: "Cassava",
    quantity: "300",
    unit: "kg",
    harvestDate: "2025-01-10",
    location: "Ibadan, Oyo State",
    status: "verified",
    qrCode: "QR003",
    images: ["/cassava.jpg"],
    description: "Fresh cassava roots ready for processing",
    coordinates: { lat: 7.3775, lng: 3.947 },
  },
  {
    id: "4",
    cropType: "Maize",
    quantity: "150",
    unit: "bags",
    harvestDate: "2025-01-08",
    location: "Kaduna, Kaduna State",
    status: "rejected",
    qrCode: "QR004",
    images: ["/maize.jpg"],
    description: "Yellow maize, good for animal feed",
    coordinates: { lat: 10.5105, lng: 7.4165 },
  },
  {
    id: "5",
    cropType: "Rice",
    quantity: "80",
    unit: "bags",
    harvestDate: "2025-01-05",
    location: "Kebbi, Kebbi State",
    status: "verified",
    qrCode: "QR005",
    images: ["/rice.jpg"],
    description: "Premium quality rice",
    coordinates: { lat: 12.4539, lng: 4.1975 },
  },
]

const statusColors = {
  verified: "default",
  pending: "secondary",
  rejected: "destructive",
} as const

export function HarvestList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date")

  const filteredHarvests = mockHarvests
    .filter((harvest) => {
      const matchesSearch =
        harvest.cropType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        harvest.location.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || harvest.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime()
      }
      if (sortBy === "crop") {
        return a.cropType.localeCompare(b.cropType)
      }
      return 0
    })

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
              <h1 className="text-3xl font-heading font-bold text-foreground mb-2">My Products</h1>
              <p className="text-muted-foreground">Manage your registered harvests and QR codes</p>
            </div>
            <Link href="/harvests/new">
              <Button size="lg" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add New Product
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search by crop type or location..."
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
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="crop">Crop Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Products</p>
                    <p className="text-2xl font-bold">{mockHarvests.length}</p>
                  </div>
                  <Package className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Verified</p>
                    <p className="text-2xl font-bold text-success">
                      {mockHarvests.filter((h) => h.status === "verified").length}
                    </p>
                  </div>
                  <Badge className="w-8 h-8 rounded-full p-0 bg-success">✓</Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-warning">
                      {mockHarvests.filter((h) => h.status === "pending").length}
                    </p>
                  </div>
                  <Badge className="w-8 h-8 rounded-full p-0 bg-warning">⏳</Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Rejected</p>
                    <p className="text-2xl font-bold text-destructive">
                      {mockHarvests.filter((h) => h.status === "rejected").length}
                    </p>
                  </div>
                  <Badge className="w-8 h-8 rounded-full p-0 bg-destructive">✗</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product List */}
          <div className="space-y-4">
            {filteredHarvests.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "Start by adding your first harvest"}
                  </p>
                  <Link href="/harvests/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Product
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              filteredHarvests.map((harvest, index) => (
                <motion.div
                  key={harvest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Image */}
                        <div className="w-full lg:w-24 h-24 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                          {harvest.images[0] ? (
                            <Image
                              src={harvest.images[0] || "/placeholder.svg"}
                              alt={harvest.cropType}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-muted-foreground" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-foreground">{harvest.cropType}</h3>
                              <p className="text-sm text-muted-foreground">
                                {harvest.quantity} {harvest.unit}
                              </p>
                            </div>
                            <Badge variant={statusColors[harvest.status]}>{harvest.status}</Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(harvest.harvestDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {harvest.location}
                            </span>
                            <span className="flex items-center">
                              <QrCode className="w-3 h-3 mr-1" />
                              {harvest.qrCode}
                            </span>
                          </div>

                          {harvest.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{harvest.description}</p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Link href={`/harvests/${harvest.id}`}>
                            <Button variant="outline" size="sm" className="bg-transparent">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </Link>
                          {harvest.status === "verified" && (
                            <Button variant="outline" size="sm" className="bg-transparent">
                              <Download className="w-4 h-4 mr-2" />
                              QR Code
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit Details</DropdownMenuItem>
                              <DropdownMenuItem>Share QR Code</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
