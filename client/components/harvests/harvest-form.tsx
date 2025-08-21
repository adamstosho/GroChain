"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/Textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/Alert"
import { 
  Package, 
  MapPin, 
  Calendar, 
  Leaf, 
  QrCode, 
  Upload, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Download,
  Camera,
  X
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { requestCurrentLocation } from "@/lib/geolocation"
import { checkPermissions, getLocationPermissionInstructions } from "@/lib/browser-permissions"
import QRCodeLib from 'qrcode'

// QR Code Preview Component - SIMPLIFIED VERSION
const QRCodePreview = ({ qrCode, harvestId, formData }: { 
  qrCode: string; 
  harvestId: string; 
  formData: HarvestFormData 
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const generateQR = async () => {
      if (!harvestId) {
        setError('Missing harvest ID')
        setLoading(false)
        return
      }

      try {
        console.log("🔍 Generating SIMPLE QR preview for harvest:", harvestId)
        
        // Create a SIMPLE, guaranteed-to-work QR code data string
        const locationInfo = formData.location || 'Unknown'
        const coordinates = formData.geoLocation?.lat && formData.geoLocation?.lng 
          ? `${formData.geoLocation.lat.toFixed(4)},${formData.geoLocation.lng.toFixed(4)}`
          : '0,0'
        
        // SIMPLE FORMAT: Just the essential info, no complex separators
        const simpleData = `GROCHAIN_${harvestId}_${formData.cropType}_${formData.quantity}_${locationInfo}`
        
        console.log("🔍 SIMPLE QR data string:", simpleData)
        console.log("🔍 Data length:", simpleData.length)
        
        const url = await QRCodeLib.toDataURL(simpleData, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        })
        console.log("🔍 SIMPLE QR preview generated successfully")
        setQrDataUrl(url)
        setError('')
      } catch (error) {
        console.error('🔍 Error generating SIMPLE QR preview:', error)
        setError('Failed to generate QR preview')
      } finally {
        setLoading(false)
      }
    }

    generateQR()
  }, [harvestId, formData.cropType, formData.quantity, formData.location, formData.geoLocation])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        <p className="text-xs text-gray-500 ml-2">Generating QR...</p>
      </div>
    )
  }

  if (error || !qrDataUrl) {
    return (
      <div className="text-center">
        <QrCode className="w-32 h-32 text-gray-400 mx-auto mb-3" />
        <p className="text-xs text-red-500 font-mono mb-2">{error || 'Failed to generate QR'}</p>
        <p className="text-xs text-gray-500">QR Code: {qrCode || 'N/A'}</p>
        <p className="text-xs text-gray-500">Batch ID: {harvestId || 'N/A'}</p>
      </div>
    )
  }

  return (
    <div className="text-center">
      <img 
        src={qrDataUrl} 
        alt="QR Code Preview" 
        className="w-48 h-48 mx-auto mb-3 rounded-lg shadow-md"
      />
      <p className="text-xs text-gray-500 font-mono">Scan to verify</p>
    </div>
  )
}

interface HarvestFormData {
  cropType: string
  quantity: number
  unit: string
  harvestDate: string
  geoLocation: {
    lat: number
    lng: number
  }
  location: string
  description: string
  quality: 'excellent' | 'good' | 'fair' | 'poor'
  images: File[]
}

interface CropType {
  id: string
  name: string
  category: string
  season: string[]
}

const cropTypes: CropType[] = [
  { id: "tomatoes", name: "Tomatoes", category: "Vegetables", season: ["All Year", "Rainy Season"] },
  { id: "yams", name: "Yams", category: "Tubers", season: ["Rainy Season", "Dry Season"] },
  { id: "cassava", name: "Cassava", category: "Tubers", season: ["All Year"] },
  { id: "maize", name: "Maize", category: "Grains", season: ["Rainy Season"] },
  { id: "rice", name: "Rice", category: "Grains", season: ["Rainy Season"] },
  { id: "beans", name: "Beans", category: "Legumes", season: ["Rainy Season"] },
  { id: "pepper", name: "Pepper", category: "Vegetables", season: ["All Year"] },
  { id: "okra", name: "Okra", category: "Vegetables", season: ["Rainy Season"] },
  { id: "cucumber", name: "Cucumber", category: "Vegetables", season: ["Rainy Season"] },
  { id: "plantain", name: "Plantain", category: "Fruits", season: ["All Year"] }
]

const units = [
  { id: "kg", name: "Kilograms (kg)" },
  { id: "tons", name: "Metric Tons" },
  { id: "pieces", name: "Pieces" },
  { id: "bundles", name: "Bundles" },
  { id: "bags", name: "Bags (50kg)" },
  { id: "crates", name: "Crates" }
]

export function HarvestForm() {
  const router = useRouter()
  const { user } = useAuth()
  const [formData, setFormData] = useState<HarvestFormData>({
    cropType: "",
    quantity: 0,
    unit: "kg",
    harvestDate: new Date().toISOString().split('T')[0],
    geoLocation: { lat: 0, lng: 0 },
    location: "",
    description: "",
    quality: "good",
    images: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [harvestId, setHarvestId] = useState("")
  const [qrCode, setQrCode] = useState("")
  const [showLocationPicker, setShowLocationPicker] = useState(false)

  // Auto-detect location on component mount
  useEffect(() => {
    const autoDetectLocation = async () => {
      try {
        // Check if geolocation is supported and permission is granted
        const permissionStatus = await checkPermissions()
        if (permissionStatus.geolocation === 'granted') {
          console.log("🔍 Auto-detecting location...")
          const result = await requestCurrentLocation()
          if (result.success && result.latitude && result.longitude) {
            setFormData(prev => ({
              ...prev,
              geoLocation: { lat: result.latitude!, lng: result.longitude! },
              location: `Auto-detected: ${result.latitude!.toFixed(4)}, ${result.longitude!.toFixed(4)}`
            }))
            toast.success("Location auto-detected successfully!")
          }
        }
      } catch (error) {
        console.log("🔍 Auto-location detection failed:", error)
        // Don't show error toast for auto-detection failure
      }
    }

    // Delay auto-detection to avoid blocking the UI
    const timer = setTimeout(autoDetectLocation, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleInputChange = (field: keyof HarvestFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
    )
    
    if (validFiles.length !== files.length) {
      toast.error("Some files were invalid. Only images under 5MB are allowed.")
    }
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }))
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setFormData(prev => ({
      ...prev,
      geoLocation: { lat, lng },
      location: address
    }))
    setShowLocationPicker(false)
  }

  const getUserCurrentLocation = async () => {
    console.log("🔍 Get Location button clicked!")
    setLoading(true)
    setError("")

    try {
      // First try the utility function
      console.log("🔍 Requesting current location via utility...")
      const result = await requestCurrentLocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      })

      console.log("🔍 Location result:", result)

      if (result.success && result.latitude && result.longitude) {
        console.log("🔍 Setting coordinates:", result.latitude, result.longitude)
        setFormData(prev => ({
          ...prev,
          geoLocation: {
            lat: result.latitude!,
            lng: result.longitude!
          }
        }))
        
        // Also update the location field with approximate address
        const approximateLocation = `Lat: ${result.latitude.toFixed(4)}, Lng: ${result.longitude.toFixed(4)}`
        setFormData(prev => ({
          ...prev,
          location: approximateLocation
        }))
        
        toast.success("Location captured successfully!")
        setError("") // Clear any previous errors
        setLoading(false)
        return
      }

      // If utility failed, try direct browser API as fallback
      console.log("🔍 Utility failed, trying direct browser API...")
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("🔍 Direct API success:", position.coords)
            setFormData(prev => ({
              ...prev,
              geoLocation: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
            }))
            
            // Also update the location field with approximate address
            const approximateLocation = `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`
            setFormData(prev => ({
              ...prev,
              location: approximateLocation
            }))
            
            toast.success("Location captured successfully!")
            setError("") // Clear any previous errors
            setLoading(false)
          },
          (error) => {
            console.error("🔍 Direct API error:", error)
            let errorMessage = "Failed to get location"
            
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = "Location access denied. Please enable location permissions or use manual location entry below."
                break
              case error.POSITION_UNAVAILABLE:
                errorMessage = "Location information unavailable. Please try again or enter location manually."
                break
              case error.TIMEOUT:
                errorMessage = "Location request timed out. Please try again or enter location manually."
                break
              default:
                errorMessage = "An unknown error occurred while getting location."
            }
            
            setError(errorMessage)
            toast.error(errorMessage)
            setLoading(false)
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        )
      } else {
        // Show more helpful error message with solutions
        let errorMessage = result.error || "Geolocation not supported by this browser"
        if (result.errorCode === 1) { // PERMISSION_DENIED
          errorMessage = "Location access denied. Please enable location permissions or use manual location entry below."
        }
        console.error("🔍 Location error:", errorMessage, result)
        setError(errorMessage)
        toast.error(errorMessage)
        setLoading(false)
      }
    } catch (error) {
      console.error("🔍 Geolocation error:", error)
      setError("An unexpected error occurred while getting location")
      toast.error("An unexpected error occurred while getting location")
      setLoading(false)
    }
  }

  const validateForm = (): boolean => {
    if (!formData.cropType) {
      setError("Please select a crop type")
      return false
    }
    if (formData.quantity <= 0) {
      setError("Please enter a valid quantity")
      return false
    }
    if (!formData.location) {
      setError("Please enter harvest location")
      return false
    }
    if (formData.geoLocation.lat === 0 && formData.geoLocation.lng === 0) {
      setError("Please set the harvest location coordinates")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    setError("")

    // Check authentication and token validity
    if (!user?.id) {
      setError("User not authenticated. Please log in again.")
      setLoading(false)
      return
    }

    const token = localStorage.getItem("auth_token")
    if (!token) {
      setError("Authentication token missing. Please log in again.")
      setLoading(false)
      return
    }

    try {
      // Prepare harvest data for API - match backend schema exactly

      const harvestData = {
        farmer: user.id!, // We already checked user.id exists above
        cropType: formData.cropType,
        quantity: formData.quantity,
        date: formData.harvestDate, // Backend expects 'date' not 'harvestDate'
        geoLocation: formData.geoLocation
        // Note: Backend only accepts: farmer, cropType, quantity, date, geoLocation
        // Additional fields like unit, location, description, quality are not in the schema
      }

      console.log("🔐 Sending harvest data:", harvestData)
      const response = await api.createHarvest(harvestData)
      console.log("🔐 Harvest creation response:", response)

      if (response.success && response.data) {
        const harvest = response.data as any // Type assertion for dynamic properties
        console.log("🔐 Harvest data received:", harvest)
        
        // Generate a unique batch ID if not provided by backend
        let batchId = harvest?.batchId || harvest?.id || harvest?._id
        if (!batchId) {
          batchId = `HARVEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
        
        // Generate QR code data if not provided by backend
        let qrData = harvest?.qrData || harvest?.qrCode
        if (!qrData) {
          // Create a simple, readable QR code data string
          const locationInfo = formData.location || 'Unknown Location'
          const coordinates = formData.geoLocation?.lat && formData.geoLocation?.lng 
            ? `${formData.geoLocation.lat.toFixed(6)},${formData.geoLocation.lng.toFixed(6)}`
            : 'No Coordinates'
          
          // Create a simple, scannable format
          qrData = `GROCHAIN_HARVEST_${batchId}_${formData.cropType}_${formData.quantity}_${locationInfo}_${coordinates}`
        }
        
        // Ensure qrData is not too long for QR code generation
        if (qrData.length > 150) {
          qrData = qrData.substring(0, 150)
        }
        
        console.log("🔐 Generated batchId:", batchId)
        console.log("🔐 Generated qrData:", qrData)
        
        // Set the state variables
        setHarvestId(batchId)
        setQrCode(qrData)
        setSuccess(true)
        toast.success("Harvest created successfully!")
        
        // Save to local storage for offline access
        if (typeof window !== 'undefined') {
          const offlineHarvests = JSON.parse(localStorage.getItem('offline_harvests') || '[]')
          offlineHarvests.push({
            ...harvestData,
            id: batchId,
            qrCode: qrData,
            createdAt: new Date().toISOString(),
            status: 'pending_sync'
          })
          localStorage.setItem('offline_harvests', JSON.stringify(offlineHarvests))
        }
      } else {
        throw new Error(response.error || "Failed to create harvest")
      }
    } catch (error) {
      console.error("Harvest creation error:", error)
      setError(error instanceof Error ? error.message : "Failed to create harvest")
      toast.error("Failed to create harvest. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const downloadQRCode = async () => {
    if (!qrCode || !harvestId) {
      toast.error("QR code not available for download")
      return
    }

    try {
      // Create a canvas to generate QR code image
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = 400
      canvas.height = 500
      
      // Fill background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Draw border
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 3
      ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30)
      
      // Generate SIMPLE QR code using the qrcode library
      // Create a guaranteed-to-work simple format
      const locationInfo = formData.location || 'Unknown'
      const coordinates = formData.geoLocation?.lat && formData.geoLocation?.lng 
        ? `${formData.geoLocation.lat.toFixed(4)},${formData.geoLocation.lng.toFixed(4)}`
        : '0,0'
      
      // SIMPLE FORMAT: Just the essential info, no complex separators
      const simpleData = `GROCHAIN_${harvestId}_${formData.cropType}_${formData.quantity}_${locationInfo}`
      console.log("🔍 Download QR using SIMPLE data:", simpleData)
      
      const qrImageDataUrl = await QRCodeLib.toDataURL(simpleData, {
        width: 250,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
      
      // Load QR code image
      const qrImage = new Image()
      qrImage.onload = () => {
        // Draw QR code
        const qrSize = 250
        const startX = (canvas.width - qrSize) / 2
        const startY = 80
        ctx.drawImage(qrImage, startX, startY, qrSize, qrSize)
        
        // Add title with gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
        gradient.addColorStop(0, '#059669')
        gradient.addColorStop(1, '#2563eb')
        ctx.fillStyle = gradient
        ctx.font = 'bold 24px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('GroChain Harvest', canvas.width / 2, 40)
        
        // Add subtitle
        ctx.fillStyle = '#374151'
        ctx.font = '14px Arial'
        ctx.fillText('Authentic Produce Verification', canvas.width / 2, 60)
        
        // Add QR code label
        ctx.font = '16px Arial'
        ctx.fillStyle = '#1f2937'
        ctx.fillText('QR Code Data:', canvas.width / 2, startY + qrSize + 25)
        
        // Display the actual QR code data (not the image data)
        const displayData = simpleData.length > 30 ? `${simpleData.substring(0, 30)}...` : simpleData
        ctx.fillText(displayData, canvas.width / 2, startY + qrSize + 45)
        
        // Add batch ID
        ctx.fillText('Batch ID:', canvas.width / 2, startY + qrSize + 70)
        ctx.fillText(harvestId, canvas.width / 2, startY + qrSize + 90)
        
        // Add location info
        ctx.fillText('Location:', canvas.width / 2, startY + qrSize + 115)
        const locationDisplay = locationInfo.length > 20 ? `${locationInfo.substring(0, 20)}...` : locationInfo
        ctx.fillText(locationDisplay, canvas.width / 2, startY + qrSize + 135)
        
        // Add coordinates
        ctx.fillText('Coordinates:', canvas.width / 2, startY + qrSize + 160)
        ctx.fillText(coordinates, canvas.width / 2, startY + qrSize + 180)
        
        // Add timestamp
        ctx.fillText('Generated:', canvas.width / 2, startY + qrSize + 205)
        ctx.fillText(new Date().toLocaleDateString(), canvas.width / 2, startY + qrSize + 225)
        
        // Add footer
        ctx.fillStyle = '#6b7280'
        ctx.font = '12px Arial'
        ctx.fillText('Scan to verify authenticity', canvas.width / 2, startY + qrSize + 250)
        
        // Download
        const link = document.createElement('a')
        link.download = `grochain-harvest-${harvestId}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
        
        toast.success("QR Code downloaded successfully!")
      }
      
      qrImage.src = qrImageDataUrl
      
    } catch (error) {
      console.error('Error generating QR code:', error)
      toast.error("Failed to generate QR code. Please try again.")
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-3">Harvest Created Successfully! 🎉</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your harvest has been registered and a unique QR code has been generated for tracking and verification.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <CardTitle className="flex items-center justify-center gap-3 text-2xl text-gray-800">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-white" />
                  </div>
                  Harvest QR Code
                </CardTitle>
                <p className="text-gray-600 mt-2">Scan this code to verify your harvest authenticity</p>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <div className="space-y-6">
                  {/* QR Code Display */}
                  <div className="text-center">
                    <div className="w-64 h-64 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 p-4 shadow-lg border border-gray-200">
                      {qrCode && harvestId ? (
                        <QRCodePreview qrCode={qrCode} harvestId={harvestId} formData={formData} />
                      ) : (
                        <div className="text-center">
                          <QrCode className="w-32 h-32 text-gray-400 mx-auto mb-3" />
                          <p className="text-xs text-gray-500 font-mono">Generating QR Code...</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={downloadQRCode} 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 h-auto text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                      disabled={!qrCode || !harvestId}
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download QR Code
                    </Button>
                    <Button 
                      onClick={() => router.push('/harvests')}
                      variant="outline"
                      className="border-2 border-gray-300 hover:border-gray-400 px-8 py-3 h-auto text-base font-medium transition-all duration-200"
                    >
                      <Package className="w-5 h-5 mr-2" />
                      View All Harvests
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Add Another Harvest Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center"
            >
              <Button 
                onClick={() => {
                  setSuccess(false)
                  setFormData({
                    cropType: "",
                    quantity: 0,
                    unit: "kg",
                    harvestDate: new Date().toISOString().split('T')[0],
                    geoLocation: { lat: 0, lng: 0 },
                    location: "",
                    description: "",
                    quality: "good",
                    images: []
                  })
                }}
                variant="outline"
                className="border-2 border-gray-300 hover:border-gray-400 px-8 py-3 h-auto text-base font-medium transition-all duration-200"
              >
                <Leaf className="w-5 h-5 mr-2" />
                Add Another Harvest
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Register New Harvest</h1>
          <p className="text-muted-foreground">
            Add your harvest details to track and verify your produce
          </p>
          {/* <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> Only crop type, quantity, harvest date, and location coordinates are required by the system. 
              Other fields like quality, description, and unit are optional and stored locally.
            </p>
          </div> */}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-primary" />
              Harvest Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Authentication Status */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${user ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Authentication Status: {user ? 'Authenticated' : 'Not Authenticated'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user ? `Logged in as ${user.name} (${user.role})` : 'Please log in to continue'}
                      </p>
                    </div>
                  </div>
                  {!user && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/login')}
                      className="text-xs"
                    >
                      Go to Login
                    </Button>
                  )}
                </div>
                {user && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      <strong>Token Status:</strong> {localStorage.getItem("auth_token") ? 'Present' : 'Missing'}
                    </p>
                    <p className="text-xs text-gray-600">
                      <strong>User ID:</strong> {user.id}
                    </p>
                  </div>
                )}
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Crop Type */}
              <div className="space-y-2">
                <Label htmlFor="cropType">Crop Type *</Label>
                <Select
                  value={formData.cropType}
                  onValueChange={(value) => handleInputChange('cropType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select crop type" />
                  </SelectTrigger>
                  <SelectContent>
                    {cropTypes.map((crop) => (
                      <SelectItem key={crop.id} value={crop.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{crop.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {crop.category}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity and Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => handleInputChange('unit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Harvest Date */}
              <div className="space-y-2">
                <Label htmlFor="harvestDate">Harvest Date *</Label>
                <Input
                  id="harvestDate"
                  type="date"
                  value={formData.harvestDate}
                  onChange={(e) => handleInputChange('harvestDate', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Harvest Location *</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g., Lagos State, Nigeria"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={getUserCurrentLocation}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <MapPin className="w-4 h-4 mr-2" />
                      )}
                      Get Location
                    </Button>
                    
                    {/* Debug button - remove after testing */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        console.log("🔍 Debug: Current form data:", formData)
                        console.log("🔍 Debug: Navigator geolocation:", navigator.geolocation)
                        console.log("🔍 Debug: Loading state:", loading)
                        console.log("🔍 Debug: Error state:", error)
                      }}
                      className="text-xs text-gray-500"
                    >
                      Debug
                    </Button>
                  </div>
                  
                  {/* Location Help Section */}
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-blue-800">Location Options:</p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800"
                            onClick={() => {
                              const instructions = getLocationPermissionInstructions()
                              const message = `To enable location access in ${instructions.browser}:\n\n${instructions.instructions.join('\n')}`
                              alert(message)
                            }}
                          >
                            Need Help?
                          </Button>
                        </div>
                        <ul className="text-blue-700 space-y-1 text-xs">
                          <li>• <strong>Auto-detect:</strong> Click "Get Location" to use your current GPS position</li>
                          <li>• <strong>Manual entry:</strong> Type your location in the input field above</li>
                          <li>• <strong>Map picker:</strong> Use "Set Location" to select from a map</li>
                        </ul>
                        {error && error.includes("Location access denied") && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-xs">
                            <strong>Location Permission Issue:</strong> If "Get Location" fails, you can still manually enter your location or use the map picker below.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span className={formData.geoLocation.lat !== 0 && formData.geoLocation.lng !== 0 ? "text-green-600 font-medium" : "text-muted-foreground"}>
                      Coordinates: {formData.geoLocation.lat.toFixed(6)}, {formData.geoLocation.lng.toFixed(6)}
                    </span>
                    {formData.geoLocation.lat !== 0 && formData.geoLocation.lng !== 0 && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                        ✓ Captured
                      </Badge>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowLocationPicker(true)}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Set Location
                    </Button>
                  </div>
                  
                  {/* Manual Coordinates Input (Fallback) */}
                  {error && error.includes("Location access denied") && (
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm font-medium text-yellow-800 mb-2">Manual Coordinates Entry:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="manualLat" className="text-xs text-yellow-700">Latitude</Label>
                          <Input
                            id="manualLat"
                            type="number"
                            step="any"
                            placeholder="e.g., 9.0765"
                            value={formData.geoLocation.lat === 0 ? "" : formData.geoLocation.lat}
                            onChange={(e) => {
                              const lat = parseFloat(e.target.value) || 0
                              setFormData(prev => ({
                                ...prev,
                                geoLocation: { ...prev.geoLocation, lat }
                              }))
                            }}
                            className="text-xs h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor="manualLng" className="text-xs text-yellow-700">Longitude</Label>
                          <Input
                            id="manualLng"
                            type="number"
                            step="any"
                            placeholder="e.g., 7.3986"
                            value={formData.geoLocation.lng === 0 ? "" : formData.geoLocation.lng}
                            onChange={(e) => {
                              const lng = parseFloat(e.target.value) || 0
                              setFormData(prev => ({
                                ...prev,
                                geoLocation: { ...prev.geoLocation, lng }
                              }))
                            }}
                            className="text-xs h-8"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-yellow-600 mt-1">
                        You can find coordinates on Google Maps by right-clicking on a location
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quality */}
              <div className="space-y-2">
                <Label htmlFor="quality">Quality Grade</Label>
                <Select
                  value={formData.quality}
                  onValueChange={(value) => handleInputChange('quality', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Additional details about your harvest..."
                  rows={3}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Harvest Images (Optional)</Label>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload up to 5 images (max 5MB each)
                  </p>
                  
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {formData.images.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 w-6 h-6 p-0"
                            onClick={() => removeImage(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Harvest...
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4 mr-2" />
                    Register Harvest
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
