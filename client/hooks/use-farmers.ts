import { useState, useEffect, useCallback } from 'react'
import { useToast } from './use-toast'
import { api } from '@/lib/api'

interface Farmer {
  id: string
  name: string
  email: string
  phone: string
  location: string
  status: 'active' | 'inactive' | 'suspended'
  joinedAt: string
  _id?: string
}

interface FarmerFilters {
  searchTerm?: string
  status?: string
  location?: string
  page?: number
  limit?: number
}

// Real data from backend API only - no mock data

export function useFarmers() {
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [filteredFarmers, setFilteredFarmers] = useState<Farmer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<FarmerFilters>({
    searchTerm: "",
    status: "all",
    location: "all",
    page: 1,
    limit: 10
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  })
  const { toast } = useToast()

  // Fetch farmers from real API
  const fetchFarmers = useCallback(async () => {
    try {
      setIsLoading(true)

      const response = await api.getPartnerFarmers({
        limit: filters.limit || 50,
        search: filters.searchTerm,
        ...filters
      })

      if (response.data) {
        const farmersData = response.data.farmers || []
        setFarmers(farmersData)
        setPagination({
          currentPage: response.data.page || 1,
          totalPages: response.data.totalPages || 1,
          totalItems: response.data.total || 0,
          itemsPerPage: filters.limit || 50
        })
      }
    } catch (error: any) {
      console.error('Failed to fetch farmers:', error)
      setFarmers([])
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: filters.limit || 50
      })

      toast({
        title: "Error loading farmers",
        description: error?.message || "Failed to load farmers data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [filters, toast])

  // Filter farmers
  const filterFarmers = useCallback(() => {
    let filtered = [...farmers]

    if (filters.searchTerm) {
      filtered = filtered.filter(farmer =>
        farmer.name.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
        farmer.email.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
        farmer.phone.includes(filters.searchTerm!)
      )
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(farmer => farmer.status === filters.status)
    }

    if (filters.location && filters.location !== 'all') {
      filtered = filtered.filter(farmer => farmer.location === filters.location)
    }

    setFilteredFarmers(filtered)
  }, [farmers, filters])

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<FarmerFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }))
  }, [])

  // Add new farmer
  const addFarmer = useCallback(async (farmerData: Omit<Farmer, '_id' | 'joinedAt' | 'lastActivity'>) => {
    try {
      const newFarmer: Farmer = {
        ...farmerData,
        _id: Math.random().toString(36).substr(2, 9),
        joinedAt: new Date(),
        lastActivity: new Date()
      }
      
      setFarmers(prev => [newFarmer, ...prev])
      toast({
        title: "Farmer added",
        description: "New farmer has been added successfully",
      })
      
      return newFarmer
    } catch (error: any) {
      toast({
        title: "Error adding farmer",
        description: error.message || "Failed to add farmer",
        variant: "destructive"
      })
      throw error
    }
  }, [toast])

  // Update farmer
  const updateFarmer = useCallback(async (id: string, updates: Partial<Farmer>) => {
    try {
      setFarmers(prev => 
        prev.map(farmer => 
          farmer._id === id ? { ...farmer, ...updates } : farmer
        )
      )
      
      toast({
        title: "Farmer updated",
        description: "Farmer information has been updated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error updating farmer",
        description: error.message || "Failed to update farmer",
        variant: "destructive"
      })
      throw error
    }
  }, [toast])

  // Delete farmer
  const deleteFarmer = useCallback(async (id: string) => {
    try {
      setFarmers(prev => prev.filter(farmer => farmer._id !== id))
      
      toast({
        title: "Farmer removed",
        description: "Farmer has been removed successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error removing farmer",
        description: error.message || "Failed to remove farmer",
        variant: "destructive"
      })
      throw error
    }
  }, [toast])

  // Refresh data
  const refreshData = useCallback(async () => {
    await fetchFarmers()
    toast({
      title: "Data refreshed",
      description: "Farmer data has been updated",
    })
  }, [fetchFarmers, toast])

  // Load initial data
  useEffect(() => {
    fetchFarmers()
  }, [fetchFarmers])

  // Apply filters when they change
  useEffect(() => {
    filterFarmers()
  }, [filterFarmers])

  return {
    // State
    farmers,
    filteredFarmers,
    isLoading,
    filters,
    pagination,
    
    // Actions
    fetchFarmers,
    updateFilters,
    addFarmer,
    updateFarmer,
    deleteFarmer,
    refreshData,
    
    // Computed values
    activeFarmers: farmers.filter(f => f.status === 'active'),
    inactiveFarmers: farmers.filter(f => f.status === 'inactive'),
    suspendedFarmers: farmers.filter(f => f.status === 'suspended'),
    totalFarmers: farmers.length,
    totalActiveFarmers: farmers.filter(f => f.status === 'active').length
  }
}
