"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/Alert"
import { Badge } from "@/components/ui/badge"
import { 
  Package, 
  MapPin, 
  Calendar, 
  Upload, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  X,
  Camera
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"

interface HarvestFormData {
  cropType: string
  quantity: number
  unit: string
  harvestDate: string
  location: string
  description: string
  quality: string
  images: File[]
}

interface FormErrors {
  cropType?: string
  quantity?: string
  unit?: string
  harvestDate?: string
  location?: string
  description?: string
  quality?: string
  images?: string
}

const cropTypes = [
  "Tomatoes", "Yam", "Cassava", "Rice", "Maize", "Beans", "Pepper", "Onions",
  "Garlic", "Ginger", "Cocoa", "Coffee", "Tea", "Sugarcane", "Cotton", "Other"
]

const units = ["kg", "bags", "baskets", "tubers", "pieces", "liters", "bundles"]
const qualityLevels = ["premium", "standard", "basic"]

export function HarvestForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState<HarvestFormData>({
    cropType: "",
    quantity: 0,
    unit: "kg",
    harvestDate: new Date().toISOString().split('T')[0],
    location: "",
    description: "",
    quality: "standard",
    images: []
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [harvestId, setHarvestId] = useState<string>("")
  const [imagePreview, setImagePreview] = useState<string[]>([])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.cropType.trim()) {
      newErrors.cropType = "Crop type is required"
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = "Quantity must be greater than 0"
    }

    if (!formData.unit) {
      newErrors.unit = "Unit is required"
    }

    if (!formData.harvestDate) {
      newErrors.harvestDate = "Harvest date is required"
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!formData.quality) {
      newErrors.quality = "Quality level is required"
    }

    if (formData.images.length === 0) {
      newErrors.images = "At least one image is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof HarvestFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    if (files.length > 0) {
      // Validate file types and sizes
      const validFiles = files.filter(file => {
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not an image file`)
          return false
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          alert(`${file.name} is too large. Maximum size is 5MB`)
          return false
        }
        return true
      })

      if (validFiles.length > 0) {
        setFormData(prev => ({ ...prev, images: [...prev.images, ...validFiles] }))
        
        // Create preview URLs
        const newPreviews = validFiles.map(file => URL.createObjectURL(file))
        setImagePreview(prev => [...prev, ...newPreviews])
      }
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
    
    // Revoke preview URL and remove from preview array
    URL.revokeObjectURL(imagePreview[index])
    setImagePreview(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    if (!user) {
      setErrors({ description: "You must be logged in to create a harvest" })
      return
    }

    setLoading(true)

    try {
      // Create harvest data
      const harvestData = {
        farmer: user.id,
        cropType: formData.cropType,
        quantity: formData.quantity,
        unit: formData.unit,
        harvestDate: formData.harvestDate,
        location: formData.location,
        description: formData.description,
        quality: formData.quality
      }

      const response = await api.createHarvest(harvestData)

      if (response.success) {
        const harvest = response.data
        setHarvestId(harvest.batchId || harvest.id)
        setSuccess(true)
        
        // Upload images if harvest was created successfully
        if (formData.images.length > 0) {
          await uploadImages(harvest.batchId || harvest.id)
        }
      } else {
        throw new Error(response.error || "Failed to create harvest")
      }
    } catch (error) {
      console.error("Harvest creation error:", error)
      setErrors({ description: error instanceof Error ? error.message : "Failed to create harvest" })
    } finally {
      setLoading(false)
    }
  }

  const uploadImages = async (harvestId: string) => {
    try {
      for (const image of formData.images) {
        const formData = new FormData()
        formData.append('image', image)
        formData.append('harvestId', harvestId)
        
        await api.uploadMarketplaceImage(formData)
      }
    } catch (error) {
      console.error("Image upload error:", error)
      // Don't fail the whole process if image upload fails
    }
  }

  const resetForm = () => {
    setFormData({
      cropType: "",
      quantity: 0,
      unit: "kg",
      harvestDate: new Date().toISOString().split('T')[0],
      location: "",
      description: "",
      quality: "standard",
      images: []
    })
    setErrors({})
    setSuccess(false)
    setHarvestId("")
    
    // Revoke all preview URLs
    imagePreview.forEach(url => URL.revokeObjectURL(url))
    setImagePreview([])
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-foreground mb-2">Harvest Created Successfully!</h2>
              <p className="text-muted-foreground mb-4">
                Your harvest has been registered and is now available in the marketplace.
              </p>
              
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground mb-2">Harvest ID:</p>
                <p className="font-mono text-lg font-bold text-foreground">{harvestId}</p>
              </div>
              
              <div className="space-y-3">
                <Button onClick={() => router.push(`/harvests/${harvestId}`)} className="w-full">
                  View Harvest Details
                </Button>
                <Button variant="outline" onClick={resetForm} className="w-full">
                  Create Another Harvest
                </Button>
                <Button variant="ghost" onClick={() => router.push("/harvests")} className="w-full">
                  View All Harvests
                </Button>
              </div>
            </CardContent>
          </Card>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Register New Harvest
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              {errors.description && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.description}</AlertDescription>
                </Alert>
              )}

              {/* Crop Type */}
              <div className="space-y-2">
                <Label htmlFor="cropType">Crop Type *</Label>
                <Select value={formData.cropType} onValueChange={(value) => handleInputChange("cropType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select crop type" />
                  </SelectTrigger>
                  <SelectContent>
                    {cropTypes.map((crop) => (
                      <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.cropType && <p className="text-sm text-destructive">{errors.cropType}</p>}
              </div>

              {/* Quantity and Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange("quantity", parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                  {errors.quantity && <p className="text-sm text-destructive">{errors.quantity}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Select value={formData.unit} onValueChange={(value) => handleInputChange("unit", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.unit && <p className="text-sm text-destructive">{errors.unit}</p>}
                </div>
              </div>

              {/* Harvest Date */}
              <div className="space-y-2">
                <Label htmlFor="harvestDate">Harvest Date *</Label>
                <Input
                  id="harvestDate"
                  type="date"
                  value={formData.harvestDate}
                  onChange={(e) => handleInputChange("harvestDate", e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.harvestDate && <p className="text-sm text-destructive">{errors.harvestDate}</p>}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g., Lagos State, Ogun State"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                />
                {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
              </div>

              {/* Quality */}
              <div className="space-y-2">
                <Label htmlFor="quality">Quality Level *</Label>
                <Select value={formData.quality} onValueChange={(value) => handleInputChange("quality", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {qualityLevels.map((quality) => (
                      <SelectItem key={quality} value={quality}>
                        <span className="capitalize">{quality}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.quality && <p className="text-sm text-destructive">{errors.quality}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your harvest, including any special characteristics, organic status, etc."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Harvest Images *</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload images or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG up to 5MB each
                    </p>
                  </label>
                </div>
                {errors.images && <p className="text-sm text-destructive">{errors.images}</p>}
              </div>

              {/* Image Previews */}
              {imagePreview.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Images ({imagePreview.length})</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={loading}>
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
