import { useState, useEffect, useCallback } from 'react'
import { useToast } from './use-toast'
import { apiService } from '@/lib/api'

interface Farmer {
  _id: string
  name: string
  email: string
  phone: string
  location: string
  status: 'active' | 'inactive' | 'suspended'
  joinedAt: Date
  lastActivity: Date
  totalHarvests: number
  totalEarnings: number
  partner: string
}

interface FarmerFilters {
  searchTerm?: string
  status?: string
  location?: string
  page?: number
  limit?: number
}

// Mock data for development
const mockFarmers: Farmer[] = [
  {
    _id: "1",
    name: "John Doe",
    email: "john@farmer.com",
    phone: "+2348012345678",
    location: "Lagos",
    status: "active",
    joinedAt: new Date("2024-01-15"),
    lastActivity: new Date("2024-01-20"),
    totalHarvests: 12,
    totalEarnings: 45000,
    partner: "partner_id"
  },
  {
    _id: "2",
    name: "Jane Smith",
    email: "jane@farmer.com",
    phone: "+2348012345679",
    location: "Abuja",
    status: "active",
    joinedAt: new Date("2024-01-10"),
    lastActivity: new Date("2024-01-19"),
    totalHarvests: 8,
    totalEarnings: 32000,
    partner: "partner_id"
  },
  {
    _id: "3",
    name: "Mike Johnson",
    email: "mike@farmer.com",
    phone: "+2348012345680",
    location: "Kano",
    status: "inactive",
    joinedAt: new Date("2024-01-05"),
    lastActivity: new Date("2024-01-15"),
    totalHarvests: 5,
    totalEarnings: 18000,
    partner: "partner_id"
  },
  {
    _id: "4",
    name: "Sarah Wilson",
    email: "sarah@farmer.com",
    phone: "+2348012345681",
    location: "Port Harcourt",
    status: "active",
    joinedAt: new Date("2024-01-12"),
    lastActivity: new Date("2024-01-21"),
    totalHarvests: 15,
    totalEarnings: 52000,
    partner: "partner_id"
  },
  {
    _id: "5",
    name: "David Brown",
    email: "david@farmer.com",
    phone: "+2348012345682",
    location: "Ibadan",
    status: "suspended",
    joinedAt: new Date("2024-01-08"),
    lastActivity: new Date("2024-01-14"),
    totalHarvests: 3,
    totalEarnings: 12000,
    partner: "partner_id"
  }
]

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

  // Fetch farmers
  const fetchFarmers = useCallback(async () => {
    try {
      setIsLoading(true)
      // Try API call first, fallback to mock data
      try {
        const response = await apiService.getFarmers(filters)
        const result = {
          farmers: response.data.docs || [],
          pagination: {
            currentPage: response.data.page || 1,
            totalPages: response.data.totalPages || 1,
            totalItems: response.data.totalDocs || 0,
            itemsPerPage: response.data.limit || 10
          }
        }
        setFarmers(result.farmers)
        setPagination(result.pagination)
      } catch (error) {
        console.warn('API call failed, using mock data:', error)
        // Fallback to mock data
        setFarmers(mockFarmers)
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: mockFarmers.length,
          itemsPerPage: mockFarmers.length
        })
      }
    } catch (error: any) {
      toast({
        title: "Error loading farmers",
        description: error.message || "Failed to load farmers",
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
