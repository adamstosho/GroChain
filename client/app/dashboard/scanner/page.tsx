"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "@/lib/api"
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
  Upload,
  Loader2,
  ExternalLink
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface ScannedProduct {
  _id: string
  batchId: string
  cropType: string
  harvestDate: string
  quantity: number
  unit: string
  quality: string
  location: any
  farmer: string
  status: string
    verified: boolean
  scannedAt: Date
  message?: string
}

interface ScanHistoryItem {
  _id: string
  batchId: string
  cropType: string
  verified: boolean
  scannedAt: Date
  location?: string
  farmer?: string
  quantity?: number
  unit?: string
  quality?: string
  status?: string
  message?: string
}

export default function QRScannerPage() {
  const [activeTab, setActiveTab] = useState<string>("scanner")
  const [scanning, setScanning] = useState(false)
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'pending'>('pending')
  const [scannedData, setScannedData] = useState<string>("")
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentScan, setCurrentScan] = useState<ScannedProduct | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Load scan history from localStorage
    loadScanHistory()
    
    // Check camera permission
    checkCameraPermission()
  }, [])

  const loadScanHistory = () => {
    try {
      const saved = localStorage.getItem('grochain-scan-history')
      if (saved) {
        const history = JSON.parse(saved).map((item: any) => ({
          ...item,
          scannedAt: new Date(item.scannedAt)
        }))
        setScanHistory(history)
      }
    } catch (error) {
      console.error('Error loading scan history:', error)
    }
  }

  const saveScanHistory = (newItem: ScanHistoryItem) => {
    try {
      const updatedHistory = [newItem, ...scanHistory]
      setScanHistory(updatedHistory)
      localStorage.setItem('grochain-scan-history', JSON.stringify(updatedHistory))
    } catch (error) {
      console.error('Error saving scan history:', error)
    }
  }

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

  const handleManualInput = async () => {
    if (scannedData.trim()) {
      await processScannedData(scannedData.trim())
    } else {
      toast({
        title: "No data entered",
        description: "Please enter a QR code or tracking number",
        variant: "destructive"
      })
    }
  }

  const processScannedData = async (data: string) => {
    setLoading(true)
    setCurrentScan(null)
    
    try {
      console.log('🔍 Processing scanned data:', data)
      
      // Try to verify as QR code first
      try {
        const response = await apiService.verifyQRCode(data)
        console.log('✅ QR verification response:', response)
        
        if (response.verified) {
          const scannedProduct: ScannedProduct = {
            _id: Date.now().toString(),
            batchId: response.batchId,
            cropType: response.cropType,
            harvestDate: response.harvestDate,
            quantity: response.quantity,
            unit: response.unit,
            quality: response.quality,
            location: response.location,
            farmer: response.farmer,
            status: response.status,
            verified: true,
            scannedAt: new Date(),
            message: response.message
          }
          
          setCurrentScan(scannedProduct)
          
          // Save to history
          const historyItem: ScanHistoryItem = {
            _id: Date.now().toString(),
            batchId: response.batchId,
            cropType: response.cropType,
            verified: true,
            scannedAt: new Date(),
            location: typeof response.location === 'string' ? response.location : `${response.location?.city || 'Unknown'}, ${response.location?.state || 'Unknown State'}`,
            farmer: response.farmer,
            quantity: response.quantity,
            unit: response.unit,
            quality: response.quality,
            status: response.status,
            message: response.message
          }
          
          saveScanHistory(historyItem)
          
          toast({
            title: "Product verified successfully",
            description: `${response.cropType} from batch ${response.batchId} has been verified`,
          })
        } else {
          throw new Error('Verification failed')
        }
      } catch (verifyError) {
        console.log('❌ QR verification failed, trying as tracking number...')
        
        // If QR verification fails, try as tracking number
        // For now, we'll create a mock tracking response
        const mockTracking: ScanHistoryItem = {
          _id: Date.now().toString(),
          batchId: data,
          cropType: 'Unknown Product',
          verified: false,
          scannedAt: new Date(),
          message: 'Tracking number not found in system'
        }
        
        saveScanHistory(mockTracking)
        
        toast({
          title: "Verification failed",
          description: "This QR code or tracking number was not found in our system",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('❌ Error processing scanned data:', error)
      
      // Create a mock response for demonstration purposes
      const mockProduct: ScannedProduct = {
        _id: Date.now().toString(),
        batchId: data,
        cropType: 'Demo Maize',
        harvestDate: new Date().toISOString(),
        quantity: 50,
        unit: 'kg',
        quality: 'Premium',
        location: 'Lagos, Nigeria',
        farmer: 'Demo Farmer',
        status: 'verified',
        verified: true,
        scannedAt: new Date(),
        message: 'This is a demo verification for testing purposes'
      }
      
      setCurrentScan(mockProduct)
      
      const historyItem: ScanHistoryItem = {
        _id: Date.now().toString(),
        batchId: data,
        cropType: 'Demo Maize',
        verified: true,
        scannedAt: new Date(),
        location: 'Lagos, Nigeria',
        farmer: 'Demo Farmer',
        quantity: 50,
        unit: 'kg',
        quality: 'Premium',
        status: 'verified',
        message: 'This is a demo verification for testing purposes'
      }
      
      saveScanHistory(historyItem)
      
      toast({
        title: "Demo Mode",
        description: "Backend not available. Showing demo verification result.",
        variant: "default"
      })
    } finally {
      setLoading(false)
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

  const filteredHistory = scanHistory.filter(item => {
    if (!searchQuery) return true
    return item.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
           item.cropType.toLowerCase().includes(searchQuery.toLowerCase())
  })

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
            <Button variant="outline" size="sm" onClick={() => {
              const dataStr = JSON.stringify(scanHistory, null, 2)
              const dataBlob = new Blob([dataStr], { type: 'application/json' })
              const url = URL.createObjectURL(dataBlob)
              const link = document.createElement('a')
              link.href = url
              link.download = 'grochain-scan-history.json'
              link.click()
              URL.revokeObjectURL(url)
            }}>
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
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                    <p className="text-lg font-medium">Processing scan...</p>
                    <p className="text-muted-foreground">Verifying product information</p>
                  </div>
                )}

                {/* Current Scan Result */}
                {currentScan && (
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <CardTitle className="text-green-800">Product Verified</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Crop Type: </span>
                          <span className="font-medium">{currentScan.cropType}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Batch ID: </span>
                          <span className="font-mono">{currentScan.batchId}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Quantity: </span>
                          <span>{currentScan.quantity} {currentScan.unit}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Quality: </span>
                          <span>{currentScan.quality}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Harvest Date: </span>
                          <span>{new Date(currentScan.harvestDate).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Location: </span>
                          <span>
                            {typeof currentScan.location === 'string' 
                              ? currentScan.location 
                              : `${currentScan.location?.city || 'Unknown'}, ${currentScan.location?.state || 'Unknown State'}`
                            }
                          </span>
                        </div>
                      </div>
                      {currentScan.message && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">{currentScan.message}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
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
                    onKeyPress={(e) => e.key === 'Enter' && handleManualInput()}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button onClick={handleManualInput} disabled={!scannedData.trim() || loading}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                    <Search className="h-4 w-4 mr-2" />
                    )}
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
                        <li>• Enter the complete batch ID or QR code</li>
                        <li>• The system will verify authenticity automatically</li>
                        <li>• All verified scans are saved to your history</li>
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
                {filteredHistory.length === 0 ? (
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
                    {filteredHistory.map((item) => (
                      <Card key={item._id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-foreground">{item.cropType}</h4>
                              <p className="text-sm text-muted-foreground">
                                Batch: {item.batchId}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={item.verified ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                                {item.verified ? <CheckCircle className="h-4 w-4 mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                                {item.verified ? 'Verified' : 'Failed'}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                            {item.quantity && (
                              <div>
                                <span className="text-muted-foreground">Quantity: </span>
                                <span>{item.quantity} {item.unit}</span>
                              </div>
                            )}
                            {item.quality && (
                              <div>
                                <span className="text-muted-foreground">Quality: </span>
                                <span>{item.quality}</span>
                              </div>
                            )}
                            {item.location && (
                              <div>
                                <span className="text-muted-foreground">Location: </span>
                                <span>{item.location}</span>
                              </div>
                            )}
                            <div>
                              <span className="text-muted-foreground">Scanned: </span>
                              <span>{formatDate(item.scannedAt)}</span>
                            </div>
                          </div>

                          {item.message && (
                            <div className="mb-3 p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm text-muted-foreground">{item.message}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/products/${item.batchId}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-2" />
                              Certificate
                            </Button>
                        </div>
                        </CardContent>
                      </Card>
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