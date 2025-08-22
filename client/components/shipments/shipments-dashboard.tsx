"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Search,
  Eye,
  Route,
  Calendar,
  User,
  Phone
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

interface Shipment {
  id: string
  trackingNumber: string
  orderId: string
  farmerId: string
  farmerName: string
  buyerId: string
  buyerName: string
  origin: {
    address: string
    coordinates: { lat: number; lng: number }
  }
  destination: {
    address: string
    coordinates: { lat: number; lng: number }
  }
  status: "pending" | "picked_up" | "in_transit" | "delivered" | "cancelled"
  items: Array<{
    id: string
    name: string
    quantity: number
    unit: string
  }>
  driver: {
    name: string
    phone: string
    vehicleNumber: string
  }
  estimatedDelivery: string
  actualDelivery?: string
  createdAt: string
  updatedAt: string
  timeline: Array<{
    status: string
    timestamp: string
    location?: string
    notes?: string
  }>
}

interface CreateShipmentData {
  orderId: string
  farmerId: string
  buyerId: string
  originAddress: string
  destinationAddress: string
  items: Array<{
    name: string
    quantity: number
    unit: string
  }>
  driverName: string
  driverPhone: string
  vehicleNumber: string
  estimatedDelivery: string
  specialInstructions?: string
}

export function ShipmentsDashboard() {
  const { user } = useAuth()
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createFormData, setCreateFormData] = useState<CreateShipmentData>({
    orderId: "",
    farmerId: "",
    buyerId: "",
    originAddress: "",
    destinationAddress: "",
    items: [{ name: "", quantity: 0, unit: "kg" }],
    driverName: "",
    driverPhone: "",
    vehicleNumber: "",
    estimatedDelivery: "",
    specialInstructions: ""
  })

  useEffect(() => {
    fetchShipments()
  }, [statusFilter])

  const fetchShipments = async () => {
    setLoading(true)
    try {
      // For now, use mock data since we don't have GET endpoint for shipments
      // In the future, this would be: const response = await api.getShipments({ status: statusFilter })
      setShipments(mockShipments)
    } catch (error) {
      console.error("Error fetching shipments:", error)
      setShipments(mockShipments)
    } finally {
      setLoading(false)
    }
  }

  const createShipment = async () => {
    try {
      const response = await api.createShipment(createFormData)
      if (response.success) {
        fetchShipments()
        setShowCreateForm(false)
        setCreateFormData({
          orderId: "",
          farmerId: "",
          buyerId: "",
          originAddress: "",
          destinationAddress: "",
          items: [{ name: "", quantity: 0, unit: "kg" }],
          driverName: "",
          driverPhone: "",
          vehicleNumber: "",
          estimatedDelivery: "",
          specialInstructions: ""
        })
      }
    } catch (error) {
      console.error("Error creating shipment:", error)
    }
  }

  const updateShipmentStatus = async (shipmentId: string, status: string, notes?: string) => {
    try {
      // This would use the shipment update endpoint when available
      // For now, update locally
      setShipments(prev => prev.map(s => 
        s.id === shipmentId 
          ? { 
              ...s, 
              status: status as any,
              timeline: [...s.timeline, {
                status,
                timestamp: new Date().toISOString(),
                notes
              }]
            }
          : s
      ))
    } catch (error) {
      console.error("Error updating shipment status:", error)
    }
  }

  const addItem = () => {
    setCreateFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: "", quantity: 0, unit: "kg" }]
    }))
  }

  const removeItem = (index: number) => {
    setCreateFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const updateItem = (index: number, field: string, value: any) => {
    setCreateFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.buyerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || shipment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500"
      case "picked_up": return "bg-blue-500"
      case "in_transit": return "bg-purple-500"
      case "delivered": return "bg-green-500"
      case "cancelled": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />
      case "picked_up": return <Package className="h-4 w-4" />
      case "in_transit": return <Truck className="h-4 w-4" />
      case "delivered": return <CheckCircle className="h-4 w-4" />
      case "cancelled": return <AlertTriangle className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  // Mock data
  const mockShipments: Shipment[] = [
    {
      id: "ship_001",
      trackingNumber: "GC2025001",
      orderId: "order_123",
      farmerId: "farmer_001",
      farmerName: "Musa Ibrahim",
      buyerId: "buyer_001",
      buyerName: "Lagos Market Ltd",
      origin: {
        address: "Kebbi State, Nigeria",
        coordinates: { lat: 12.4539, lng: 4.1975 }
      },
      destination: {
        address: "Mile 12 Market, Lagos, Nigeria",
        coordinates: { lat: 6.5244, lng: 3.3792 }
      },
      status: "in_transit",
      items: [
        { id: "item_1", name: "Premium Rice", quantity: 50, unit: "bags" },
        { id: "item_2", name: "Maize", quantity: 20, unit: "bags" }
      ],
      driver: {
        name: "Ahmed Bello",
        phone: "+2348012345678",
        vehicleNumber: "ABC-123-KD"
      },
      estimatedDelivery: "2025-01-18T10:00:00Z",
      createdAt: "2025-01-16T08:00:00Z",
      updatedAt: "2025-01-16T14:30:00Z",
      timeline: [
        {
          status: "pending",
          timestamp: "2025-01-16T08:00:00Z",
          location: "Kebbi State",
          notes: "Shipment created"
        },
        {
          status: "picked_up",
          timestamp: "2025-01-16T10:00:00Z",
          location: "Kebbi State",
          notes: "Items picked up from farm"
        },
        {
          status: "in_transit",
          timestamp: "2025-01-16T14:30:00Z",
          location: "Kaduna State",
          notes: "En route to Lagos"
        }
      ]
    },
    {
      id: "ship_002",
      trackingNumber: "GC2025002",
      orderId: "order_124",
      farmerId: "farmer_002",
      farmerName: "Fatima Usman",
      buyerId: "buyer_002",
      buyerName: "Kano Grains Co.",
      origin: {
        address: "Kano State, Nigeria",
        coordinates: { lat: 12.0022, lng: 8.5920 }
      },
      destination: {
        address: "Dawanau Market, Kano, Nigeria",
        coordinates: { lat: 12.0022, lng: 8.5920 }
      },
      status: "delivered",
      items: [
        { id: "item_3", name: "Millet", quantity: 30, unit: "bags" }
      ],
      driver: {
        name: "Ibrahim Sani",
        phone: "+2348087654321",
        vehicleNumber: "XYZ-456-KN"
      },
      estimatedDelivery: "2025-01-16T16:00:00Z",
      actualDelivery: "2025-01-16T15:45:00Z",
      createdAt: "2025-01-15T09:00:00Z",
      updatedAt: "2025-01-16T15:45:00Z",
      timeline: [
        {
          status: "pending",
          timestamp: "2025-01-15T09:00:00Z",
          location: "Kano State",
          notes: "Shipment created"
        },
        {
          status: "picked_up",
          timestamp: "2025-01-16T08:00:00Z",
          location: "Kano State",
          notes: "Items picked up from farm"
        },
        {
          status: "in_transit",
          timestamp: "2025-01-16T09:00:00Z",
          location: "Kano State",
          notes: "En route to market"
        },
        {
          status: "delivered",
          timestamp: "2025-01-16T15:45:00Z",
          location: "Dawanau Market",
          notes: "Successfully delivered to buyer"
        }
      ]
    }
  ]

  if (loading || !user) {
    return (
      <DashboardLayout user={user as any}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Truck className="h-8 w-8 animate-pulse mx-auto mb-4" />
            <p>Loading shipments...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user as any}>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0"
        >
          <div>
            <h1 className="text-3xl font-bold">Shipment Tracking</h1>
            <p className="text-muted-foreground">
              Track and manage agricultural product shipments in real-time
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Shipment
            </Button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Package className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{shipments.length}</p>
                    <p className="text-sm text-muted-foreground">Total Shipments</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Truck className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {shipments.filter(s => s.status === "in_transit").length}
                    </p>
                    <p className="text-sm text-muted-foreground">In Transit</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {shipments.filter(s => s.status === "delivered").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Delivered</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {shipments.filter(s => s.status === "pending").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by tracking number, farmer, or buyer..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="picked_up">Picked Up</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Shipments List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredShipments.map((shipment) => (
              <Card key={shipment.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{shipment.trackingNumber}</CardTitle>
                    <Badge className={getStatusColor(shipment.status)}>
                      {getStatusIcon(shipment.status)}
                      <span className="ml-1">{shipment.status.replace('_', ' ').toUpperCase()}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">From</p>
                      <p className="font-medium">{shipment.farmerName}</p>
                      <p className="text-xs text-muted-foreground">{shipment.origin.address}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">To</p>
                      <p className="font-medium">{shipment.buyerName}</p>
                      <p className="text-xs text-muted-foreground">{shipment.destination.address}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Items:</p>
                    <div className="flex flex-wrap gap-1">
                      {shipment.items.map((item) => (
                        <Badge key={item.id} variant="outline" className="text-xs">
                          {item.quantity} {item.unit} {item.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{shipment.driver.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {shipment.status === "delivered" && shipment.actualDelivery
                          ? new Date(shipment.actualDelivery).toLocaleDateString()
                          : new Date(shipment.estimatedDelivery).toLocaleDateString()
                        }
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedShipment(shipment)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://maps.google.com?q=${shipment.destination.coordinates.lat},${shipment.destination.coordinates.lng}`, '_blank')}
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Shipment Details Modal */}
        {selectedShipment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Shipment Details - {selectedShipment.trackingNumber}</CardTitle>
                  <Button variant="outline" onClick={() => setSelectedShipment(null)}>
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">Status</p>
                    <Badge className={getStatusColor(selectedShipment.status)}>
                      {selectedShipment.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-semibold">Driver</p>
                    <p>{selectedShipment.driver.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedShipment.driver.phone}</p>
                    <p className="text-sm text-muted-foreground">{selectedShipment.driver.vehicleNumber}</p>
                  </div>
                </div>

                <div>
                  <p className="font-semibold mb-2">Timeline</p>
                  <div className="space-y-3">
                    {selectedShipment.timeline.map((event, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="bg-blue-500 rounded-full w-3 h-3 mt-2"></div>
                        <div className="flex-1">
                          <p className="font-medium">{event.status.replace('_', ' ').toUpperCase()}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                          {event.location && (
                            <p className="text-sm text-muted-foreground">{event.location}</p>
                          )}
                          {event.notes && (
                            <p className="text-sm">{event.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {user?.role === "admin" && selectedShipment.status !== "delivered" && selectedShipment.status !== "cancelled" && (
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => updateShipmentStatus(selectedShipment.id, "picked_up")}
                      disabled={selectedShipment.status !== "pending"}
                      size="sm"
                    >
                      Mark Picked Up
                    </Button>
                    <Button
                      onClick={() => updateShipmentStatus(selectedShipment.id, "in_transit")}
                      disabled={selectedShipment.status !== "picked_up"}
                      size="sm"
                    >
                      Mark In Transit
                    </Button>
                    <Button
                      onClick={() => updateShipmentStatus(selectedShipment.id, "delivered")}
                      disabled={selectedShipment.status !== "in_transit"}
                      size="sm"
                    >
                      Mark Delivered
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Shipment Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Create New Shipment</CardTitle>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Order ID</label>
                    <Input
                      value={createFormData.orderId}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, orderId: e.target.value }))}
                      placeholder="order_123"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Farmer ID</label>
                    <Input
                      value={createFormData.farmerId}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, farmerId: e.target.value }))}
                      placeholder="farmer_001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Origin Address</label>
                    <Textarea
                      value={createFormData.originAddress}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, originAddress: e.target.value }))}
                      placeholder="Farm location..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Destination Address</label>
                    <Textarea
                      value={createFormData.destinationAddress}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, destinationAddress: e.target.value }))}
                      placeholder="Delivery location..."
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Items</label>
                    <Button onClick={addItem} size="sm" variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {createFormData.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-4 gap-2">
                        <Input
                          placeholder="Item name"
                          value={item.name}
                          onChange={(e) => updateItem(index, "name", e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Quantity"
                          value={item.quantity || ""}
                          onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                        />
                        <Select value={item.unit} onValueChange={(value) => updateItem(index, "unit", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="bags">bags</SelectItem>
                            <SelectItem value="tonnes">tonnes</SelectItem>
                            <SelectItem value="pieces">pieces</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() => removeItem(index)}
                          size="sm"
                          variant="outline"
                          disabled={createFormData.items.length === 1}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Driver Name</label>
                    <Input
                      value={createFormData.driverName}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, driverName: e.target.value }))}
                      placeholder="Driver name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Driver Phone</label>
                    <Input
                      value={createFormData.driverPhone}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, driverPhone: e.target.value }))}
                      placeholder="+234..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Vehicle Number</label>
                    <Input
                      value={createFormData.vehicleNumber}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                      placeholder="ABC-123-XY"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Estimated Delivery</label>
                  <Input
                    type="datetime-local"
                    value={createFormData.estimatedDelivery}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Special Instructions</label>
                  <Textarea
                    value={createFormData.specialInstructions}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                    placeholder="Any special delivery instructions..."
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={createShipment} className="flex-1">
                    Create Shipment
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
