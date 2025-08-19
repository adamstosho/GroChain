"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

  useEffect(() => {
    // Get user's current location if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            geoLocation: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }))
        },
        (error) => {
          console.log("Location access denied:", error)
        }
      )
    }
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

    try {
      // Prepare harvest data for API
      const harvestData = {
        farmer: user?.id,
        cropType: formData.cropType,
        quantity: formData.quantity,
        unit: formData.unit,
        harvestDate: formData.harvestDate,
        geoLocation: formData.geoLocation,
        location: formData.location,
        description: formData.description,
        quality: formData.quality
      }

      const response = await api.createHarvest(harvestData)

      if (response.success && response.data) {
        const harvest = response.data
        setHarvestId(harvest.batchId || harvest.id)
        setQrCode(harvest.qrData || `QR${harvest.batchId || harvest.id}`)
        setSuccess(true)
        toast.success("Harvest created successfully!")
        
        // Save to local storage for offline access
        if (typeof window !== 'undefined') {
          const offlineHarvests = JSON.parse(localStorage.getItem('offline_harvests') || '[]')
          offlineHarvests.push({
            ...harvestData,
            id: harvest.batchId || harvest.id,
            qrCode: harvest.qrData || `QR${harvest.batchId || harvest.id}`,
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

  const downloadQRCode = () => {
    // Create a canvas to generate QR code image
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 200
    canvas.height = 200
    
    // Draw QR code placeholder (in real app, use a QR library)
    ctx.fillStyle = '#000'
    ctx.fillRect(50, 50, 100, 100)
    ctx.fillStyle = '#fff'
    ctx.fillRect(60, 60, 80, 80)
    ctx.fillStyle = '#000'
    ctx.fillRect(70, 70, 60, 60)
    
    // Add text
    ctx.fillStyle = '#000'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(harvestId, 100, 190)
    
    // Download
    const link = document.createElement('a')
    link.download = `harvest-${harvestId}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Harvest Created Successfully!</h1>
          <p className="text-muted-foreground mb-6">
            Your harvest has been registered and a QR code has been generated.
          </p>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                Harvest QR Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <QrCode className="w-24 h-24 text-gray-400" />
                  </div>
                  <p className="text-sm text-muted-foreground">QR Code: {qrCode}</p>
                  <p className="text-sm text-muted-foreground">Batch ID: {harvestId}</p>
                </div>
                
                <div className="flex gap-2 justify-center">
                  <Button onClick={downloadQRCode} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download QR
                  </Button>
                  <Button onClick={() => router.push('/harvests')}>
                    <Package className="w-4 h-4 mr-2" />
                    View All Harvests
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-2">
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
            >
              Add Another Harvest
            </Button>
          </div>
        </motion.div>
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
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., Lagos State, Nigeria"
                  />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>
                      Coordinates: {formData.geoLocation.lat.toFixed(6)}, {formData.geoLocation.lng.toFixed(6)}
                    </span>
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
