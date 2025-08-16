"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  QrCode,
  TrendingUp,
  Package,
  DollarSign,
  Eye,
  Calendar,
  MapPin,
  Leaf,
  BarChart3,
  Settings,
} from "lucide-react"
import { DashboardLayout } from "./dashboard-layout"
import Link from "next/link"

interface User {
  id: string
  name: string
  email: string
  role: string
  avatar: string
}

interface FarmerDashboardProps {
  user: User
}

const mockStats = {
  totalHarvests: 24,
  activeListings: 8,
  totalEarnings: 125000,
  verificationRate: 98,
}

const mockRecentHarvests = [
  {
    id: "1",
    cropType: "Tomatoes",
    quantity: "500kg",
    date: "2025-01-15",
    status: "verified",
    qrCode: "QR001",
    location: "Lagos State",
  },
  {
    id: "2",
    cropType: "Yam",
    quantity: "200 tubers",
    date: "2025-01-12",
    status: "pending",
    qrCode: "QR002",
    location: "Ogun State",
  },
  {
    id: "3",
    cropType: "Cassava",
    quantity: "300kg",
    date: "2025-01-10",
    status: "verified",
    qrCode: "QR003",
    location: "Lagos State",
  },
]

export function FarmerDashboard({ user }: FarmerDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header - Improved responsive layout */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              Welcome back, {user.name?.split(" ")[0] || "Farmer"}!
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your farm products and track your success
            </p>
          </div>
          <Link href="/harvests/new" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add New Product
            </Button>
          </Link>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="products" className="text-xs sm:text-sm">
              My Products
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-xs sm:text-sm">
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards - Improved responsive grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <Package className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                        <p className="text-lg sm:text-2xl font-bold text-foreground">{mockStats.totalHarvests}</p>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Harvests</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="h-full">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <QrCode className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                        <p className="text-lg sm:text-2xl font-bold text-foreground">{mockStats.activeListings}</p>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Active Listings</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="h-full">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                        <p className="text-lg sm:text-2xl font-bold text-foreground">
                          ₦{(mockStats.totalEarnings / 1000).toFixed(0)}k
                        </p>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Earnings</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="h-full">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                        <p className="text-lg sm:text-2xl font-bold text-foreground">{mockStats.verificationRate}%</p>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Verification Rate</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Quick Actions - Improved responsive layout */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <Leaf className="w-5 h-5 mr-2 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <Link href="/harvests/new">
                    <Button
                      variant="outline"
                      className="w-full h-auto p-3 sm:p-4 flex flex-col items-center space-y-2 bg-transparent hover:bg-muted/50 transition-colors"
                    >
                      <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="text-xs sm:text-sm">Add Product</span>
                    </Button>
                  </Link>
                  <Link href="/harvests">
                    <Button
                      variant="outline"
                      className="w-full h-auto p-3 sm:p-4 flex flex-col items-center space-y-2 bg-transparent hover:bg-muted/50 transition-colors"
                    >
                      <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="text-xs sm:text-sm">View QR Codes</span>
                    </Button>
                  </Link>
                  <Link href="/marketplace">
                    <Button
                      variant="outline"
                      className="w-full h-auto p-3 sm:p-4 flex flex-col items-center space-y-2 bg-transparent hover:bg-muted/50 transition-colors"
                    >
                      <Package className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="text-xs sm:text-sm">Marketplace</span>
                    </Button>
                  </Link>
                  <Link href="/analytics">
                    <Button
                      variant="outline"
                      className="w-full h-auto p-3 sm:p-4 flex flex-col items-center space-y-2 bg-transparent hover:bg-muted/50 transition-colors"
                    >
                      <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="text-xs sm:text-sm">Analytics</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Products - Improved mobile layout */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">Recent Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {mockRecentHarvests.map((harvest, index) => (
                    <motion.div
                      key={harvest.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors space-y-3 sm:space-y-0"
                    >
                      <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-foreground text-sm sm:text-base">{harvest.cropType}</h4>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs sm:text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Package className="w-3 h-3 mr-1" />
                              {harvest.quantity}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(harvest.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {harvest.location}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end space-x-3">
                        <Badge variant={harvest.status === "verified" ? "default" : "secondary"} className="text-xs">
                          {harvest.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 sm:mt-6 text-center">
                  <Link href="/harvests">
                    <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                      View All Products
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">My Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    You haven't added any products yet. Start by adding your first harvest.
                  </p>
                  <Link href="/harvests/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Product
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Profile Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">
                        {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">{user.name || "Unknown User"}</h3>
                      <p className="text-muted-foreground">{user.email}</p>
                      <Badge variant="outline" className="capitalize">
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Link href="/settings">
                      <Button variant="outline">
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
