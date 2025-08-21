"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { 
  Package, 
  Warehouse, 
  Truck, 
  BarChart3, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  ShoppingCart, 
  Users,
  Building,
  MapPin,
  Boxes,
  Target,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface InventoryItem {
  id: string
  name: string
  category: string
  sku: string
  currentStock: number
  minStock: number
  maxStock: number
  unitPrice: number
  totalValue: number
  location: string
  supplier: string
  lastUpdated: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired'
}

interface InventoryOverview {
  totalItems: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
  expiringItems: number
  totalCategories: number
  totalSuppliers: number
  totalWarehouses: number
}

interface StockMovement {
  id: string
  itemId: string
  itemName: string
  type: 'inbound' | 'outbound' | 'adjustment' | 'transfer'
  quantity: number
  previousStock: number
  newStock: number
  reason: string
  warehouse: string
  createdBy: string
  createdAt: string
}

interface Warehouse {
  id: string
  name: string
  location: string
  capacity: number
  currentUtilization: number
  manager: string
  contact: string
  status: 'active' | 'inactive' | 'maintenance'
}

interface Supplier {
  id: string
  name: string
  contact: string
  email: string
  phone: string
  address: string
  category: string
  rating: number
  status: 'active' | 'inactive' | 'pending'
  totalOrders: number
  lastOrderDate: string
}

export function InventoryDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Data states
  const [overview, setOverview] = useState<InventoryOverview | null>(null)
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedWarehouse, setSelectedWarehouse] = useState("all")

  useEffect(() => {
    if (user) {
      fetchInventoryData()
    }
  }, [user])

  const fetchInventoryData = async () => {
    try {
      setLoading(true)
      setError("")

      // Since backend has limited inventory endpoints, we'll use mock data for now
      // In production: const response = await api.getInventoryOverview()
      
      const mockOverview = generateMockOverview()
      const mockItems = generateMockInventoryItems()
      const mockMovements = generateMockStockMovements()
      const mockWarehouses = generateMockWarehouses()
      const mockSuppliers = generateMockSuppliers()

      setOverview(mockOverview)
      setInventoryItems(mockItems)
      setStockMovements(mockMovements)
      setWarehouses(mockWarehouses)
      setSuppliers(mockSuppliers)
    } catch (error) {
      console.error("Inventory fetch error:", error)
      setError("Failed to load inventory data")
      toast.error("Failed to load inventory data")
    } finally {
      setLoading(false)
    }
  }

  const generateMockOverview = (): InventoryOverview => {
    return {
      totalItems: 1247,
      totalValue: 8750000, // ₦8.75M
      lowStockItems: 23,
      outOfStockItems: 8,
      expiringItems: 15,
      totalCategories: 12,
      totalSuppliers: 45,
      totalWarehouses: 8
    }
  }

  const generateMockInventoryItems = (): InventoryItem[] => {
    const categories = ['Seeds', 'Fertilizers', 'Tools', 'Equipment', 'Pesticides', 'Packaging']
    const locations = ['Warehouse A', 'Warehouse B', 'Warehouse C', 'Main Storage']
    const suppliers = ['AgriSupply Ltd', 'Farm Tools Co', 'Green Valley', 'Harvest Plus']
    const statuses: InventoryItem['status'][] = ['in_stock', 'low_stock', 'out_of_stock', 'expired']

    return Array.from({ length: 50 }, (_, index) => {
      const currentStock = Math.floor(Math.random() * 1000)
      const minStock = Math.floor(Math.random() * 50) + 10
      const unitPrice = Math.floor(Math.random() * 50000) + 1000
      
      let status: InventoryItem['status'] = 'in_stock'
      if (currentStock === 0) status = 'out_of_stock'
      else if (currentStock <= minStock) status = 'low_stock'
      else if (Math.random() < 0.05) status = 'expired'

      return {
        id: `item_${String(index + 1).padStart(3, '0')}`,
        name: `${categories[Math.floor(Math.random() * categories.length)]} Product ${index + 1}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        sku: `SKU${String(index + 1).padStart(6, '0')}`,
        currentStock,
        minStock,
        maxStock: minStock * 5,
        unitPrice,
        totalValue: currentStock * unitPrice,
        location: locations[Math.floor(Math.random() * locations.length)],
        supplier: suppliers[Math.floor(Math.random() * suppliers.length)],
        lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        status
      }
    })
  }

  const generateMockStockMovements = (): StockMovement[] => {
    const types: StockMovement['type'][] = ['inbound', 'outbound', 'adjustment', 'transfer']
    const reasons = ['Purchase', 'Sale', 'Damaged', 'Expired', 'Transfer', 'Adjustment', 'Return']
    const warehouses = ['Warehouse A', 'Warehouse B', 'Warehouse C', 'Main Storage']
    const users = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson']

    return Array.from({ length: 30 }, (_, index) => {
      const type = types[Math.floor(Math.random() * types.length)]
      const quantity = Math.floor(Math.random() * 100) + 1
      const previousStock = Math.floor(Math.random() * 500)
      const isInbound = type === 'inbound'
      const newStock = isInbound ? previousStock + quantity : Math.max(0, previousStock - quantity)

      return {
        id: `movement_${String(index + 1).padStart(3, '0')}`,
        itemId: `item_${String(Math.floor(Math.random() * 50) + 1).padStart(3, '0')}`,
        itemName: `Product ${Math.floor(Math.random() * 50) + 1}`,
        type,
        quantity: isInbound ? quantity : -quantity,
        previousStock,
        newStock,
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        warehouse: warehouses[Math.floor(Math.random() * warehouses.length)],
        createdBy: users[Math.floor(Math.random() * users.length)],
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    })
  }

  const generateMockWarehouses = (): Warehouse[] => {
    const statuses: Warehouse['status'][] = ['active', 'inactive', 'maintenance']
    
    return Array.from({ length: 8 }, (_, index) => ({
      id: `warehouse_${index + 1}`,
      name: `Warehouse ${String.fromCharCode(65 + index)}`,
      location: `Location ${index + 1}, Lagos State`,
      capacity: Math.floor(Math.random() * 5000) + 1000,
      currentUtilization: Math.floor(Math.random() * 80) + 10,
      manager: `Manager ${index + 1}`,
      contact: `+234${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      status: statuses[Math.floor(Math.random() * statuses.length)]
    }))
  }

  const generateMockSuppliers = (): Supplier[] => {
    const categories = ['Seeds', 'Fertilizers', 'Tools', 'Equipment', 'Pesticides', 'Packaging']
    const statuses: Supplier['status'][] = ['active', 'inactive', 'pending']
    
    return Array.from({ length: 15 }, (_, index) => ({
      id: `supplier_${String(index + 1).padStart(3, '0')}`,
      name: `Supplier ${index + 1} Ltd`,
      contact: `Contact Person ${index + 1}`,
      email: `supplier${index + 1}@example.com`,
      phone: `+234${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      address: `Address ${index + 1}, Nigeria`,
      category: categories[Math.floor(Math.random() * categories.length)],
      rating: Math.floor(Math.random() * 5) + 1,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      totalOrders: Math.floor(Math.random() * 100) + 1,
      lastOrderDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
    }))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_stock":
        return <Badge variant="default" className="bg-green-500">In Stock</Badge>
      case "low_stock":
        return <Badge variant="secondary" className="bg-yellow-500">Low Stock</Badge>
      case "out_of_stock":
        return <Badge variant="destructive">Out of Stock</Badge>
      case "expired":
        return <Badge variant="destructive" className="bg-red-600">Expired</Badge>
      case "active":
        return <Badge variant="default" className="bg-green-500">Active</Badge>
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>
      case "maintenance":
        return <Badge variant="outline" className="text-orange-600">Maintenance</Badge>
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getMovementIcon = (type: StockMovement['type']) => {
    switch (type) {
      case 'inbound':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'outbound':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case 'adjustment':
        return <Target className="h-4 w-4 text-blue-500" />
      case 'transfer':
        return <Truck className="h-4 w-4 text-purple-500" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  if (!user) {
    return (
      <DashboardLayout user={user as any}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Package className="h-8 w-8 animate-pulse mx-auto mb-4" />
            <p>Loading inventory dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0"
        >
          <div>
            <h1 className="text-3xl font-bold">Inventory & Supply Chain Management</h1>
            <p className="text-muted-foreground">
              Comprehensive inventory tracking, warehouse management, and supply chain optimization
            </p>
          </div>

          <div className="flex space-x-2">
            <Button onClick={fetchInventoryData} disabled={loading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </motion.div>

        {/* Overview Cards */}
        {overview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.totalItems.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Across {overview.totalCategories} categories
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{(overview.totalValue / 1000000).toFixed(1)}M</div>
                <p className="text-xs text-muted-foreground">
                  Current inventory valuation
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {overview.lowStockItems + overview.outOfStockItems}
                </div>
                <p className="text-xs text-muted-foreground">
                  {overview.lowStockItems} low stock, {overview.outOfStockItems} out of stock
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Warehouses</CardTitle>
                <Warehouse className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.totalWarehouses}</div>
                <p className="text-xs text-muted-foreground">
                  Active storage locations
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="movements">Movements</TabsTrigger>
              <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
              <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Stock Movements */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Stock Movements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stockMovements.slice(0, 5).map((movement) => (
                        <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getMovementIcon(movement.type)}
                            <div>
                              <p className="font-medium">{movement.itemName}</p>
                              <p className="text-sm text-muted-foreground">
                                {movement.type} • {movement.warehouse}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(movement.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Low Stock Alerts */}
                <Card>
                  <CardHeader>
                    <CardTitle>Stock Alerts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {inventoryItems
                        .filter(item => item.status === 'low_stock' || item.status === 'out_of_stock')
                        .slice(0, 5)
                        .map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                SKU: {item.sku} • {item.location}
                              </p>
                            </div>
                            <div className="text-right">
                              {getStatusBadge(item.status)}
                              <p className="text-sm text-muted-foreground mt-1">
                                Stock: {item.currentStock}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="items" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Items</CardTitle>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Seeds">Seeds</SelectItem>
                        <SelectItem value="Fertilizers">Fertilizers</SelectItem>
                        <SelectItem value="Tools">Tools</SelectItem>
                        <SelectItem value="Equipment">Equipment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {inventoryItems
                      .filter(item => 
                        (selectedCategory === 'all' || item.category === selectedCategory) &&
                        item.name.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .slice(0, 10)
                      .map((item) => (
                        <div key={item.id} className="border rounded-lg p-4 transition-colors hover:bg-muted/50">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-medium">{item.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                SKU: {item.sku} • {item.category} • {item.location}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(item.status)}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Current Stock</p>
                              <p className="font-medium">{item.currentStock}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Unit Price</p>
                              <p className="font-medium">₦{item.unitPrice.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Total Value</p>
                              <p className="font-medium">₦{item.totalValue.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Supplier</p>
                              <p className="font-medium">{item.supplier}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="movements" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Stock Movements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stockMovements.slice(0, 15).map((movement) => (
                      <div key={movement.id} className="border rounded-lg p-4 transition-colors hover:bg-muted/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            {getMovementIcon(movement.type)}
                            <div>
                              <h3 className="font-medium">{movement.itemName}</h3>
                              <p className="text-sm text-muted-foreground">
                                {movement.type.charAt(0).toUpperCase() + movement.type.slice(1)} • {movement.warehouse}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(movement.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          <p>Reason: {movement.reason} • By: {movement.createdBy}</p>
                          <p>Stock: {movement.previousStock} → {movement.newStock}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="warehouses" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Warehouses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {warehouses.map((warehouse) => (
                      <Card key={warehouse.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                            {getStatusBadge(warehouse.status)}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Location</span>
                              <span className="text-sm">{warehouse.location}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Capacity</span>
                              <span className="text-sm">{warehouse.capacity.toLocaleString()} units</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Utilization</span>
                              <span className="text-sm">{warehouse.currentUtilization}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Manager</span>
                              <span className="text-sm">{warehouse.manager}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 mt-3">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${warehouse.currentUtilization}%` }}
                              ></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="suppliers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Suppliers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {suppliers.map((supplier) => (
                      <div key={supplier.id} className="border rounded-lg p-4 transition-colors hover:bg-muted/50">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-medium">{supplier.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {supplier.category} • {supplier.contact}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(supplier.status)}
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className={`text-sm ${i < supplier.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Email</p>
                            <p className="font-medium">{supplier.email}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Phone</p>
                            <p className="font-medium">{supplier.phone}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total Orders</p>
                            <p className="font-medium">{supplier.totalOrders}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Last Order</p>
                            <p className="font-medium">{new Date(supplier.lastOrderDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Inventory Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Inventory Turnover</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                          </div>
                          <span className="text-sm font-medium">68%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Stock Accuracy</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                          </div>
                          <span className="text-sm font-medium">92%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Order Fulfillment</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                          </div>
                          <span className="text-sm font-medium">87%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Supply Chain Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Delivery Performance</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                          </div>
                          <span className="text-sm font-medium">85%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Supplier Reliability</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                          </div>
                          <span className="text-sm font-medium">78%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Cost Efficiency</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div className="bg-orange-500 h-2 rounded-full" style={{ width: '73%' }}></div>
                          </div>
                          <span className="text-sm font-medium">73%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
