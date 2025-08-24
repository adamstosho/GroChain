"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Package, 
  DollarSign, 
  CheckCircle, 
  Loader2, 
  AlertCircle,
  Plus,
  ShoppingCart
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface ApprovedHarvest {
  _id: string
  batchId: string
  cropType: string
  quantity: number
  unit: string
  date: string
  location: string
  quality: string
  description?: string
  verifiedAt: string
  verifiedBy: string
}

export function CreateListingFromHarvest() {
  const { user } = useAuth()
  const [approvedHarvests, setApprovedHarvests] = useState<ApprovedHarvest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedHarvest, setSelectedHarvest] = useState<ApprovedHarvest | null>(null)
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [creatingListing, setCreatingListing] = useState(false)

  useEffect(() => {
    if (user && user.role === 'farmer') {
      fetchApprovedHarvests()
    }
  }, [user])

  const fetchApprovedHarvests = async () => {
    try {
      setLoading(true)
      setError("")
      
      console.log("🔍 Fetching approved harvests...")
      const response = await api.request('/api/harvests?status=approved')
      console.log("🔍 Approved harvests response:", response)
      
      if (response.success && response.data) {
        setApprovedHarvests(response.data)
      } else {
        setApprovedHarvests([])
      }
    } catch (error) {
      console.error("🔍 Failed to fetch approved harvests:", error)
      setError("Failed to load approved harvests")
      setApprovedHarvests([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateListing = async (harvest: ApprovedHarvest) => {
    if (!price || parseFloat(price) <= 0) {
      toast.error("Please enter a valid price")
      return
    }

    try {
      setCreatingListing(true)
      
      const response = await api.request(`/api/harvest-approval/${harvest._id}/create-listing`, {
        method: 'POST',
        body: JSON.stringify({
          price: parseFloat(price),
          description: description.trim() || undefined
        })
      })

      if (response.success) {
        toast.success(`Marketplace listing created for ${harvest.cropType}!`)
        setSelectedHarvest(null)
        setPrice("")
        setDescription("")
        fetchApprovedHarvests() // Refresh the list
      } else {
        throw new Error(response.error || "Failed to create listing")
      }
    } catch (error) {
      console.error("🔍 Error creating listing:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create listing")
    } finally {
      setCreatingListing(false)
    }
  }

  const openCreateListingModal = (harvest: ApprovedHarvest) => {
    setSelectedHarvest(harvest)
    setPrice("")
    setDescription(harvest.description || "")
  }

  const closeModal = () => {
    setSelectedHarvest(null)
    setPrice("")
    setDescription("")
  }

  if (!user || user.role !== 'farmer') {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Access denied. Only farmers can create marketplace listings.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading approved harvests...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Create Marketplace Listings</h1>
            <p className="text-muted-foreground">
              Turn your approved harvests into marketplace listings to sell to customers
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Approved Harvests</p>
                    <p className="text-2xl font-bold text-foreground">{approvedHarvests.length}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Approved Harvests List */}
          {approvedHarvests.length > 0 ? (
            <div className="space-y-4">
              {approvedHarvests.map((harvest, index) => (
                <motion.div
                  key={harvest._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Harvest Info */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="font-mono">
                              {harvest.batchId}
                            </Badge>
                            <Badge variant="outline">
                              {harvest.cropType}
                            </Badge>
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Approved
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-muted-foreground" />
                              <span>{harvest.quantity} {harvest.unit}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-muted-foreground" />
                              <span>Quality: {harvest.quality}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-muted-foreground" />
                              <span>{harvest.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-muted-foreground" />
                              <span>Verified: {new Date(harvest.verifiedAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {harvest.description && (
                            <p className="text-sm text-muted-foreground">
                              {harvest.description}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => openCreateListingModal(harvest)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Create Listing
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No approved harvests</h3>
                <p className="text-muted-foreground">
                  Your harvests need to be approved by a partner before you can create marketplace listings
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Create Listing Modal */}
      {selectedHarvest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Create Marketplace Listing
              </h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <Label htmlFor="cropType">Crop Type</Label>
                  <Input
                    id="cropType"
                    value={selectedHarvest.cropType}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    value={`${selectedHarvest.quantity} ${selectedHarvest.unit}`}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div>
                  <Label htmlFor="price">Price per {selectedHarvest.unit} *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      ₦
                    </span>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="pl-8"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your product for customers..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={closeModal}
                  disabled={creatingListing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleCreateListing(selectedHarvest)}
                  disabled={creatingListing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {creatingListing ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Create Listing
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
