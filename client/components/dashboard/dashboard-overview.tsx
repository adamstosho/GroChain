"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Package, 
  BarChart3, 
  Brain, 
  Wifi, 
  Shield, 
  CreditCard, 
  QrCode,
  Cloud,
  Truck,
  Handshake,
  Settings,
  Home,
  TrendingUp,
  Activity
} from "lucide-react"
import Link from "next/link"

interface FeatureCard {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  roles: string[]
  badge?: string
}

const features: FeatureCard[] = [
  {
    title: "Dashboard",
    description: "Main dashboard and overview",
    href: "/dashboard",
    icon: <Home className="h-5 w-5" />,
    roles: ["admin", "manager", "partner", "farmer", "buyer", "aggregator"]
  },
  {
    title: "Harvests",
    description: "Manage harvest records and tracking",
    href: "/harvests",
    icon: <Package className="h-5 w-5" />,
    roles: ["admin", "manager", "partner", "farmer"]
  },
  {
    title: "Marketplace",
    description: "Buy and sell agricultural products",
    href: "/marketplace",
    icon: <BarChart3 className="h-5 w-5" />,
    roles: ["admin", "manager", "partner", "farmer", "buyer"]
  },
  {
    title: "Orders",
    description: "Manage orders and fulfillment",
    href: "/orders",
    icon: <Package className="h-5 w-5" />,
    roles: ["admin", "manager", "partner", "farmer", "buyer"]
  },
  {
    title: "Inventory",
    description: "Track inventory and stock levels",
    href: "/inventory",
    icon: <Package className="h-5 w-5" />,
    roles: ["admin", "manager", "partner"]
  },
  {
    title: "Quality Control",
    description: "Quality standards and inspections",
    href: "/quality",
    icon: <Shield className="h-5 w-5" />,
    roles: ["admin", "manager", "partner", "inspector"]
  },
  {
    title: "Analytics",
    description: "Data insights and reporting",
    href: "/analytics",
    icon: <BarChart3 className="h-5 w-5" />,
    roles: ["admin", "manager", "partner"]
  },
  {
    title: "AI & ML",
    description: "Artificial intelligence and machine learning",
    href: "/ai",
    icon: <Brain className="h-5 w-5" />,
    roles: ["admin", "manager", "partner"]
  },
  {
    title: "IoT & Sensors",
    description: "Internet of Things and sensor data",
    href: "/iot",
    icon: <Wifi className="h-5 w-5" />,
    roles: ["admin", "manager", "partner"]
  },
  {
    title: "Shipments",
    description: "Logistics and delivery management",
    href: "/shipments",
    icon: <Truck className="h-5 w-5" />,
    roles: ["admin", "manager", "partner", "farmer"]
  },
  {
    title: "Fintech",
    description: "Financial services and tools",
    href: "/fintech",
    icon: <CreditCard className="h-5 w-5" />,
    roles: ["admin", "manager", "partner", "farmer", "buyer"]
  },
  {
    title: "Verification",
    description: "BVN verification and compliance",
    href: "/verification",
    icon: <Shield className="h-5 w-5" />,
    roles: ["admin", "manager", "partner"]
  },
  {
    title: "PWA",
    description: "Progressive Web App features",
    href: "/pwa",
    icon: <Activity className="h-5 w-5" />,
    roles: ["admin", "manager", "partner", "farmer", "buyer", "aggregator"]
  },
  {
    title: "Language",
    description: "Multi-language support and translation",
    href: "/language",
    icon: <Settings className="h-5 w-5" />,
    roles: ["admin", "manager", "partner", "farmer", "buyer", "aggregator"]
  },
  {
    title: "QR Codes",
    description: "QR code generation and scanning",
    href: "/qr-codes",
    icon: <QrCode className="h-5 w-5" />,
    roles: ["admin", "manager", "partner", "farmer"]
  },
  {
    title: "Weather",
    description: "Weather forecasts and alerts",
    href: "/weather",
    icon: <Cloud className="h-5 w-5" />,
    roles: ["admin", "manager", "partner", "farmer"]
  },
  {
    title: "USSD",
    description: "USSD services and menu",
    href: "/ussd",
    icon: <Settings className="h-5 w-5" />,
    roles: ["admin", "manager", "partner", "farmer"]
  },
  {
    title: "Partners",
    description: "Partner management and onboarding",
    href: "/partners",
    icon: <Handshake className="h-5 w-5" />,
    roles: ["admin", "manager", "partner"]
  },
  {
    title: "Referrals",
    description: "Referral system and tracking",
    href: "/referrals",
    icon: <Handshake className="h-5 w-5" />,
    roles: ["admin", "manager", "partner"]
  },
  {
    title: "Commissions",
    description: "Commission tracking and payments",
    href: "/commissions",
    icon: <CreditCard className="h-5 w-5" />,
    roles: ["admin", "manager", "partner"]
  },
  {
    title: "Users",
    description: "User management and administration",
    href: "/users",
    icon: <Users className="h-5 w-5" />,
    roles: ["admin", "manager"]
  },
  {
    title: "Reports",
    description: "Comprehensive reporting system",
    href: "/reports",
    icon: <BarChart3 className="h-5 w-5" />,
    roles: ["admin", "manager", "partner"]
  },
  {
    title: "Settings",
    description: "System settings and preferences",
    href: "/settings",
    icon: <Settings className="h-5 w-5" />,
    roles: ["admin", "manager", "partner", "farmer", "buyer", "aggregator"]
  }
]

export function DashboardOverview() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  const userFeatures = features.filter(feature => 
    feature.roles.includes(user.role)
  )

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800"
      case "manager": return "bg-blue-100 text-blue-800"
      case "partner": return "bg-green-100 text-green-800"
      case "farmer": return "bg-amber-100 text-amber-800"
      case "buyer": return "bg-purple-100 text-purple-800"
      case "aggregator": return "bg-cyan-100 text-cyan-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Available Features</h1>
          <p className="text-muted-foreground">
            Features available for your role: <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {userFeatures.length} features available
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {userFeatures.map((feature) => (
          <Card key={feature.href} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {feature.icon}
                {feature.title}
                {feature.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {feature.description}
              </p>
              <Button asChild className="w-full">
                <Link href={feature.href}>
                  Access {feature.title}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {userFeatures.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              No features are currently available for your role.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Please contact an administrator to request access to additional features.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
