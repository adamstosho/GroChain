"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LanguageSelector } from "@/components/language/language-selector"
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
  Wifi,
  Globe,
  Shield,
  Bell,
  Brain,
  Phone,
  Database
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
          { name: "My Products", href: "/harvests", icon: Package },
          { name: "QR Codes", href: "/qr-codes", icon: QrCode },
          { name: "Marketplace", href: "/marketplace", icon: ShoppingCart },
          { name: "Fintech", href: "/fintech", icon: CreditCard },
          { name: "Analytics", href: "/analytics", icon: BarChart3 },
          {
            name: "IoT",
            href: "/iot",
            icon: Wifi,
            subItems: [
              { name: "Overview", href: "/iot" },
              { name: "Live Monitoring", href: "/iot/monitoring" },
              { name: "Alerts", href: "/iot/alerts" },
              { name: "Sensors", href: "/iot/sensors" },
            ],
          },
          {
            name: "AI & ML",
            href: "/ai",
            icon: Brain,
            subItems: [
              { name: "AI Insights", href: "/ai" },
              { name: "Advanced ML", href: "/advanced-ml" },
              { name: "Image Recognition", href: "/image-recognition" },
            ],
          },
        ],
  buyer: [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Marketplace", href: "/marketplace", icon: ShoppingCart },
    { name: "My Orders", href: "/orders", icon: Package },
    { name: "Verify Product", href: "/verify", icon: QrCode },
    { name: "Fintech", href: "/fintech", icon: CreditCard },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    {
      name: "IoT",
      href: "/iot",
      icon: Wifi,
      subItems: [
        { name: "Overview", href: "/iot" },
        { name: "Live Monitoring", href: "/iot/monitoring" },
        { name: "Alerts", href: "/iot/alerts" },
        { name: "Sensors", href: "/iot/sensors" },
      ],
    },
    {
      name: "AI & ML",
      href: "/ai",
      icon: Brain,
      subItems: [
        { name: "AI Insights", href: "/ai" },
        { name: "Advanced ML", href: "/advanced-ml" },
        { name: "Image Recognition", href: "/image-recognition" },
      ],
    },
  ],
  agency: [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "My Farmers", href: "/partners", icon: Users },
    { name: "Commissions", href: "/commissions", icon: Package },
    { name: "Fintech", href: "/fintech", icon: CreditCard },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Marketplace", href: "/marketplace", icon: ShoppingCart },
    {
      name: "IoT",
      href: "/iot",
      icon: Wifi,
      subItems: [
        { name: "Overview", href: "/iot" },
        { name: "Live Monitoring", href: "/iot/monitoring" },
        { name: "Alerts", href: "/iot/alerts" },
        { name: "Sensors", href: "/iot/sensors" },
      ],
    },
    {
      name: "AI & ML",
      href: "/ai",
      icon: Brain,
      subItems: [
        { name: "AI Insights", href: "/ai" },
        { name: "Advanced ML", href: "/advanced-ml" },
        { name: "Image Recognition", href: "/image-recognition" },
      ],
    },
  ],
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

          {/* Settings */}
          <div className="px-3 sm:px-4 py-4 border-t border-border flex-shrink-0 space-y-2">
            <Link
              href="/language"
              className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <Globe className="w-5 h-5 flex-shrink-0" />
              <span>Language</span>
            </Link>
                      <Link
            href="/verification"
            className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <Shield className="w-5 h-5 flex-shrink-0" />
            <span>BVN Verification</span>
          </Link>
          <Link
            href="/notifications"
            className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <Bell className="w-5 h-5 flex-shrink-0" />
            <span>Notifications</span>
          </Link>
          <Link
            href="/users"
            className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <Users className="w-5 h-5 flex-shrink-0" />
            <span>User Management</span>
          </Link>
          <Link
            href="/reports"
            className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <BarChart3 className="w-5 h-5 flex-shrink-0" />
            <span>Reports & Analytics</span>
          </Link>
          <Link
            href="/inventory"
            className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <Package className="w-5 h-5 flex-shrink-0" />
            <span>Inventory Management</span>
          </Link>
          <Link
            href="/quality"
            className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <Shield className="w-5 h-5 flex-shrink-0" />
            <span>Quality Control</span>
          </Link>
                                <Link
                        href="/ussd"
                        className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Phone className="w-5 h-5 flex-shrink-0" />
                        <span>USSD Services</span>
                      </Link>
                      <Link
                        href="/websocket"
                        className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Wifi className="w-5 h-5 flex-shrink-0" />
                        <span>Real-time Services</span>
                      </Link>
                      <Link
                        href="/sync"
                        className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Database className="w-5 h-5 flex-shrink-0" />
                        <span>Sync & Offline</span>
                      </Link>
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

              <LanguageSelector variant="compact" showLabel={false} className="hidden sm:flex" />

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