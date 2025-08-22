"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Truck, 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Navigation,
  Route,
  Users,
  TrendingUp,
  DollarSign,
  Loader2,
  Map,
  Phone,
  Mail,
  User
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { toast } from "sonner"
import Link from "next/link"

interface Shipment {
  id: string
  trackingNumber: string
  harvestBatch: {
    id: string
    product: string
    farmer: string
    quantity: number
    unit: string
  }
  source: {
    name: string
    address: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  destination: {
    name: string
    address: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed'
  driver: {
    name: string
    phone: string
    vehicle: string
    plateNumber: string
  }
  estimatedDelivery: string
  actualDelivery?: string
  distance: number
  cost: number
  createdAt: string
  updatedAt: string
  route: {
    waypoints: Array<{
      name: string
      coordinates: { lat: number; lng: number }
      estimatedTime: string
      status: 'pending' | 'completed'
    }>
  }
}

interface ShipmentStats {
  totalShipments: number
  inTransit: number
  delivered: number
  pending: number
  failed: number
  totalRevenue: number
  averageDeliveryTime: number
  onTimeDeliveryRate: number
}

interface ShipmentFilters {
  search: string
  status: string
  driver: string
  dateRange: string
  route: string
  minDistance: string
  maxDistance: string
  minCost: string
  maxCost: string
}

interface RouteOptimization {
  id: string
  shipments: string[]
  totalDistance: number
  totalCost: number
  estimatedTime: number
  waypoints: Array<{
    name: string
    coordinates: { lat: number; lng: number }
    estimatedTime: string
    status: 'pending' | 'completed'
  }>
  driver: {
    name: string
    phone: string
    vehicle: string
    plateNumber: string
  }
  status: 'planned' | 'active' | 'completed'
}

interface DeliveryZone {
  id: string
  name: string
  coordinates: Array<{ lat: number; lng: number }>
  estimatedDeliveryTime: number
  deliveryFee: number
  isActive: boolean
}

export function ShipmentDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState<ShipmentFilters>({
    search: "",
    status: "all",
    driver: "all",
    dateRange: "all",
    route: "all",
    minDistance: "",
    maxDistance: "",
    minCost: "",
    maxCost: ""
  })
  const [shipmentStats, setShipmentStats] = useState<ShipmentStats>({
    totalShipments: 0,
    inTransit: 0,
    delivered: 0,
    pending: 0,
    failed: 0,
    totalRevenue: 0,
    averageDeliveryTime: 0,
    onTimeDeliveryRate: 0
  })
  const [showAddShipment, setShowAddShipment] = useState(false)
  const [showRouteOptimization, setShowRouteOptimization] = useState(false)
  const [showDeliveryZones, setShowDeliveryZones] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)
  const [realTimeTracking, setRealTimeTracking] = useState(false)
  const [optimizedRoutes, setOptimizedRoutes] = useState<RouteOptimization[]>([])
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([])
  const [newShipmentData, setNewShipmentData] = useState({
    harvestBatchId: "",
    sourceAddress: "",
    destinationAddress: "",
    estimatedDelivery: "",
    driverId: "",
    specialInstructions: ""
  })
  const [routeOptimizationData, setRouteOptimizationData] = useState({
    selectedShipments: [] as string[],
    driverId: "",
    optimizationType: "distance" as "distance" | "time" | "cost"
  })

  useEffect(() => {
    if (user) {
      fetchShipmentData()
      fetchRouteData()
      fetchDeliveryZones()
    }
  }, [user])

  useEffect(() => {
    filterShipments()
  }, [shipments, filters])

  // Real-time tracking effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (realTimeTracking) {
      interval = setInterval(() => {
        updateShipmentLocations()
      }, 10000) // Update every 10 seconds
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [realTimeTracking])

  const fetchShipmentData = async () => {
    try {
      setLoading(true)
      setError("")

      // Since backend has limited shipment endpoints, we'll use mock data for now
      // In production, this would call: const response = await api.getShipments()
      const mockShipmentsData = generateMockShipments()
      setShipments(mockShipmentsData)
      calculateShipmentStats(mockShipmentsData)
    } catch (error) {
      console.error("Shipment fetch error:", error)
      setError("Failed to load shipment data")
      // Fallback to mock data
      const mockShipmentsData = generateMockShipments()
      setShipments(mockShipmentsData)
      calculateShipmentStats(mockShipmentsData)
    } finally {
      setLoading(false)
    }
  }

  const fetchRouteData = async () => {
    try {
      // TODO: Replace with actual API call when backend endpoint is implemented
      // const response = await api.get("/api/shipments/routes")
      
      // For now, generate mock routes
      setOptimizedRoutes(generateMockRoutes())
    } catch (error) {
      console.error("Route fetch error:", error)
      // Generate mock routes
      setOptimizedRoutes(generateMockRoutes())
    }
  }

  const fetchDeliveryZones = async () => {
    try {
      // TODO: Replace with actual API call when backend endpoint is implemented
      // const response = await api.get("/api/shipments/delivery-zones")
      
      // For now, generate mock delivery zones
      setDeliveryZones(generateMockDeliveryZones())
    } catch (error) {
      console.error("Delivery zones fetch error:", error)
      // Generate mock delivery zones
      setDeliveryZones(generateMockDeliveryZones())
    }
  }

  const generateMockShipments = (): Shipment[] => {
    const statuses: Shipment['status'][] = ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed']
    const products = ['Fresh Tomatoes', 'Organic Yam', 'Cassava Flour', 'Sweet Potatoes', 'Plantain', 'Rice']
    const farmers = ['Adunni Farms', 'Ibrahim Agro', 'Grace Farms', 'John\'s Farm', 'Kemi Agriculture', 'Bello Ventures']
    const drivers = ['Emeka Okafor', 'Fatima Hassan', 'Tunde Adebayo', 'Aisha Mohammed', 'Chidi Okonkwo']
    const vehicles = ['Toyota Hiace', 'Mercedes Sprinter', 'Iveco Daily', 'Ford Transit', 'Mitsubishi Canter']
    
    return Array.from({ length: 25 }, (_, index) => {
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const createdDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Last 30 days
      const estimatedDelivery = new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) // Up to 7 days later
      
      return {
        id: `ship_${String(index + 1).padStart(3, '0')}`,
        trackingNumber: `GC${Date.now().toString().slice(-6)}${String(index + 1).padStart(3, '0')}`,
        harvestBatch: {
          id: `batch_${index + 1}`,
          product: products[Math.floor(Math.random() * products.length)],
          farmer: farmers[Math.floor(Math.random() * farmers.length)],
          quantity: Math.floor(Math.random() * 100) + 10,
          unit: 'kg'
        },
        source: {
          name: farmers[Math.floor(Math.random() * farmers.length)],
          address: `${Math.floor(Math.random() * 999) + 1} Farm Road, Ogun State`,
          coordinates: { lat: 7.0 + Math.random() * 2, lng: 3.0 + Math.random() * 2 }
        },
        destination: {
          name: "Lagos Central Market",
          address: `${Math.floor(Math.random() * 999) + 1} Market Street, Lagos`,
          coordinates: { lat: 6.5 + Math.random(), lng: 3.3 + Math.random() }
        },
        status,
        driver: {
          name: drivers[Math.floor(Math.random() * drivers.length)],
          phone: `+234${Math.floor(Math.random() * 900000000) + 700000000}`,
          vehicle: vehicles[Math.floor(Math.random() * vehicles.length)],
          plateNumber: `LAG-${Math.floor(Math.random() * 900) + 100}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`
        },
        estimatedDelivery: estimatedDelivery.toISOString(),
        actualDelivery: status === 'delivered' ? new Date(estimatedDelivery.getTime() + (Math.random() - 0.5) * 2 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        distance: Math.floor(Math.random() * 200) + 50, // 50-250 km
        cost: Math.floor(Math.random() * 50000) + 10000, // ₦10,000 - ₦60,000
        createdAt: createdDate.toISOString(),
        updatedAt: new Date().toISOString(),
        route: {
          waypoints: [
            {
              name: "Pickup Point",
              coordinates: { lat: 7.0 + Math.random() * 2, lng: 3.0 + Math.random() * 2 },
              estimatedTime: createdDate.toISOString(),
              status: status === 'pending' ? 'pending' : 'completed'
            },
            {
              name: "Checkpoint 1",
              coordinates: { lat: 6.8 + Math.random(), lng: 3.2 + Math.random() },
              estimatedTime: new Date(createdDate.getTime() + 4 * 60 * 60 * 1000).toISOString(),
              status: ['in_transit', 'out_for_delivery', 'delivered'].includes(status) ? 'completed' : 'pending'
            },
            {
              name: "Delivery Point",
              coordinates: { lat: 6.5 + Math.random(), lng: 3.3 + Math.random() },
              estimatedTime: estimatedDelivery.toISOString(),
              status: status === 'delivered' ? 'completed' : 'pending'
            }
          ]
        }
      }
    })
  }

  const generateMockRoutes = (): RouteOptimization[] => {
    return [
      {
        id: "route_001",
        shipments: ["ship_001", "ship_002", "ship_003"],
        totalDistance: 45.2,
        totalCost: 12500,
        estimatedTime: 180,
        waypoints: [
          { name: "Farm A", coordinates: { lat: 7.1, lng: 3.2 }, estimatedTime: "09:00", status: "completed" },
          { name: "Farm B", coordinates: { lat: 7.3, lng: 3.4 }, estimatedTime: "10:30", status: "pending" },
          { name: "Market", coordinates: { lat: 6.6, lng: 3.4 }, estimatedTime: "12:00", status: "pending" }
        ],
        driver: { name: "Emeka Okafor", phone: "+2348012345678", vehicle: "Toyota Hiace", plateNumber: "ABC123XY" },
        status: "active"
      }
    ]
  }

  const generateMockDeliveryZones = (): DeliveryZone[] => {
    return [
      {
        id: "zone_001",
        name: "Lagos Central",
        coordinates: [
          { lat: 6.5, lng: 3.3 },
          { lat: 6.6, lng: 3.3 },
          { lat: 6.6, lng: 3.4 },
          { lat: 6.5, lng: 3.4 }
        ],
        estimatedDeliveryTime: 120,
        deliveryFee: 500,
        isActive: true
      }
    ]
  }

  const updateShipmentLocations = () => {
    // Simulate real-time location updates
    setShipments(prev => prev.map(shipment => {
      if (shipment.status === 'in_transit' || shipment.status === 'out_for_delivery') {
        // Update coordinates slightly to simulate movement
        const newLat = shipment.source.coordinates.lat + (Math.random() - 0.5) * 0.01
        const newLng = shipment.source.coordinates.lng + (Math.random() - 0.5) * 0.01
        
        return {
          ...shipment,
          source: {
            ...shipment.source,
            coordinates: { lat: newLat, lng: newLng }
          }
        }
      }
      return shipment
    }))
  }

  const calculateShipmentStats = (shipmentList: Shipment[]) => {
    const stats: ShipmentStats = {
      totalShipments: shipmentList.length,
      inTransit: shipmentList.filter(s => ['picked_up', 'in_transit', 'out_for_delivery'].includes(s.status)).length,
      delivered: shipmentList.filter(s => s.status === 'delivered').length,
      pending: shipmentList.filter(s => s.status === 'pending').length,
      failed: shipmentList.filter(s => s.status === 'failed').length,
      totalRevenue: shipmentList.filter(s => s.status === 'delivered').reduce((sum, s) => sum + s.cost, 0),
      averageDeliveryTime: 0, // Calculate based on actual vs estimated delivery
      onTimeDeliveryRate: 0 // Calculate based on delivered shipments
    }

    // Calculate average delivery time and on-time delivery rate
    const deliveredShipments = shipmentList.filter(s => s.status === 'delivered' && s.actualDelivery)
    if (deliveredShipments.length > 0) {
      const totalDeliveryTime = deliveredShipments.reduce((sum, s) => {
        const estimated = new Date(s.estimatedDelivery).getTime()
        const actual = new Date(s.actualDelivery!).getTime()
        return sum + Math.abs(actual - estimated)
      }, 0)
      stats.averageDeliveryTime = Math.round(totalDeliveryTime / deliveredShipments.length / (1000 * 60 * 60)) // hours

      const onTimeDeliveries = deliveredShipments.filter(s => {
        const estimated = new Date(s.estimatedDelivery).getTime()
        const actual = new Date(s.actualDelivery!).getTime()
        return actual <= estimated + (24 * 60 * 60 * 1000) // Within 24 hours of estimate
      })
      stats.onTimeDeliveryRate = Math.round((onTimeDeliveries.length / deliveredShipments.length) * 100)
    }

    setShipmentStats(stats)
  }

  const filterShipments = () => {
    let filtered = shipments

    if (filters.search) {
      filtered = filtered.filter(
        (shipment) =>
          shipment.trackingNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
          shipment.harvestBatch.product.toLowerCase().includes(filters.search.toLowerCase()) ||
          shipment.harvestBatch.farmer.toLowerCase().includes(filters.search.toLowerCase()) ||
          shipment.driver.name.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    if (filters.status !== "all") {
      filtered = filtered.filter((shipment) => shipment.status === filters.status)
    }

    if (filters.driver !== "all") {
      filtered = filtered.filter((shipment) => shipment.driver.name === filters.driver)
    }

    if (filters.dateRange !== "all") {
      const now = new Date()
      const filterDate = new Date()
      
      switch (filters.dateRange) {
        case "today":
          filterDate.setHours(0, 0, 0, 0)
          break
        case "week":
          filterDate.setDate(now.getDate() - 7)
          break
        case "month":
          filterDate.setMonth(now.getMonth() - 1)
          break
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1)
          break
      }
      
      filtered = filtered.filter((shipment) => new Date(shipment.createdAt) >= filterDate)
    }

    setFilteredShipments(filtered)
  }

  const getStatusBadge = (status: Shipment["status"]) => {
    switch (status) {
      case "delivered":
        return <Badge variant="default" className="bg-green-500">Delivered</Badge>
      case "out_for_delivery":
        return <Badge variant="secondary" className="bg-blue-500">Out for Delivery</Badge>
      case "in_transit":
        return <Badge variant="secondary" className="bg-yellow-500">In Transit</Badge>
      case "picked_up":
        return <Badge variant="outline" className="border-green-500 text-green-600">Picked Up</Badge>
      case "pending":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Pending</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status: Shipment["status"]) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "out_for_delivery":
        return <Truck className="h-4 w-4 text-blue-500" />
      case "in_transit":
        return <Navigation className="h-4 w-4 text-yellow-500" />
      case "picked_up":
        return <Package className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Package className="h-4 w-4 text-gray-500" />
    }
  }

  const handleRefresh = () => {
    fetchShipmentData()
    toast.success("Shipment data refreshed")
  }

  const handleCreateShipment = () => {
    // This would open a create shipment modal or navigate to create page
    toast.info("Create shipment functionality coming soon")
  }

  const addShipment = async () => {
    try {
      const response = await api.post("/api/shipments", newShipmentData)
      if (response.success) {
        toast.success("Shipment created successfully!")
        setShowAddShipment(false)
        setNewShipmentData({
          harvestBatchId: "",
          sourceAddress: "",
          destinationAddress: "",
          estimatedDelivery: "",
          driverId: "",
          specialInstructions: ""
        })
        fetchShipmentData()
      }
    } catch (error) {
      toast.error("Failed to create shipment")
    }
  }

  const optimizeRoute = async () => {
    try {
      const response = await api.post("/api/shipments/optimize-route", routeOptimizationData)
      if (response.success) {
        toast.success("Route optimized successfully!")
        setShowRouteOptimization(false)
        setRouteOptimizationData({
          selectedShipments: [],
          driverId: "",
          optimizationType: "distance"
        })
        fetchRouteData()
      }
    } catch (error) {
      toast.error("Failed to optimize route")
    }
  }

  const updateShipmentStatus = async (shipmentId: string, status: Shipment['status']) => {
    try {
      const response = await api.patch(`/api/shipments/${shipmentId}/status`, { status })
      if (response.success) {
        toast.success(`Shipment status updated to ${status}`)
        fetchShipmentData()
      }
    } catch (error) {
      toast.error("Failed to update shipment status")
    }
  }

  const calculateOptimalRoute = (shipments: Shipment[], optimizationType: "distance" | "time" | "cost") => {
    // Simple route optimization algorithm
    // In production, this would use Google Maps API or similar service
    let sortedShipments = [...shipments]
    
    if (optimizationType === "distance") {
      sortedShipments.sort((a, b) => a.distance - b.distance)
    } else if (optimizationType === "time") {
      sortedShipments.sort((a, b) => {
        const aTime = new Date(a.estimatedDelivery).getTime()
        const bTime = new Date(b.estimatedDelivery).getTime()
        return aTime - bTime
      })
    } else if (optimizationType === "cost") {
      sortedShipments.sort((a, b) => a.cost - b.cost)
    }
    
    return sortedShipments
  }

  if (!user) {
    return (
      <DashboardLayout user={user as any}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Truck className="h-8 w-8 animate-pulse mx-auto mb-4" />
            <p>Loading shipment dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Shipment & Logistics Management</h1>
            <p className="text-muted-foreground">
              Track shipments, optimize routes, and manage delivery operations in real-time
            </p>
            {shipmentStats && (
              <p className="text-sm text-muted-foreground mt-1">
                {shipmentStats.inTransit} in transit • {shipmentStats.delivered} delivered • {shipmentStats.onTimeDeliveryRate}% on-time delivery
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Real-time Tracking Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant={realTimeTracking ? "default" : "outline"}
                size="sm"
                onClick={() => setRealTimeTracking(!realTimeTracking)}
                className="flex items-center gap-2"
              >
                {realTimeTracking ? (
                  <>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    Live
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    Manual
                  </>
                )}
              </Button>
            </div>

            {/* Action Buttons */}
            <Button variant="outline" onClick={() => setShowRouteOptimization(true)}>
              <Route className="w-4 h-4 mr-2" />
              Optimize Routes
            </Button>
            
            <Button variant="outline" onClick={() => setShowDeliveryZones(true)}>
              <Map className="w-4 h-4 mr-2" />
              Delivery Zones
            </Button>
            
            <Button onClick={() => setShowAddShipment(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Shipment
            </Button>
          </div>
        </div>

        {/* Shipment Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{shipmentStats.totalShipments}</div>
              <p className="text-xs text-muted-foreground">
                All time shipments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{shipmentStats.inTransit}</div>
              <p className="text-xs text-muted-foreground">
                Currently being delivered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{shipmentStats.delivered}</div>
              <p className="text-xs text-muted-foreground">
                Successfully completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{shipmentStats.onTimeDeliveryRate}%</div>
              <p className="text-xs text-muted-foreground">
                Delivered on time
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="shipments">Shipments</TabsTrigger>
              <TabsTrigger value="tracking">Tracking</TabsTrigger>
              <TabsTrigger value="routes">Routes</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Shipments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filteredShipments.slice(0, 5).map((shipment) => (
                        <div key={shipment.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(shipment.status)}
                            <div>
                              <p className="font-medium">{shipment.trackingNumber}</p>
                              <p className="text-sm text-muted-foreground">
                                {shipment.harvestBatch.product} • {shipment.driver.name}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(shipment.status)}
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/shipments/${shipment.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total Revenue</span>
                        <span className="text-sm font-bold">₦{shipmentStats.totalRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Avg Delivery Time</span>
                        <span className="text-sm font-bold">{shipmentStats.averageDeliveryTime}h</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Success Rate</span>
                        <span className="text-sm font-bold text-green-600">
                          {Math.round(((shipmentStats.delivered + shipmentStats.inTransit) / shipmentStats.totalShipments) * 100) || 0}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="shipments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>All Shipments</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <Input
                        placeholder="Search shipments..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="w-full"
                      />
                    </div>
                    <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="picked_up">Picked Up</SelectItem>
                        <SelectItem value="in_transit">In Transit</SelectItem>
                        <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Date Range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Shipments List */}
                  <div className="space-y-3">
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : filteredShipments.length === 0 ? (
                      <div className="text-center py-8">
                        <Truck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No shipments found</p>
                      </div>
                    ) : (
                      filteredShipments.map((shipment) => (
                        <div key={shipment.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-muted rounded-lg">
                                {getStatusIcon(shipment.status)}
                              </div>
                              <div>
                                <h3 className="font-medium">{shipment.trackingNumber}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {shipment.harvestBatch.product} • {shipment.harvestBatch.quantity} {shipment.harvestBatch.unit}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(shipment.status)}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <h4 className="font-medium mb-2">Route</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">From:</span> {shipment.source.name}</p>
                                <p><span className="font-medium">To:</span> {shipment.destination.name}</p>
                                <p><span className="font-medium">Distance:</span> {shipment.distance} km</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Driver</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Name:</span> {shipment.driver.name}</p>
                                <p><span className="font-medium">Vehicle:</span> {shipment.driver.vehicle}</p>
                                <p><span className="font-medium">Plate:</span> {shipment.driver.plateNumber}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Delivery</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Estimated:</span> {new Date(shipment.estimatedDelivery).toLocaleDateString()}</p>
                                <p><span className="font-medium">Cost:</span> ₦{shipment.cost.toLocaleString()}</p>
                                {shipment.actualDelivery && (
                                  <p><span className="font-medium">Delivered:</span> {new Date(shipment.actualDelivery).toLocaleDateString()}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>Created: {new Date(shipment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex space-x-2">
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/shipments/track/${shipment.trackingNumber}`}>
                                  <Navigation className="h-4 w-4 mr-2" />
                                  Track
                                </Link>
                              </Button>
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/shipments/${shipment.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Details
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tracking" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Live Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Map className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Real-time shipment tracking and route visualization
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Coming soon: Interactive map with live GPS tracking
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="routes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Route Optimization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Route className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Optimize delivery routes for efficiency and cost savings
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Coming soon: AI-powered route optimization and planning
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Logistics Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Detailed analytics for logistics performance and optimization
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Coming soon: Charts, trends, and performance analysis
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Add Shipment Modal */}
        {showAddShipment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Create New Shipment</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="harvestBatch">Harvest Batch ID</Label>
                  <Input
                    id="harvestBatch"
                    value={newShipmentData.harvestBatchId}
                    onChange={(e) => setNewShipmentData({ ...newShipmentData, harvestBatchId: e.target.value })}
                    placeholder="Enter harvest batch ID"
                  />
                </div>

                <div>
                  <Label htmlFor="sourceAddress">Source Address</Label>
                  <Input
                    id="sourceAddress"
                    value={newShipmentData.sourceAddress}
                    onChange={(e) => setNewShipmentData({ ...newShipmentData, sourceAddress: e.target.value })}
                    placeholder="Farm or pickup location"
                  />
                </div>

                <div>
                  <Label htmlFor="destinationAddress">Destination Address</Label>
                  <Input
                    id="destinationAddress"
                    value={newShipmentData.destinationAddress}
                    onChange={(e) => setNewShipmentData({ ...newShipmentData, destinationAddress: e.target.value })}
                    placeholder="Market or delivery location"
                  />
                </div>

                <div>
                  <Label htmlFor="estimatedDelivery">Estimated Delivery Date</Label>
                  <Input
                    id="estimatedDelivery"
                    type="datetime-local"
                    value={newShipmentData.estimatedDelivery}
                    onChange={(e) => setNewShipmentData({ ...newShipmentData, estimatedDelivery: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="driverId">Driver</Label>
                  <Select value={newShipmentData.driverId} onValueChange={(value) => setNewShipmentData({ ...newShipmentData, driverId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="driver_001">Emeka Okafor</SelectItem>
                      <SelectItem value="driver_002">Fatima Hassan</SelectItem>
                      <SelectItem value="driver_003">Tunde Adebayo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="specialInstructions">Special Instructions</Label>
                  <Textarea
                    id="specialInstructions"
                    value={newShipmentData.specialInstructions}
                    onChange={(e) => setNewShipmentData({ ...newShipmentData, specialInstructions: e.target.value })}
                    placeholder="Any special handling requirements"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={addShipment} className="flex-1">
                    Create Shipment
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddShipment(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Route Optimization Modal */}
        {showRouteOptimization && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Route Optimization</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="optimizationType">Optimization Type</Label>
                  <Select value={routeOptimizationData.optimizationType} onValueChange={(value: "distance" | "time" | "cost") => setRouteOptimizationData({ ...routeOptimizationData, optimizationType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="distance">Minimize Distance</SelectItem>
                      <SelectItem value="time">Minimize Time</SelectItem>
                      <SelectItem value="cost">Minimize Cost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="selectedShipments">Select Shipments</Label>
                  <Select value={routeOptimizationData.selectedShipments[0] || ""} onValueChange={(value) => setRouteOptimizationData({ ...routeOptimizationData, selectedShipments: [value] })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shipments to optimize" />
                    </SelectTrigger>
                    <SelectContent>
                      {shipments.filter(s => s.status === 'pending').map((shipment) => (
                        <SelectItem key={shipment.id} value={shipment.id}>
                          {shipment.trackingNumber} - {shipment.harvestBatch.product}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="driverId">Assign Driver</Label>
                  <Select value={routeOptimizationData.driverId} onValueChange={(value) => setRouteOptimizationData({ ...routeOptimizationData, driverId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="driver_001">Emeka Okafor</SelectItem>
                      <SelectItem value="driver_002">Fatima Hassan</SelectItem>
                      <SelectItem value="driver_003">Tunde Adebayo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={optimizeRoute} className="flex-1">
                    Optimize Route
                  </Button>
                  <Button variant="outline" onClick={() => setShowRouteOptimization(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Zones Modal */}
        {showDeliveryZones && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Delivery Zones Management</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {deliveryZones.map((zone) => (
                    <Card key={zone.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {zone.name}
                          <Badge variant={zone.isActive ? "default" : "secondary"}>
                            {zone.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Delivery Time:</span> {zone.estimatedDeliveryTime} minutes</p>
                          <p><span className="font-medium">Delivery Fee:</span> ₦{zone.deliveryFee}</p>
                          <p><span className="font-medium">Coordinates:</span> {zone.coordinates.length} points</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="text-center py-4">
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Zone
                  </Button>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setShowDeliveryZones(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
