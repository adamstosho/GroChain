"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, MapPin, Package, Loader2, X, CheckCircle, QrCode, Download } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

const cropTypes = [
  "Tomatoes",
  "Yam",
  "Cassava",
  "Maize",
  "Rice",
  "Plantain",
  "Cocoyam",
  "Sweet Potato",
  "Beans",
  "Groundnut",
  "Pepper",
  "Onion",
  "Okra",
  "Cucumber",
  "Watermelon",
  "Pineapple",
  "Orange",
  "Mango",
  "Banana",
  "Other",
]

const units = ["kg", "tonnes", "bags", "tubers", "pieces", "bunches", "crates"]

const nigerianStates = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
]

interface FormData {
  cropType: string
  customCropType: string
  quantity: string
  unit: string
  harvestDate: string
  location: string
  state: string
  description: string
  images: File[]
  coordinates: { lat: number; lng: number } | null
}

export function HarvestForm() {
  const [formData, setFormData] = useState<FormData>({
    cropType: "",
    customCropType: "",
    quantity: "",
    unit: "",
    harvestDate: "",
    location: "",
    state: "",
    description: "",
    images: [],
    coordinates: null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dragActive, setDragActive] = useState(false)
  const [generatedQR, setGeneratedQR] = useState<string | null>(null)

  const router = useRouter()

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return

    const newImages = Array.from(files).filter((file) => {
      if (file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024) {
        return true
      }
      return false
    })

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages].slice(0, 5), // Max 5 images
    }))
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          }))
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    // Validation
    const newErrors: Record<string, string> = {}

    if (!formData.cropType) newErrors.cropType = "Crop type is required"
    if (formData.cropType === "Other" && !formData.customCropType.trim())
      newErrors.customCropType = "Please specify the crop type"
    if (!formData.quantity.trim()) newErrors.quantity = "Quantity is required"
    if (!formData.unit) newErrors.unit = "Unit is required"
    if (!formData.harvestDate) newErrors.harvestDate = "Harvest date is required"
    if (!formData.location.trim()) newErrors.location = "Location is required"
    if (!formData.state) newErrors.state = "State is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Generate mock QR code
      const qrCode = `QR${Date.now()}`
      setGeneratedQR(qrCode)
      setIsSubmitted(true)
    } catch (error) {
      setErrors({ submit: "Failed to register harvest. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Harvest Registered!</h2>
              <p className="text-muted-foreground mb-6">
                Your harvest has been successfully registered and is now being verified.
              </p>

              {generatedQR && (
                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center mb-2">
                    <QrCode className="w-6 h-6 text-primary mr-2" />
                    <span className="font-medium">QR Code Generated</span>
                  </div>
                  <div className="bg-white p-4 rounded-lg mb-3">
                    <div className="w-32 h-32 bg-gray-200 mx-auto rounded flex items-center justify-center">
                      <QrCode className="w-16 h-16 text-gray-400" />
                    </div>
                  </div>
                  <Badge variant="outline" className="mb-2">
                    {generatedQR}
                  </Badge>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <Download className="w-4 h-4 mr-2" />
                    Download QR Code
                  </Button>
                </div>
              )}

              <div className="space-y-3">
                <Link href="/harvests">
                  <Button className="w-full">View My Products</Button>
                </Link>
                <Link href="/harvests/new">
                  <Button variant="outline" className="w-full bg-transparent">
                    Add Another Product
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Register New Harvest</h1>
            <p className="text-muted-foreground">Add your farm produce to the GroChain platform</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Harvest Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Crop Type */}
                <div className="space-y-2">
                  <Label htmlFor="cropType">Crop Type *</Label>
                  <Select
                    value={formData.cropType}
                    onValueChange={(value) => setFormData({ ...formData, cropType: value })}
                  >
                    <SelectTrigger className={errors.cropType ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select crop type" />
                    </SelectTrigger>
                    <SelectContent>
                      {cropTypes.map((crop) => (
                        <SelectItem key={crop} value={crop}>
                          {crop}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.cropType && <p className="text-sm text-destructive">{errors.cropType}</p>}
                </div>

                {/* Custom Crop Type */}
                {formData.cropType === "Other" && (
                  <div className="space-y-2">
                    <Label htmlFor="customCropType">Specify Crop Type *</Label>
                    <Input
                      id="customCropType"
                      placeholder="Enter crop type"
                      value={formData.customCropType}
                      onChange={(e) => setFormData({ ...formData, customCropType: e.target.value })}
                      className={errors.customCropType ? "border-destructive" : ""}
                    />
                    {errors.customCropType && <p className="text-sm text-destructive">{errors.customCropType}</p>}
                  </div>
                )}

                {/* Quantity and Unit */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="Enter quantity"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className={errors.quantity ? "border-destructive" : ""}
                    />
                    {errors.quantity && <p className="text-sm text-destructive">{errors.quantity}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit *</Label>
                    <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                      <SelectTrigger className={errors.unit ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
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
                    onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                    className={errors.harvestDate ? "border-destructive" : ""}
                  />
                  {errors.harvestDate && <p className="text-sm text-destructive">{errors.harvestDate}</p>}
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Farm Location *</Label>
                    <Input
                      id="location"
                      placeholder="Enter farm location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className={errors.location ? "border-destructive" : ""}
                    />
                    {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) => setFormData({ ...formData, state: value })}
                    >
                      <SelectTrigger className={errors.state ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {nigerianStates.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
                  </div>
                </div>

                {/* GPS Coordinates */}
                <div className="space-y-2">
                  <Label>GPS Coordinates (Optional)</Label>
                  <div className="flex items-center space-x-2">
                    <Button type="button" variant="outline" onClick={getCurrentLocation} className="bg-transparent">
                      <MapPin className="w-4 h-4 mr-2" />
                      Get Current Location
                    </Button>
                    {formData.coordinates && (
                      <Badge variant="outline">
                        {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Additional details about your harvest..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Product Images (Optional)</Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive ? "border-primary bg-primary/5" : "border-border"
                    }`}
                    onDragEnter={(e) => {
                      e.preventDefault()
                      setDragActive(true)
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault()
                      setDragActive(false)
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      setDragActive(false)
                      handleImageUpload(e.dataTransfer.files)
                    }}
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop images here, or{" "}
                      <label className="text-primary cursor-pointer hover:underline">
                        browse
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e.target.files)}
                        />
                      </label>
                    </p>
                    <p className="text-xs text-muted-foreground">Max 5 images, 5MB each</p>
                  </div>

                  {/* Image Preview */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative">
                          <Image
                            src={URL.createObjectURL(image) || "/placeholder.svg"}
                            alt={`Upload ${index + 1}`}
                            width={150}
                            height={150}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                            onClick={() => removeImage(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {errors.submit && <p className="text-sm text-destructive text-center">{errors.submit}</p>}

                {/* Submit Button */}
                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Registering Harvest...
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
    </div>
  )
}
