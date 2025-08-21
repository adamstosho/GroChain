"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  Navigation,
  Phone,
  User,
  Calendar,
  Route
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { toast } from "sonner"
import Link from "next/link"

interface TrackingInfo {
  trackingNumber: string
  status: string
  currentLocation: {
    name: string
    coordinates: { lat: number; lng: number }
    timestamp: string
  }
  estimatedDelivery: string
  shipment: {
    id: string
    harvestBatch: {
      product: string
      farmer: string
      quantity: number
      unit: string
    }
    source: {
      name: string
      address: string
    }
    destination: {
      name: string
      address: string
    }
    driver: {
      name: string
      phone: string
      vehicle: string
      plateNumber: string
    }
  }
  timeline: Array<{
    status: string
    location: string
    timestamp: string
    description: string
    completed: boolean
  }>
}

export default function TrackingPage() {
  const { user } = useAuth()
  const params = useParams()
  const trackingNumber = params.trackingNumber as string
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (trackingNumber) {
      fetchTrackingInfo()
    }
  }, [trackingNumber])

  const fetchTrackingInfo = async () => {
    try {
      setLoading(true)
      setError("")

      // Since backend tracking is limited, we'll use mock data for now
      // In production: const response = await api.getShipmentTracking(trackingNumber)
      
      // Generate mock tracking info
      const mockTrackingInfo: TrackingInfo = {
        trackingNumber,
        status: "in_transit",
        currentLocation: {
          name: "Highway Checkpoint",
          coordinates: { lat: 6.7, lng: 3.5 },
          timestamp: new Date().toISOString()
        },
        estimatedDelivery: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        shipment: {
          id: "ship_001",
          harvestBatch: {
            product: "Fresh Tomatoes",
            farmer: "Adunni Farms",
            quantity: 50,
            unit: "kg"
          },
          source: {
            name: "Adunni Farms",
            address: "123 Farm Road, Ogun State"
          },
          destination: {
            name: "Lagos Central Market",
            address: "456 Market Street, Lagos"
          },
          driver: {
            name: "Emeka Okafor",
            phone: "+2348012345678",
            vehicle: "Toyota Hiace",
            plateNumber: "LAG-123-AB"
          }
        },
        timeline: [
          {
            status: "order_placed",
            location: "Adunni Farms",
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            description: "Shipment order placed and confirmed",
            completed: true
          },
          {
            status: "picked_up",
            location: "Adunni Farms",
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            description: "Package picked up from farm",
            completed: true
          },
          {
            status: "in_transit",
            location: "Highway Checkpoint",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            description: "In transit to destination",
            completed: true
          },
          {
            status: "out_for_delivery",
            location: "Lagos Distribution Center",
            timestamp: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            description: "Out for delivery",
            completed: false
          },
          {
            status: "delivered",
            location: "Lagos Central Market",
            timestamp: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
            description: "Package delivered successfully",
            completed: false
          }
        ]
      }

      setTrackingInfo(mockTrackingInfo)
    } catch (error) {
      console.error("Tracking fetch error:", error)
      setError("Failed to load tracking information")
      toast.error("Failed to load tracking information")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge variant="default" className="bg-green-500">Delivered</Badge>
      case "out_for_delivery":
        return <Badge variant="secondary" className="bg-blue-500">Out for Delivery</Badge>
      case "in_transit":
        return <Badge variant="secondary" className="bg-yellow-500">In Transit</Badge>
      case "picked_up":
        return <Badge variant="outline" className="border-green-500 text-green-600">Picked Up</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string, completed: boolean) => {
    if (!completed) {
      return <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-white" />
    }

    switch (status) {
      case "delivered":
        return <CheckCircle className="w-8 h-8 text-green-500" />
      case "out_for_delivery":
        return <Truck className="w-8 h-8 text-blue-500" />
      case "in_transit":
        return <Navigation className="w-8 h-8 text-yellow-500" />
      case "picked_up":
        return <Package className="w-8 h-8 text-green-500" />
      default:
        return <CheckCircle className="w-8 h-8 text-green-500" />
    }
  }

  if (!user) {
    return (
      <DashboardLayout user={user as any}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Navigation className="h-8 w-8 animate-pulse mx-auto mb-4" />
            <p>Loading tracking information...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-screen">
          <Navigation className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !trackingInfo) {
    return (
      <DashboardLayout user={user}>
        <div className="text-center py-12">
          <Navigation className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Tracking Information Not Found</h2>
          <p className="text-muted-foreground mb-4">
            We couldn't find tracking information for: {trackingNumber}
          </p>
          <Button asChild>
            <Link href="/shipments">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shipments
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0"
        >
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/shipments">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold">Track Shipment</h1>
            <p className="text-muted-foreground">
              Tracking Number: {trackingInfo.trackingNumber}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {getStatusBadge(trackingInfo.status)}
            <Button onClick={fetchTrackingInfo} variant="outline">
              <Navigation className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Current Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Location</h3>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">{trackingInfo.currentLocation.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Last updated: {new Date(trackingInfo.currentLocation.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-3">Estimated Delivery</h3>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">{new Date(trackingInfo.estimatedDelivery).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(trackingInfo.estimatedDelivery).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tracking Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Delivery Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {trackingInfo.timeline.map((event, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(event.status, event.completed)}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-medium ${event.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {event.description}
                        </h4>
                        <span className={`text-sm ${event.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className={`text-sm ${event.completed ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}>
                        {event.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Shipment Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Shipment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Product Information</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Product:</span> {trackingInfo.shipment.harvestBatch.product}</p>
                  <p><span className="font-medium">Farmer:</span> {trackingInfo.shipment.harvestBatch.farmer}</p>
                  <p><span className="font-medium">Quantity:</span> {trackingInfo.shipment.harvestBatch.quantity} {trackingInfo.shipment.harvestBatch.unit}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Route Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">From: {trackingInfo.shipment.source.name}</p>
                      <p className="text-muted-foreground">{trackingInfo.shipment.source.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-medium">To: {trackingInfo.shipment.destination.name}</p>
                      <p className="text-muted-foreground">{trackingInfo.shipment.destination.address}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Driver Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">{trackingInfo.shipment.driver.name}</p>
                  <p className="text-sm text-muted-foreground">Driver</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Phone:</span>
                  <div className="flex items-center space-x-2">
                    <span>{trackingInfo.shipment.driver.phone}</span>
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Vehicle:</span>
                  <span>{trackingInfo.shipment.driver.vehicle}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Plate Number:</span>
                  <span>{trackingInfo.shipment.driver.plateNumber}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
