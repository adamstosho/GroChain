"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, ShoppingCart, Package, Star, Eye, Calendar, MapPin, QrCode } from "lucide-react"
import { DashboardLayout } from "./dashboard-layout"
import Link from "next/link"

interface User {
  id: string
  name: string
  email: string
  role: string
  avatar: string
}

interface BuyerDashboardProps {
  user: User
}

const mockStats = {
  totalOrders: 12,
  activeOrders: 3,
  totalSpent: 85000,
  savedProducts: 15,
}

const mockRecentOrders = [
  {
    id: "1",
    product: "Fresh Tomatoes",
    farmer: "Adunni Farms",
    quantity: "50kg",
    price: 15000,
    status: "delivered",
    date: "2025-01-15",
    location: "Lagos State",
  },
  {
    id: "2",
    product: "Organic Yam",
    farmer: "Ibrahim Agro",
    quantity: "20 tubers",
    price: 8000,
    status: "in-transit",
    date: "2025-01-12",
    location: "Kano State",
  },
  {
    id: "3",
    product: "Cassava Flour",
    farmer: "Grace Farms",
    quantity: "25kg",
    price: 12500,
    status: "processing",
    date: "2025-01-10",
    location: "Ogun State",
  },
]

export function BuyerDashboard({ user }: BuyerDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Welcome back, {user.name.split(" ")[0]}!
            </h1>
            <p className="text-muted-foreground">Discover and purchase verified Nigerian produce</p>
          </div>
          <div className="flex gap-2">
            <Link href="/verify">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                <QrCode className="w-4 h-4 mr-2" />
                Verify Product
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button size="lg" className="w-full sm:w-auto">
                <Search className="w-4 h-4 mr-2" />
                Browse Products
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">My Orders</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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
                        <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                        <p className="text-2xl font-bold text-foreground">{mockStats.totalOrders}</p>
                      </div>
                      <ShoppingCart className="w-8 h-8 text-primary" />
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
                        <p className="text-sm font-medium text-muted-foreground">Active Orders</p>
                        <p className="text-2xl font-bold text-foreground">{mockStats.activeOrders}</p>
                      </div>
                      <Package className="w-8 h-8 text-primary" />
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
                        <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                        <p className="text-2xl font-bold text-foreground">₦{mockStats.totalSpent.toLocaleString()}</p>
                      </div>
                      <Package className="w-8 h-8 text-primary" />
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
                        <p className="text-sm font-medium text-muted-foreground">Saved Products</p>
                        <p className="text-2xl font-bold text-foreground">{mockStats.savedProducts}</p>
                      </div>
                      <Star className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link href="/marketplace">
                    <Button
                      variant="outline"
                      className="w-full h-auto p-4 flex flex-col items-center space-y-2 bg-transparent"
                    >
                      <Search className="w-6 h-6" />
                      <span>Browse Products</span>
                    </Button>
                  </Link>
                  <Link href="/verify">
                    <Button
                      variant="outline"
                      className="w-full h-auto p-4 flex flex-col items-center space-y-2 bg-transparent"
                    >
                      <QrCode className="w-6 h-6" />
                      <span>Verify Product</span>
                    </Button>
                  </Link>
                  <Link href="/orders">
                    <Button
                      variant="outline"
                      className="w-full h-auto p-4 flex flex-col items-center space-y-2 bg-transparent"
                    >
                      <Package className="w-6 h-6" />
                      <span>My Orders</span>
                    </Button>
                  </Link>
                  <Link href="/favorites">
                    <Button
                      variant="outline"
                      className="w-full h-auto p-4 flex flex-col items-center space-y-2 bg-transparent"
                    >
                      <Star className="w-6 h-6" />
                      <span>Favorites</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{order.product}</h4>
                          <p className="text-sm text-muted-foreground">from {order.farmer}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Package className="w-3 h-3 mr-1" />
                              {order.quantity}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(order.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {order.location}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="font-medium text-foreground">₦{order.price.toLocaleString()}</p>
                          <Badge
                            variant={
                              order.status === "delivered"
                                ? "default"
                                : order.status === "in-transit"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Link href="/orders">
                    <Button variant="outline">View All Orders</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Order management interface will be implemented in the next phase.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Profile management interface will be implemented in the next phase.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
