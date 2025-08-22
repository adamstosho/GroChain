"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { MainNavigation } from '@/components/navigation/main-navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Home, 
  Users, 
  Package, 
  BarChart3, 
  Brain, 
  Wifi, 
  Truck, 
  Shield, 
  Globe, 
  Smartphone, 
  QrCode, 
  Cloud, 
  Phone, 
  Handshake, 
  CreditCard, 
  Settings,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Package2,
  UserCheck,
  Globe2,
  Smartphone2,
  QrCode2,
  Cloud2,
  Phone2,
  Handshake2,
  CreditCard2,
  Settings2
} from 'lucide-react'
import Link from 'next/link'

interface FeatureCard {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  status: 'active' | 'inactive' | 'coming-soon'
  badge?: string
  roles: string[]
}

interface UnifiedDashboardLayoutProps {
  children: React.ReactNode
  showNavigation?: boolean
  showSidebar?: boolean
}

export function UnifiedDashboardLayout({ 
  children, 
  showNavigation = true, 
  showSidebar = true 
}: UnifiedDashboardLayoutProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [quickStats, setQuickStats] = useState<any>({})

  useEffect(() => {
    // Fetch recent activity and quick stats
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Mock data for now - replace with actual API calls
      setRecentActivity([
        {
          id: 1,
          type: 'harvest',
          message: 'New harvest recorded for Rice',
          timestamp: new Date(),
          status: 'completed'
        },
        {
          id: 2,
          type: 'marketplace',
          message: 'Order #12345 placed successfully',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          status: 'pending'
        },
        {
          id: 3,
          type: 'quality',
          message: 'Quality inspection completed for Batch #789',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          status: 'completed'
        }
      ])

      setQuickStats({
        totalHarvests: 1250,
        activeOrders: 89,
        qualityScore: 94.5,
        revenue: 2500000,
        pendingTasks: 12,
        alerts: 3
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
  }

  const featureCards: FeatureCard[] = [
    {
      title: 'Harvests',
      description: 'Manage harvest records and tracking',
      href: '/harvests',
      icon: <Package className="h-5 w-5" />,
      status: 'active',
      roles: ['admin', 'manager', 'partner', 'farmer']
    },
    {
      title: 'Marketplace',
      description: 'Buy and sell agricultural products',
      href: '/marketplace',
      icon: <BarChart3 className="h-5 w-5" />,
      status: 'active',
      roles: ['admin', 'manager', 'partner', 'farmer', 'buyer']
    },
    {
      title: 'Orders',
      description: 'Manage orders and fulfillment',
      href: '/orders',
      icon: <Package2 className="h-5 w-5" />,
      status: 'active',
      roles: ['admin', 'manager', 'partner', 'farmer', 'buyer']
    },
    {
      title: 'Inventory',
      description: 'Track inventory and stock levels',
      href: '/inventory',
      icon: <Package className="h-5 w-5" />,
      status: 'active',
      roles: ['admin', 'manager', 'partner']
    },
    {
      title: 'Quality Control',
      description: 'Quality standards and inspections',
      href: '/quality',
      icon: <Shield className="h-5 w-5" />,
      status: 'active',
      roles: ['admin', 'manager', 'partner', 'inspector']
    },
    {
      title: 'Analytics',
      description: 'Data insights and reporting',
      href: '/analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      status: 'active',
      roles: ['admin', 'manager', 'partner']
    },
    {
      title: 'AI & ML',
      description: 'Artificial intelligence and machine learning',
      href: '/ai',
      icon: <Brain className="h-5 w-5" />,
      status: 'active',
      roles: ['admin', 'manager', 'partner', 'farmer']
    },
    {
      title: 'IoT & Sensors',
      description: 'Internet of Things and sensor data',
      href: '/iot',
      icon: <Wifi className="h-5 w-5" />,
      status: 'active',
      roles: ['admin', 'manager', 'partner', 'farmer']
    },
    {
      title: 'Shipments',
      description: 'Logistics and delivery management',
      href: '/shipments',
      icon: <Truck className="h-5 w-5" />,
      status: 'active',
      roles: ['admin', 'manager', 'partner', 'farmer']
    },
    {
      title: 'Fintech',
      description: 'Financial services and tools',
      href: '/fintech',
      icon: <CreditCard className="h-5 w-5" />,
      status: 'active',
      roles: ['admin', 'manager', 'partner', 'farmer', 'buyer']
    },
    {
      title: 'Verification',
      description: 'BVN verification and compliance',
      href: '/verification',
      icon: <Shield className="h-5 w-5" />,
      status: 'active',
      roles: ['admin', 'manager', 'partner']
    },
    {
      title: 'PWA',
      description: 'Progressive Web App features',
      href: '/pwa',
      icon: <Smartphone className="h-5 w-5" />,
      status: 'active',
      roles: ['admin', 'manager', 'partner', 'farmer', 'buyer', 'aggregator']
    },
    {
      title: 'Language',
      description: 'Multi-language support and translation',
      href: '/language',
      icon: <Globe className="h-5 w-5" />,
      status: 'active',
      roles: ['admin', 'manager', 'partner', 'farmer', 'buyer', 'aggregator']
    },
    {
      title: 'QR Codes',
      description: 'QR code generation and scanning',
      href: '/qr-codes',
      icon: <QrCode className="h-5 w-5" />,
      status: 'active',
      roles: ['admin', 'manager', 'partner', 'farmer']
    },
    {
      title: 'Weather',
      description: 'Weather forecasts and alerts',
      href: '/weather',
      icon: <Cloud className="h-5 w-5" />,
      status: 'active',
      roles: ['admin', 'manager', 'partner', 'farmer']
    },
    {
      title: 'USSD',
      description: 'USSD services and menu',
      href: '/ussd',
      icon: <Phone className="h-5 w-5" />,
      status: 'active',
      roles: ['admin', 'manager', 'partner', 'farmer']
    },
    {
      title: 'Partners',
      description: 'Partner management and onboarding',
      href: '/partners',
      icon: <Handshake className="h-5 w-5" />,
      status: 'active',
      roles: ['admin', 'manager', 'partner']
    },
    {
      title: 'Referrals',
      description: 'Referral system and tracking',
      href: '/referrals',
      icon: <Handshake className="h-5 w-5" />,
      status: 'active',
      roles: ['admin', 'manager', 'partner']
    },
    {
      title: 'Commissions',
      description: 'Commission tracking and payments',
      href: '/commissions',
      icon: <CreditCard className="h-5 w-5" />,
      status: 'active',
      roles: ['admin', 'manager', 'partner']
    },
    {
      title: 'Users',
      description: 'User management and administration',
      href: '/users',
      icon: <Users className="h-5 w-5" />,
      status: 'active',
      roles: ['admin', 'manager']
    },
    {
      title: 'Reports',
      description: 'Comprehensive reporting system',
      href: '/reports',
      icon: <BarChart3 className="h-5 w-5" />,
      status: 'active',
      roles: ['admin', 'manager', 'partner']
    },
    {
      title: 'Settings',
      description: 'System settings and preferences',
      href: '/settings',
      icon: <Settings className="h-5 w-5" />,
      status: 'active',
      roles: ['admin', 'manager', 'partner', 'farmer', 'buyer', 'aggregator']
    }
  ]

  const filteredFeatureCards = featureCards.filter(card => 
    card.roles.includes(user?.role || '')
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600'
      case 'pending':
        return 'text-yellow-600'
      case 'failed':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const renderQuickStats = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Harvests</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{quickStats.totalHarvests?.toLocaleString() || 0}</div>
          <p className="text-xs text-muted-foreground">
            +20.1% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
          <Package2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{quickStats.activeOrders || 0}</div>
          <p className="text-xs text-muted-foreground">
            +5.2% from last week
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{quickStats.qualityScore || 0}%</div>
          <p className="text-xs text-muted-foreground">
            +2.1% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₦{(quickStats.revenue || 0).toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            +12.3% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{quickStats.pendingTasks || 0}</div>
          <p className="text-xs text-muted-foreground">
            -8.2% from last week
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alerts</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{quickStats.alerts || 0}</div>
          <p className="text-xs text-muted-foreground">
            +1.5% from yesterday
          </p>
        </CardContent>
      </Card>
    </div>
  )

  const renderFeatureGrid = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredFeatureCards.map((card) => (
        <Card key={card.href} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {card.icon}
                <CardTitle className="text-base">{card.title}</CardTitle>
              </div>
              <Badge 
                variant={card.status === 'active' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {card.status === 'active' ? 'Active' : card.status === 'coming-soon' ? 'Coming Soon' : 'Inactive'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground mb-3">
              {card.description}
            </p>
            <Button asChild className="w-full" size="sm">
              <Link href={card.href}>
                Access {card.title}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderRecentActivity = () => (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest updates and activities across the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4">
              {getStatusIcon(activity.status)}
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.message}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.timestamp.toLocaleString()}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {activity.type}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {showNavigation && <MainNavigation />}
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name || user.email}!</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your GroChain platform today.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight mb-4">Quick Stats</h2>
                {renderQuickStats()}
              </div>
              
              <Separator />
              
              <div>
                <h2 className="text-2xl font-semibold tracking-tight mb-4">Recent Activity</h2>
                {renderRecentActivity()}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight mb-4">All Features</h2>
              <p className="text-muted-foreground mb-6">
                Access all available features based on your role and permissions.
              </p>
              {renderFeatureGrid()}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight mb-4">Activity Feed</h2>
              {renderRecentActivity()}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight mb-4">Analytics Overview</h2>
              <p className="text-muted-foreground mb-6">
                Detailed analytics and insights for your platform.
              </p>
              {renderQuickStats()}
            </div>
          </TabsContent>
        </Tabs>

        {/* Main Content Area */}
        <div className="mt-8">
          {children}
        </div>
      </div>
    </div>
  )
}
