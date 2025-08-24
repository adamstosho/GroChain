"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Leaf,
  Menu,
  X,
  Home,
  Package,
  QrCode,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Sun,
  Moon,
  BarChart3,
  CreditCard,
  Truck,
  Upload,
  UserPlus,
  Shield,
  Brain,
  Wifi,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import OfflineStatus from "@/components/pwa/offline-status"
import NotificationBell from "@/components/notifications/notification-bell"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface User {
  id: string
  name: string
  email: string
  role: string
  phone: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

interface DashboardLayoutProps {
  children: React.ReactNode
  user: User
}

const navigationItems = {
  farmer: [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "My Harvests", href: "/harvests", icon: Package },
    { name: "QR Codes", href: "/qr-codes", icon: QrCode },
    { name: "Marketplace", href: "/marketplace", icon: ShoppingCart },
    { name: "Fintech", href: "/fintech", icon: CreditCard },
    { name: "Shipments", href: "/shipments", icon: Truck },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Weather", href: "/weather", icon: BarChart3 },
  ],
  buyer: [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Marketplace", href: "/marketplace", icon: ShoppingCart },
    { name: "My Orders", href: "/orders", icon: Package },
    { name: "Verify Product", href: "/verify", icon: QrCode },
    { name: "Fintech", href: "/fintech", icon: CreditCard },
    { name: "Favorites", href: "/favorites", icon: ShoppingCart },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
  ],
  partner: [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "My Farmers", href: "/partners", icon: Users },
    { name: "Farmer Onboarding", href: "/partners/onboard", icon: UserPlus },
    { name: "Bulk Upload", href: "/partners/bulk", icon: Upload },
    { name: "Commissions", href: "/commissions", icon: CreditCard },
    { name: "Referrals", href: "/referrals", icon: Users },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Marketplace", href: "/marketplace", icon: ShoppingCart },
  ],
  aggregator: [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "My Farmers", href: "/partners", icon: Users },
    { name: "Farmer Onboarding", href: "/partners/onboard", icon: UserPlus },
    { name: "Bulk Upload", href: "/partners/bulk", icon: Upload },
    { name: "Commissions", href: "/commissions", icon: CreditCard },
    { name: "Logistics", href: "/shipments", icon: Truck },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Marketplace", href: "/marketplace", icon: ShoppingCart },
  ],
  agency: [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "My Farmers", href: "/partners", icon: Users },
    { name: "Farmer Onboarding", href: "/partners/onboard", icon: UserPlus },
    { name: "Bulk Upload", href: "/partners/bulk", icon: Upload },
    { name: "Commissions", href: "/commissions", icon: CreditCard },
    { name: "Logistics", href: "/shipments", icon: Truck },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Marketplace", href: "/marketplace", icon: ShoppingCart },
  ],
  admin: [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "User Management", href: "/admin/users", icon: Users },
    { name: "System Analytics", href: "/analytics", icon: BarChart3 },
    { name: "IoT & Sensors", href: "/iot", icon: Wifi },
    { name: "AI & ML", href: "/ai", icon: Brain },
    { name: "Quality Control", href: "/admin/quality", icon: Shield },
    { name: "System Settings", href: "/admin/settings", icon: Settings },
    { name: "Marketplace", href: "/marketplace", icon: ShoppingCart },
  ],
}

const quickActions = {
  farmer: [
    { name: "Record Harvest", href: "/harvests/new", icon: Package },
    { name: "Generate QR", href: "/qr-codes/generate", icon: QrCode },
    { name: "List Product", href: "/marketplace/list", icon: ShoppingCart },
    { name: "Check Weather", href: "/weather", icon: BarChart3 },
  ],
  buyer: [
    { name: "Browse Products", href: "/marketplace", icon: ShoppingCart },
    { name: "Verify Product", href: "/verify", icon: QrCode },
    { name: "View Orders", href: "/orders", icon: Package },
    { name: "Check Fintech", href: "/fintech", icon: CreditCard },
  ],
  partner: [
    { name: "Add Farmer", href: "/partners/onboard", icon: UserPlus },
    { name: "Bulk Upload", href: "/partners/bulk", icon: Upload },
    { name: "View Commissions", href: "/commissions", icon: CreditCard },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
  ],
  aggregator: [
    { name: "Add Farmer", href: "/partners/onboard", icon: UserPlus },
    { name: "Bulk Upload", href: "/partners/bulk", icon: Upload },
    { name: "Track Shipments", href: "/shipments", icon: Truck },
    { name: "View Commissions", href: "/commissions", icon: CreditCard },
  ],
  agency: [
    { name: "Add Farmer", href: "/partners/onboard", icon: UserPlus },
    { name: "Bulk Upload", href: "/partners/bulk", icon: Upload },
    { name: "Track Shipments", href: "/shipments", icon: Truck },
    { name: "View Commissions", href: "/commissions", icon: CreditCard },
  ],
  admin: [
    { name: "User Management", href: "/admin/users", icon: Users },
    { name: "System Health", href: "/admin/health", icon: Shield },
    { name: "IoT Dashboard", href: "/iot", icon: Wifi },
    { name: "AI Models", href: "/ai", icon: Brain },
  ],
}

const getQuickActions = (role?: string) => {
  return quickActions[role as keyof typeof quickActions] || quickActions.farmer
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const { logout } = useAuth()

  // Ensure proper body scrolling behavior
  useEffect(() => {
    // Don't restrict body scrolling - let the main content area handle it
    // This allows proper scrolling while keeping sidebar fixed
    
    return () => {
      // Cleanup not needed
    }
  }, [])

  const navigation = user?.role ? (navigationItems[user.role as keyof typeof navigationItems] || navigationItems.farmer) : navigationItems.farmer

  return (
    <div className="flex min-h-screen bg-background relative">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - Always fixed */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border shadow-lg transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ height: '100vh' }}
      >
        <div className="flex h-full flex-col overflow-hidden">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 border-b border-border flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-heading font-bold text-foreground">GroChain</span>
            </Link>
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Role Indicator */}
          <div className="px-4 sm:px-6 py-2 border-b border-border">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-xs font-medium text-muted-foreground capitalize">
                {user?.role || "user"} Dashboard
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 sm:space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname?.startsWith(item.href)
              const base = "flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors"
              const cls = isActive
                ? `${base} text-foreground bg-muted`
                : `${base} text-muted-foreground hover:text-foreground hover:bg-muted`
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cls}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Role-specific Quick Actions */}
          <div className="px-3 sm:px-4 py-4 border-t border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Quick Actions
            </h3>
            <div className="space-y-1">
              {getQuickActions(user?.role).map((action) => (
                <Link
                  key={action.name}
                  href={action.href}
                  className="flex items-center space-x-3 px-3 py-2 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <action.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{action.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="px-3 sm:px-4 py-4 border-t border-border flex-shrink-0">
            <Link
              href="/settings"
              className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen lg:ml-64">
        {/* Top navigation */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border flex-shrink-0">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <OfflineStatus />

              <NotificationBell />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="hidden sm:flex"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" alt={user?.name || "User"} />
                      <AvatarFallback className="text-xs">
                        {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none truncate">{user?.name || "Unknown User"}</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">{user?.email || ""}</p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">{user?.role || "user"}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="sm:hidden" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                    {theme === "dark" ? (
                      <>
                        <Sun className="mr-2 h-4 w-4" />
                        <span>Light mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="mr-2 h-4 w-4" />
                        <span>Dark mode</span>
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}