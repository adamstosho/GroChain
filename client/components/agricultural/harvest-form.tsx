"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  CalendarIcon, 
  Leaf, 
  MapPin, 
  Scale, 
  Thermometer, 
  Camera,
  Upload,
  Save,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

const harvestSchema = z.object({
  cropType: z.string().min(1, "Crop type is required"),
  variety: z.string().min(1, "Variety is required"),
  harvestDate: z.date({
    required_error: "Harvest date is required",
  }),
  quantity: z.number().min(0.1, "Quantity must be greater than 0"),
  unit: z.enum(["kg", "tons", "bags", "pieces", "liters"]),
  location: z.string().min(1, "Location is required"),
  coordinates: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).optional(),
  quality: z.enum(["excellent", "good", "fair", "poor"]),
  grade: z.enum(["A", "B", "C"]),
  organic: z.boolean().default(false),
  moistureContent: z.number().min(0).max(100),
  price: z.number().min(0, "Price must be greater than 0"),
  notes: z.string().optional(),
  images: z.array(z.string()).optional(),
  certification: z.string().optional(),
  soilType: z.enum(["clay", "loam", "sandy", "silt", "other"]).optional(),
  irrigationType: z.enum(["rainfed", "irrigated", "mixed"]).optional(),
  pestManagement: z.enum(["organic", "conventional", "integrated"]).optional(),
})

type HarvestFormData = z.infer<typeof harvestSchema>

interface HarvestFormProps {
  initialData?: Partial<HarvestFormData>
  onSubmit: (data: HarvestFormData) => void
  onCancel?: () => void
  isLoading?: boolean
  mode?: "create" | "edit"
}

const cropTypes = [
  "Rice", "Maize", "Cassava", "Yam", "Sorghum", "Millet", "Beans", "Groundnut",
  "Soybean", "Cotton", "Cocoa", "Coffee", "Tea", "Banana", "Plantain", "Pineapple",
  "Mango", "Orange", "Lemon", "Tomato", "Pepper", "Onion", "Garlic", "Carrot",
  "Cabbage", "Lettuce", "Spinach", "Okra", "Eggplant", "Cucumber", "Watermelon",
  "Melon", "Pumpkin", "Sweet Potato", "Irish Potato", "Ginger", "Turmeric"
]

const soilTypes = [
  { value: "clay", label: "Clay", description: "Heavy, retains water well" },
  { value: "loam", label: "Loam", description: "Balanced, ideal for most crops" },
  { value: "sandy", label: "Sandy", description: "Light, drains quickly" },
  { value: "silt", label: "Silt", description: "Fine particles, good fertility" },
  { value: "other", label: "Other", description: "Mixed or specialized soil" }
]

const irrigationTypes = [
  { value: "rainfed", label: "Rainfed", description: "Depends on natural rainfall" },
  { value: "irrigated", label: "Irrigated", description: "Artificial water supply" },
  { value: "mixed", label: "Mixed", description: "Combination of both" }
]

const pestManagementTypes = [
  { value: "organic", label: "Organic", description: "Natural pest control methods" },
  { value: "conventional", label: "Conventional", description: "Chemical pesticides" },
  { value: "integrated", label: "Integrated", description: "Combined approach" }
]

export function HarvestForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  mode = "create" 
}: HarvestFormProps) {
  const [images, setImages] = useState<string[]>(initialData?.images || [])
  const [showAdvanced, setShowAdvanced] = useState(false)

  const form = useForm<HarvestFormData>({
    resolver: zodResolver(harvestSchema),
    defaultValues: {
      cropType: initialData?.cropType || "",
      variety: initialData?.variety || "",
      harvestDate: initialData?.harvestDate || new Date(),
      quantity: initialData?.quantity || 0,
      unit: initialData?.unit || "kg",
      location: initialData?.location || "",
      quality: initialData?.quality || "good",
      grade: initialData?.grade || "B",
      organic: initialData?.organic || false,
      moistureContent: initialData?.moistureContent || 15,
      price: initialData?.price || 0,
      notes: initialData?.notes || "",
      soilType: initialData?.soilType || "loam",
      irrigationType: initialData?.irrigationType || "rainfed",
      pestManagement: initialData?.pestManagement || "conventional",
    },
  })

  const handleSubmit = (data: HarvestFormData) => {
    onSubmit({
      ...data,
      images,
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      // In a real app, you'd upload to cloud storage and get URLs
      const newImages = Array.from(files).map(file => URL.createObjectURL(file))
      setImages(prev => [...prev, ...newImages])
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          {mode === "create" ? "Log New Harvest" : "Edit Harvest"}
        </CardTitle>
        <CardDescription>
          Record your harvest details for transparency and traceability
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cropType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crop Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select crop type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cropTypes.map((crop) => (
                            <SelectItem key={crop} value={crop}>
                              {crop}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="variety"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Variety *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Basmati, Sweet Corn" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="harvestDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Harvest Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="0.0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="kg">Kilograms (kg)</SelectItem>
                          <SelectItem value="tons">Tons</SelectItem>
                          <SelectItem value="bags">Bags</SelectItem>
                          <SelectItem value="pieces">Pieces</SelectItem>
                          <SelectItem value="liters">Liters</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Farm location, village, or coordinates"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter the specific location where the harvest took place
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Quality & Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Quality & Pricing</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="quality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quality Grade *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Market Grade *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="A">Grade A (Premium)</SelectItem>
                          <SelectItem value="B">Grade B (Standard)</SelectItem>
                          <SelectItem value="C">Grade C (Economy)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per Unit (₦) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="moistureContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moisture Content: {field.value}%</FormLabel>
                      <FormControl>
                        <Slider
                          value={[field.value]}
                          onValueChange={([value]) => field.onChange(value)}
                          max={100}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                      </FormControl>
                      <FormDescription>
                        Optimal range: 12-18% for grains, 8-12% for legumes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="organic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Organic Certification</FormLabel>
                        <FormDescription>
                          Check if this harvest meets organic farming standards
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Advanced Options */}
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full"
              >
                {showAdvanced ? "Hide" : "Show"} Advanced Options
              </Button>

              {showAdvanced && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="soilType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Soil Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {soilTypes.map((soil) => (
                                <SelectItem key={soil.value} value={soil.value}>
                                  <div>
                                    <div className="font-medium">{soil.label}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {soil.description}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="irrigationType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Irrigation Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {irrigationTypes.map((irrigation) => (
                                <SelectItem key={irrigation.value} value={irrigation.value}>
                                  <div>
                                    <div className="font-medium">{irrigation.label}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {irrigation.description}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pestManagement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pest Management</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {pestManagementTypes.map((method) => (
                                <SelectItem key={method.value} value={method.value}>
                                  <div>
                                    <div className="font-medium">{method.label}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {method.description}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Images & Notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Images & Notes</h3>
              
              <div className="space-y-4">
                <div>
                  <FormLabel>Harvest Images</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Harvest ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <label className="w-full h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors">
                      <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground">Add Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional information about this harvest..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {mode === "create" ? "Log Harvest" : "Update Harvest"}
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
