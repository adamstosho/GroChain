"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Calendar, MapPin, QrCode, Eye, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { apiService } from "@/lib/api"
import type { Harvest } from "@/lib/types"
import Link from "next/link"
import Image from "next/image"

export default function HarvestsPage() {
  const [harvests, setHarvests] = useState<Harvest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchHarvests()
  }, [searchQuery, statusFilter, page])

  const fetchHarvests = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.set("cropType", searchQuery)
      if (statusFilter !== "all") params.set("status", statusFilter)
      params.set("page", String(page))
      params.set("limit", String(9))

      const response: any = await apiService.request(`/api/harvests?${params.toString()}`)
      setHarvests(response.harvests || response.data?.harvests || [])
      const pg = response.pagination || response.data?.pagination
      if (pg) {
        setTotalPages(pg.pages || 1)
      } else {
        setTotalPages(1)
      }
    } catch (error) {
      console.error("Failed to fetch harvests:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "verified":
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "listed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDeleteHarvest = async (harvestId: string) => {
    try {
      await apiService.deleteHarvest(harvestId)
      setHarvests(harvests.filter((h) => String((h as any)._id || (h as any).id) !== String(harvestId)))
    } catch (error) {
      console.error("Failed to delete harvest:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Harvest Management</h1>
            <p className="text-gray-600">Track and manage your agricultural harvests</p>
          </div>
          <Button asChild className="mt-4 md:mt-0">
            <Link href="/harvests/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Log New Harvest
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search harvests by crop, location, or batch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="listed">Listed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Harvests Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {harvests.map((harvest) => (
              <Card key={harvest.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="p-0 relative">
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <Image
                      src={harvest.images?.[0] || "/placeholder.svg?height=200&width=300&query=agricultural harvest"}
                      alt={harvest.cropType}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    <Badge className={`absolute top-2 right-2 ${getStatusColor(harvest.status)}`}>
                      {harvest.status}
                    </Badge>
                    <div className="absolute top-2 left-2 bg-white/90 rounded-lg p-2">
                      <QrCode className="h-4 w-4" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{harvest.cropType}</h3>
                    <span className="text-sm text-gray-500">#{(harvest as any).batchId || (harvest as any).batchNumber}</span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Harvested: {new Date((harvest as any).date || (harvest as any).harvestDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{harvest.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-green-600">{harvest.quantity}</span>
                      <span className="text-sm text-gray-500 ml-1">{harvest.unit}</span>
                    </div>
                    <Badge variant="outline">{harvest.qualityGrade || "Grade A"}</Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                      <Link href={`/harvests/${(harvest as any).batchId || (harvest as any)._id || (harvest as any).id}`}>
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/harvests/${harvest.id}/edit`}>
                        <Edit className="h-3 w-3" />
                      </Link>
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Harvest</DialogTitle>
                        </DialogHeader>
                        <p className="text-gray-600 mb-4">
                          Are you sure you want to delete this harvest? This action cannot be undone.
                        </p>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline">Cancel</Button>
                          <Button variant="destructive" onClick={() => handleDeleteHarvest(harvest.id)}>
                            Delete
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {harvests.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Calendar className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No harvests found</h3>
            <p className="text-gray-600 mb-4">Start by logging your first harvest</p>
            <Button asChild>
              <Link href="/harvests/new">Log New Harvest</Link>
            </Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              className="bg-transparent"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              className="bg-transparent"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
