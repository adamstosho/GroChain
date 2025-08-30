"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  HarvestCard, 
  HarvestForm, 
  QRScanner, 
  MarketplaceCard, 
  AnalyticsDashboard,
  type HarvestData,
  type MarketplaceProduct
} from "@/components/agricultural"
import { 
  Leaf, 
  QrCode, 
  ShoppingBag, 
  BarChart3,
  Plus,
  Eye,
  Edit,
  Trash2
} from "lucide-react"

// Mock data for demonstration
const mockHarvests: HarvestData[] = [
  {
    id: "1",
    farmerName: "John Doe",
    cropType: "Rice",
    variety: "Basmati",
    harvestDate: new Date("2024-08-26"),
    quantity: 500,
    unit: "kg",
    location: "Kano State, Nigeria",
    quality: "excellent",
    status: "approved",
    qrCode: "GROCHAIN_HARVEST_001_2024_08_26",
    price: 2500,
    organic: true,
    moistureContent: 14,
    grade: "A"
  },
  {
    id: "2",
    farmerName: "Jane Smith",
    cropType: "Maize",
    variety: "Sweet Corn",
    harvestDate: new Date("2024-08-25"),
    quantity: 800,
    unit: "kg",
    location: "Kaduna State, Nigeria",
    quality: "good",
    status: "pending",
    qrCode: "GROCHAIN_HARVEST_002_2024_08_25",
    price: 1800,
    organic: false,
    moistureContent: 16,
    grade: "B"
  },
  {
    id: "3",
    farmerName: "Ahmed Hassan",
    cropType: "Cassava",
    variety: "Sweet Cassava",
    harvestDate: new Date("2024-08-24"),
    quantity: 1200,
    unit: "kg",
    location: "Katsina State, Nigeria",
    quality: "excellent",
    status: "shipped",
    qrCode: "GROCHAIN_HARVEST_003_2024_08_24",
    price: 1200,
    organic: true,
    moistureContent: 13,
    grade: "A"
  }
]

const mockProducts: MarketplaceProduct[] = [
  {
    id: "1",
    name: "Premium Basmati Rice",
    cropType: "Rice",
    variety: "Basmati",
    description: "High-quality organic basmati rice harvested from the fertile plains of Kano State. Perfect for traditional Nigerian dishes.",
    price: 2500,
    originalPrice: 2800,
    unit: "kg",
    quantity: 1000,
    availableQuantity: 500,
    quality: "excellent",
    grade: "A",
    organic: true,
    harvestDate: new Date("2024-08-26"),
    location: "Kano State, Nigeria",
    farmer: {
      id: "1",
      name: "John Doe",
      avatar: "",
      rating: 4.8,
      verified: true,
      location: "Kano State"
    },
    images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop"],
    certifications: ["Organic", "ISO 22000", "HACCP"],
    shipping: {
      available: true,
      cost: 500,
      estimatedDays: 3
    },
    rating: 4.8,
    reviewCount: 127,
    qrCode: "GROCHAIN_PRODUCT_001",
    tags: ["organic", "premium", "rice", "basmati"]
  },
  {
    id: "2",
    name: "Fresh Sweet Corn",
    cropType: "Maize",
    variety: "Sweet Corn",
    description: "Freshly harvested sweet corn with natural sweetness. Perfect for grilling, boiling, or making traditional corn dishes.",
    price: 1800,
    unit: "kg",
    quantity: 800,
    availableQuantity: 300,
    quality: "good",
    grade: "B",
    organic: false,
    harvestDate: new Date("2024-08-25"),
    location: "Kaduna State, Nigeria",
    farmer: {
      id: "2",
      name: "Jane Smith",
      avatar: "",
      rating: 4.6,
      verified: true,
      location: "Kaduna State"
    },
    images: ["https://images.unsplash.com/photo-1601593768797-9acb3b8b6c8e?w=400&h=300&fit=crop"],
    certifications: ["ISO 22000"],
    shipping: {
      available: true,
      cost: 400,
      estimatedDays: 2
    },
    rating: 4.6,
    reviewCount: 89,
    qrCode: "GROCHAIN_PRODUCT_002",
    tags: ["fresh", "sweet", "corn", "maize"]
  }
]

export default function AgriculturalDemoPage() {
  const [harvests, setHarvests] = useState<HarvestData[]>(mockHarvests)
  const [products, setProducts] = useState<MarketplaceProduct[]>(mockProducts)
  const [showHarvestForm, setShowHarvestForm] = useState(false)
  const [editingHarvest, setEditingHarvest] = useState<HarvestData | null>(null)

  const handleHarvestSubmit = (data: HarvestData) => {
    if (editingHarvest) {
      setHarvests(prev => prev.map(h => h.id === editingHarvest.id ? { ...data, id: h.id } : h))
      setEditingHarvest(null)
    } else {
      const newHarvest: HarvestData = {
        ...data,
        id: Date.now().toString(),
        qrCode: `GROCHAIN_HARVEST_${Date.now()}_${new Date().toISOString().split('T')[0].replace(/-/g, '_')}`,
        status: "pending"
      }
      setHarvests(prev => [newHarvest, ...prev])
    }
    setShowHarvestForm(false)
  }

  const handleHarvestAction = (action: string, harvestId: string) => {
    switch (action) {
      case "view":
        console.log("Viewing harvest:", harvestId)
        break
      case "edit":
        const harvest = harvests.find(h => h.id === harvestId)
        if (harvest) {
          setEditingHarvest(harvest)
          setShowHarvestForm(true)
        }
        break
      case "approve":
        setHarvests(prev => prev.map(h => 
          h.id === harvestId ? { ...h, status: "approved" } : h
        ))
        break
      case "reject":
        setHarvests(prev => prev.map(h => 
          h.id === harvestId ? { ...h, status: "rejected" } : h
        ))
        break
      case "delete":
        setHarvests(prev => prev.filter(h => h.id !== harvestId))
        break
    }
  }

  const handleQRScan = (result: any) => {
    console.log("QR Scan result:", result)
  }

  const handleQRVerify = async (qrData: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Return mock verification data
    return {
      cropType: "Rice",
      variety: "Basmati",
      farmer: "John Doe",
      harvestDate: "2024-08-26",
      location: "Kano State, Nigeria"
    }
  }

  const handleMarketplaceAction = (action: string, productId: string) => {
    switch (action) {
      case "addToCart":
        console.log("Adding to cart:", productId)
        break
      case "addToWishlist":
        console.log("Adding to wishlist:", productId)
        break
      case "view":
        console.log("Viewing product:", productId)
        break
      case "contact":
        console.log("Contacting farmer for:", productId)
        break
      case "share":
        console.log("Sharing product:", productId)
        break
    }
  }

  const handleAnalyticsExport = () => {
    console.log("Exporting analytics data")
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Leaf className="h-12 w-12 text-primary" />
          <h1 className="text-4xl font-bold">Agricultural Components Demo</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Explore the specialized agricultural components built for GroChain. Each component is designed 
          specifically for agricultural use cases with proper theming and functionality.
        </p>
      </div>

      {/* Component Tabs */}
      <Tabs defaultValue="harvests" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="harvests" className="flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            Harvests
          </TabsTrigger>
          <TabsTrigger value="scanner" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            QR Scanner
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Forms
          </TabsTrigger>
        </TabsList>

        {/* Harvests Tab */}
        <TabsContent value="harvests" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Harvest Management</h2>
            <Button onClick={() => setShowHarvestForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Harvest
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {harvests.map((harvest) => (
              <HarvestCard
                key={harvest.id}
                harvest={harvest}
                onView={(id) => handleHarvestAction("view", id)}
                onEdit={(id) => handleHarvestAction("edit", id)}
                onApprove={(id) => handleHarvestAction("approve", id)}
                onReject={(id) => handleHarvestAction("reject", id)}
              />
            ))}
          </div>

          {/* Compact View */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Compact View</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {harvests.slice(0, 4).map((harvest) => (
                <HarvestCard
                  key={harvest.id}
                  harvest={harvest}
                  variant="compact"
                  onView={(id) => handleHarvestAction("view", id)}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* QR Scanner Tab */}
        <TabsContent value="scanner" className="space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">QR Code Scanner</h2>
            <p className="text-muted-foreground">
              Test the QR code scanner for harvest verification and traceability
            </p>
          </div>

          <QRScanner
            onScan={handleQRScan}
            onVerify={handleQRVerify}
            showHistory={true}
          />
        </TabsContent>

        {/* Marketplace Tab */}
        <TabsContent value="marketplace" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Marketplace</h2>
            <p className="text-muted-foreground">
              Browse agricultural products with full traceability
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {products.map((product) => (
              <MarketplaceCard
                key={product.id}
                product={product}
                onAddToCart={(id) => handleMarketplaceAction("addToCart", id)}
                onAddToWishlist={(id) => handleMarketplaceAction("addToWishlist", id)}
                onView={(id) => handleMarketplaceAction("view", id)}
                onContact={(id) => handleMarketplaceAction("contact", id)}
                onShare={(id) => handleMarketplaceAction("share", id)}
              />
            ))}
          </div>

          {/* Compact View */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Compact Product View</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <MarketplaceCard
                  key={product.id}
                  product={product}
                  variant="compact"
                  onAddToCart={(id) => handleMarketplaceAction("addToCart", id)}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
            <p className="text-muted-foreground">
              Comprehensive agricultural insights and performance metrics
            </p>
          </div>

          <AnalyticsDashboard
            timeRange="30d"
            onTimeRangeChange={(range) => console.log("Time range changed:", range)}
            onExport={handleAnalyticsExport}
          />
        </TabsContent>

        {/* Forms Tab */}
        <TabsContent value="form" className="space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Harvest Forms</h2>
            <p className="text-muted-foreground">
              Test the comprehensive harvest logging form with validation
            </p>
          </div>

          {showHarvestForm ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  {editingHarvest ? "Edit Harvest" : "Log New Harvest"}
                </h3>
                <Button variant="outline" onClick={() => {
                  setShowHarvestForm(false)
                  setEditingHarvest(null)
                }}>
                  Cancel
                </Button>
              </div>
              
              <HarvestForm
                initialData={editingHarvest || undefined}
                onSubmit={handleHarvestSubmit}
                onCancel={() => {
                  setShowHarvestForm(false)
                  setEditingHarvest(null)
                }}
                mode={editingHarvest ? "edit" : "create"}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <Leaf className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Form Active</h3>
              <p className="text-muted-foreground mb-4">
                Click the button below to start logging a new harvest
              </p>
              <Button onClick={() => setShowHarvestForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Start Harvest Logging
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center py-8 border-t">
        <p className="text-muted-foreground">
          These components are part of the GroChain agricultural platform design system.
          Each component is built with accessibility, responsiveness, and agricultural-specific theming.
        </p>
      </div>
    </div>
  )
}
