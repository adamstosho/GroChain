"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Package, 
  MapPin, 
  Calendar, 
  User, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Loader2, 
  AlertCircle,
  Clock
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface PendingHarvest {
  _id: string
  batchId: string
  cropType: string
  quantity: number
  unit: string
  date: string
  location: string
  geoLocation: { lat: number; lng: number }
  quality: string
  description?: string
  farmer: {
    _id: string
    name: string
    email: string
    phone: string
    location: string
  }
  createdAt: string
}

export function HarvestApprovalList() {
  const { user } = useAuth()
  const [pendingHarvests, setPendingHarvests] = useState<PendingHarvest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedHarvest, setSelectedHarvest] = useState<PendingHarvest | null>(null)
  const [approvalLoading, setApprovalLoading] = useState(false)
  const [quality, setQuality] = useState("good")
  const [notes, setNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    if (user && (user.role === 'partner' || user.role === 'admin')) {
      fetchPendingHarvests()
    }
  }, [user])

  const fetchPendingHarvests = async () => {
    try {
      setLoading(true)
      setError("")
      
      console.log("🔍 Fetching pending harvests...")
      const response = await api.request('/api/harvest-approval/pending')
      console.log("🔍 Pending harvests response:", response)
      
      if (response.success && response.data) {
        setPendingHarvests(response.data)
      } else {
        setPendingHarvests([])
      }
    } catch (error) {
      console.error("🔍 Failed to fetch pending harvests:", error)
      setError("Failed to load pending harvests")
      setPendingHarvests([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (harvest: PendingHarvest) => {
    try {
      setApprovalLoading(true)
      
      const response = await api.request(`/api/harvest-approval/${harvest._id}/approve`, {
        method: 'PATCH',
        body: JSON.stringify({
          quality,
          notes: notes.trim() || undefined
        })
      })

      if (response.success) {
        toast.success(`Harvest ${harvest.batchId} approved successfully!`)
        setSelectedHarvest(null)
        setQuality("good")
        setNotes("")
        fetchPendingHarvests() // Refresh the list
      } else {
        throw new Error(response.error || "Failed to approve harvest")
      }
    } catch (error) {
      console.error("🔍 Error approving harvest:", error)
      toast.error(error instanceof Error ? error.message : "Failed to approve harvest")
    } finally {
      setApprovalLoading(false)
    }
  }

  const handleReject = async (harvest: PendingHarvest) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason")
      return
    }

    try {
      setApprovalLoading(true)
      
      const response = await api.request(`/api/harvest-approval/${harvest._id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({
          rejectionReason: rejectionReason.trim()
        })
      })

      if (response.success) {
        toast.success(`Harvest ${harvest.batchId} rejected`)
        setSelectedHarvest(null)
        setRejectionReason("")
        fetchPendingHarvests() // Refresh the list
      } else {
        throw new Error(response.error || "Failed to reject harvest")
      }
    } catch (error) {
      console.error("🔍 Error rejecting harvest:", error)
      toast.error(error instanceof Error ? error.message : "Failed to reject harvest")
    } finally {
      setApprovalLoading(false)
    }
  }

  const openApprovalModal = (harvest: PendingHarvest) => {
    setSelectedHarvest(harvest)
    setQuality("good")
    setNotes("")
    setRejectionReason("")
  }

  const closeModal = () => {
    setSelectedHarvest(null)
    setQuality("good")
    setNotes("")
    setRejectionReason("")
  }

  if (!user || (user.role !== 'partner' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Access denied. Only partners and admins can view harvest approvals.
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
              <p className="text-muted-foreground">Loading pending harvests...</p>
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Harvest Approval Queue</h1>
            <p className="text-muted-foreground">
              Review and approve pending harvest submissions from farmers
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
                    <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                    <p className="text-2xl font-bold text-foreground">{pendingHarvests.length}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Harvests List */}
          {pendingHarvests.length > 0 ? (
            <div className="space-y-4">
              {pendingHarvests.map((harvest, index) => (
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
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-muted-foreground" />
                              <span>{harvest.quantity} {harvest.unit}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{new Date(harvest.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span>{harvest.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span>{harvest.farmer.name}</span>
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
                            variant="outline"
                            size="sm"
                            onClick={() => openApprovalModal(harvest)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Review
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
                <h3 className="text-lg font-medium text-foreground mb-2">No pending harvests</h3>
                <p className="text-muted-foreground">
                  All harvests have been reviewed and processed
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Approval Modal */}
      {selectedHarvest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Review Harvest: {selectedHarvest.batchId}
              </h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-medium">Quality Assessment</label>
                  <Select value={quality} onValueChange={setQuality}>
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

                <div>
                  <label className="text-sm font-medium">Notes (Optional)</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this harvest..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Rejection Reason (if rejecting)</label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this harvest is being rejected..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={closeModal}
                  disabled={approvalLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReject(selectedHarvest)}
                  disabled={approvalLoading}
                >
                  {approvalLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  Reject
                </Button>
                <Button
                  onClick={() => handleApprove(selectedHarvest)}
                  disabled={approvalLoading}
                >
                  {approvalLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Approve
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
