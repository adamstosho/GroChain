"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useToast } from "@/hooks/use-toast"
import { useBuyerStore } from "@/hooks/use-buyer-store"
import {
  QrCode,
  Camera,
  CameraOff,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Package,
  Clock,
  Info,
  Scan,
  Shield,
  FileText,
  MapPin,
  Truck,
  Star,
  Eye,
  History,
  Upload
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface ScannedProduct {
  _id: string
  qrCode: string
  cropName: string
  category: string
  description: string
  farmer: {
    name: string
    rating: number
    verified: boolean
    location: string
  }
  harvestDate: Date
  batchNumber: string
  qualityGrade: 'premium' | 'standard' | 'basic'
  organic: boolean
  certifications: string[]
  images: string[]
  status: 'verified' | 'pending' | 'failed'
  scannedAt: Date
  location: string
  price: number
  unit: string
}

interface ShipmentTracking {
  _id: string
  trackingNumber: string
  orderNumber: string
  productName: string
  status: 'in_transit' | 'delivered' | 'pending' | 'delayed'
  currentLocation: string
  estimatedDelivery: Date
  actualDelivery?: Date
  updates: {
    timestamp: Date
    location: string
    status: string
    description: string
  }[]
  scannedAt: Date
}

export default function QRScannerPage() {
  const [activeTab, setActiveTab] = useState<string>("scanner")
  const [scanning, setScanning] = useState(false)
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'pending'>('pending')
  const [scannedData, setScannedData] = useState<string>("")
  const [scanHistory, setScanHistory] = useState<Array<ScannedProduct | ShipmentTracking>>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const { toast } = useToast()

  // Mock data for development
  const mockScanHistory: Array<ScannedProduct | ShipmentTracking> = [
    {
      _id: "1",
      qrCode: "GROCHAIN-2024-MAIZE-001",
      cropName: "Premium Maize",
      category: "Grains",
      description: "High-quality maize harvested from organic farms in Kaduna State",
      farmer: {
        name: "Ahmed Hassan",
        rating: 4.9,
        verified: true,
        location: "Kaduna, Nigeria"
      },
      harvestDate: new Date("2024-01-15"),
      batchNumber: "BATCH-2024-001",
      qualityGrade: "premium",
      organic: true,
      certifications: ["Organic Certified", "ISO 22000"],
      images: ["/placeholder.svg"],
      status: "verified",
      scannedAt: new Date("2024-01-20T10:30:00"),
      location: "Kaduna, Nigeria",
      price: 2500,
      unit: "kg"
    },
    {
      _id: "2",
      trackingNumber: "TRK-001-2024",
      orderNumber: "ORD-2024-001",
      productName: "Sweet Cassava",
      status: "in_transit",
      currentLocation: "Lagos Distribution Center",
      estimatedDelivery: new Date("2024-01-25"),
      updates: [
        {
          timestamp: new Date("2024-01-22T14:00:00"),
          location: "Lagos Distribution Center",
          status: "In Transit",
          description: "Package arrived at distribution center"
        },
        {
          timestamp: new Date("2024-01-21T09:00:00"),
          location: "Ibadan, Oyo",
          status: "Shipped",
          description: "Package picked up from farm"
        }
      ],
      scannedAt: new Date("2024-01-22T15:00:00")
    }
  ]

  useEffect(() => {
    // Load scan history
    setScanHistory(mockScanHistory)
    
    // Check camera permission
    checkCameraPermission()
  }, [])

  const checkCameraPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName })
      setCameraPermission(result.state === 'granted' ? 'granted' : 'denied')
    } catch (error) {
      setCameraPermission('denied')
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setScanning(true)
        setCameraPermission('granted')
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      setCameraPermission('denied')
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to scan QR codes",
        variant: "destructive"
      })
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setScanning(false)
  }

  const handleManualInput = () => {
    if (scannedData.trim()) {
      // Simulate processing
      setLoading(true)
      setTimeout(() => {
        processScannedData(scannedData.trim())
        setLoading(false)
      }, 2000)
    } else {
      toast({
        title: "No data entered",
        description: "Please enter a QR code or tracking number",
        variant: "destructive"
      })
    }
  }

  const processScannedData = (data: string) => {
    // Simulate API call to verify QR code
    const isProduct = data.includes('GROCHAIN')
    const isTracking = data.includes('TRK')
    
    if (isProduct) {
      // Simulate product verification
      const newProduct: ScannedProduct = {
        _id: Date.now().toString(),
        qrCode: data,
        cropName: "Scanned Product",
        category: "Unknown",
        description: "Product details will be loaded from database",
        farmer: {
          name: "Unknown Farmer",
          rating: 0,
          verified: false,
          location: "Unknown"
        },
        harvestDate: new Date(),
        batchNumber: "BATCH-" + Date.now(),
        qualityGrade: "standard",
        organic: false,
        certifications: [],
        images: ["/placeholder.svg"],
        status: "pending",
        scannedAt: new Date(),
        location: "Unknown",
        price: 0,
        unit: "kg"
      }
      
      setScanHistory(prev => [newProduct, ...prev])
      toast({
        title: "Product scanned successfully",
        description: "Product information is being verified",
      })
    } else if (isTracking) {
      // Simulate shipment tracking
      const newTracking: ShipmentTracking = {
        _id: Date.now().toString(),
        trackingNumber: data,
        orderNumber: "ORD-" + Date.now(),
        productName: "Tracked Product",
        status: "pending",
        currentLocation: "Unknown",
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        updates: [],
        scannedAt: new Date()
      }
      
      setScanHistory(prev => [newTracking, ...prev])
      toast({
        title: "Tracking number scanned",
        description: "Shipment information is being retrieved",
      })
    } else {
      toast({
        title: "Invalid QR code",
        description: "This QR code is not recognized by GroChain",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      case 'in_transit': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200'
      case 'delayed': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'failed': return <XCircle className="h-4 w-4" />
      case 'in_transit': return <Truck className="h-4 w-4" />
      case 'delivered': return <CheckCircle className="h-4 w-4" />
      case 'delayed': return <AlertTriangle className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const isProduct = (item: ScannedProduct | ShipmentTracking): item is ScannedProduct => {
    return 'qrCode' in item
  }

  const isShipment = (item: ScannedProduct | ShipmentTracking): item is ShipmentTracking => {
    return 'trackingNumber' in item
  }

  return (
    <DashboardLayout pageTitle="QR Scanner">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">QR Scanner</h1>
            <p className="text-muted-foreground">
              Scan QR codes to verify product authenticity and track shipments
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export History
            </Button>
            <Button size="sm" asChild>
              <Link href="/dashboard/products">
                <Package className="h-4 w-4 mr-2" />
                Browse Products
              </Link>
            </Button>
          </div>
        </div>

        {/* Main Scanner Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scanner">QR Scanner</TabsTrigger>
            <TabsTrigger value="manual">Manual Input</TabsTrigger>
            <TabsTrigger value="history">Scan History</TabsTrigger>
          </TabsList>

          {/* QR Scanner Tab */}
          <TabsContent value="scanner" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Camera Scanner</CardTitle>
                <CardDescription>
                  Use your device camera to scan QR codes on products and shipments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Camera Permission Status */}
                {cameraPermission === 'denied' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium text-red-800">Camera access denied</p>
                        <p className="text-sm text-red-600">
                          Please enable camera access in your browser settings to use the scanner
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Camera Controls */}
                <div className="flex items-center justify-center space-x-4">
                  {!scanning ? (
                    <Button onClick={startCamera} disabled={cameraPermission === 'denied'}>
                      <Camera className="h-4 w-4 mr-2" />
                      Start Camera
                    </Button>
                  ) : (
                    <Button onClick={stopCamera} variant="outline">
                      <CameraOff className="h-4 w-4 mr-2" />
                      Stop Camera
                    </Button>
                  )}
                </div>

                {/* Camera View */}
                {scanning && (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full max-w-md mx-auto rounded-lg border-2 border-primary"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="border-2 border-white border-dashed w-48 h-48 rounded-lg flex items-center justify-center">
                        <QrCode className="h-16 w-16 text-white opacity-50" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Scanner Instructions */}
                {!scanning && (
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Ready to Scan</h3>
                    <p className="text-muted-foreground mb-4">
                      Click "Start Camera" to begin scanning QR codes
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>All scans are verified for authenticity</span>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {loading && (
                  <div className="text-center p-6">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                    <p className="text-lg font-medium">Processing scan...</p>
                    <p className="text-muted-foreground">Verifying product information</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manual Input Tab */}
          <TabsContent value="manual" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Manual Input</CardTitle>
                <CardDescription>
                  Enter QR codes or tracking numbers manually if you can't scan them
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="manual-input" className="text-sm font-medium">
                    QR Code or Tracking Number
                  </label>
                  <Input
                    id="manual-input"
                    placeholder="Enter QR code or tracking number..."
                    value={scannedData}
                    onChange={(e) => setScannedData(e.target.value)}
                    className="font-mono"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button onClick={handleManualInput} disabled={!scannedData.trim()}>
                    <Search className="h-4 w-4 mr-2" />
                    Verify & Track
                  </Button>
                  <Button variant="outline" onClick={() => setScannedData("")}>
                    Clear
                  </Button>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Manual Input Tips:</p>
                      <ul className="mt-1 space-y-1">
                        <li>• Product QR codes start with "GROCHAIN"</li>
                        <li>• Tracking numbers start with "TRK"</li>
                        <li>• Enter the complete code for accurate results</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scan History Tab */}
          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Scan History</CardTitle>
                <CardDescription>
                  View all your previous scans and verifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="mb-6">
                  <Input
                    placeholder="Search scan history..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-md"
                  />
                </div>

                {/* History List */}
                {scanHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No scan history</h3>
                    <p className="text-muted-foreground mb-4">
                      Start scanning QR codes to build your history
                    </p>
                    <Button onClick={() => setActiveTab("scanner")}>
                      <Scan className="h-4 w-4 mr-2" />
                      Start Scanning
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {scanHistory
                      .filter(item => {
                        if (!searchQuery) return true
                        if (isProduct(item)) {
                          return item.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 item.qrCode.toLowerCase().includes(searchQuery.toLowerCase())
                        }
                        if (isShipment(item)) {
                          return item.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 item.productName.toLowerCase().includes(searchQuery.toLowerCase())
                        }
                        return false
                      })
                      .map((item) => (
                        <div key={item._id}>
                          {isProduct(item) ? (
                            <ProductHistoryCard product={item} />
                          ) : (
                            <ShipmentHistoryCard shipment={item} />
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

interface ProductHistoryCardProps {
  product: ScannedProduct
}

function ProductHistoryCard({ product }: ProductHistoryCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <div className="relative w-16 h-16 flex-shrink-0">
            <Image
              src={product.images[0] || "/placeholder.svg"}
              alt={product.cropName}
              fill
              className="rounded-md object-cover"
            />
            {product.organic && (
              <Badge className="absolute -top-1 -right-1 bg-green-600 text-white text-xs">
                Organic
              </Badge>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-foreground">{product.cropName}</h4>
                <p className="text-sm text-muted-foreground">{product.category}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(product.status)}>
                  {getStatusIcon(product.status)}
                  {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <span className="text-muted-foreground">Farmer: </span>
                <span className="font-medium">{product.farmer.name}</span>
                {product.farmer.verified && (
                  <Badge variant="secondary" className="ml-2 text-xs">Verified</Badge>
                )}
              </div>
              <div>
                <span className="text-muted-foreground">Location: </span>
                <span>{product.location}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Batch: </span>
                <span className="font-mono">{product.batchNumber}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Harvest: </span>
                <span>{formatDate(product.harvestDate)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="text-muted-foreground">
                  Scanned: {formatDate(product.scannedAt)}
                </span>
                <span className="text-muted-foreground">
                  QR: {product.qrCode}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/products/${product._id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Certificate
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ShipmentHistoryCardProps {
  shipment: ShipmentTracking
}

function ShipmentHistoryCard({ shipment }: ShipmentHistoryCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-foreground">{shipment.productName}</h4>
            <p className="text-sm text-muted-foreground">
              Order: {shipment.orderNumber}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(shipment.status)}>
              {getStatusIcon(shipment.status)}
              {shipment.status.replace('_', ' ').charAt(0).toUpperCase() + shipment.status.slice(1)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
          <div>
            <span className="text-muted-foreground">Tracking: </span>
            <span className="font-mono">{shipment.trackingNumber}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Current: </span>
            <span>{shipment.currentLocation}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Est. Delivery: </span>
            <span>{formatDate(shipment.estimatedDelivery)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Scanned: </span>
            <span>{formatDate(shipment.scannedAt)}</span>
          </div>
        </div>

        {/* Shipment Updates */}
        {shipment.updates.length > 0 && (
          <div className="mb-3">
            <h5 className="text-sm font-medium text-muted-foreground mb-2">Recent Updates</h5>
            <div className="space-y-2">
              {shipment.updates.slice(0, 2).map((update, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {formatDate(update.timestamp)}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span>{update.location}</span>
                  <span className="text-muted-foreground">•</span>
                  <span>{update.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/orders/${shipment.orderNumber}`}>
              <Package className="h-4 w-4 mr-2" />
              View Order
            </Link>
          </Button>
          <Button variant="outline" size="sm">
            <Truck className="h-4 w-4 mr-2" />
            Track Shipment
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper functions
function getStatusColor(status: string) {
  switch (status) {
    case 'verified': return 'bg-green-100 text-green-800 border-green-200'
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'failed': return 'bg-red-100 text-red-800 border-red-200'
    case 'in_transit': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'delivered': return 'bg-green-100 text-green-800 border-green-200'
    case 'delayed': return 'bg-orange-100 text-orange-800 border-orange-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'verified': return <CheckCircle className="h-4 w-4" />
    case 'pending': return <Clock className="h-4 w-4" />
    case 'failed': return <XCircle className="h-4 w-4" />
    case 'in_transit': return <Truck className="h-4 w-4" />
    case 'delivered': return <CheckCircle className="h-4 w-4" />
    case 'delayed': return <AlertTriangle className="h-4 w-4" />
    default: return <Info className="h-4 w-4" />
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}
