"use client"

import type React from "react"

import { useState } from "react"
import { useAuthStore } from "@/lib/auth"
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
  Menu,
  Home,
  Leaf,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  User,
  CreditCard,
  QrCode,
  Package,
  TrendingUp,
  Shield,
  Database,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const getNavigationItems = () => {
    const baseItems = [
      { name: "Dashboard", href: "/dashboard", icon: Home },
      { name: "Profile", href: "/dashboard/profile", icon: User },
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ]

    switch (user?.role) {
      case "farmer":
        return [
          ...baseItems.slice(0, 1),
          { name: "Harvests", href: "/dashboard/harvests", icon: Leaf },
          { name: "Marketplace", href: "/dashboard/marketplace", icon: ShoppingCart },
          { name: "QR Codes", href: "/dashboard/qr-codes", icon: QrCode },
          { name: "Financial", href: "/dashboard/financial", icon: CreditCard },
          { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
          ...baseItems.slice(1),
        ]
      case "buyer":
        return [
          ...baseItems.slice(0, 1),
          { name: "Browse Products", href: "/dashboard/products", icon: Package },
          { name: "My Orders", href: "/dashboard/orders", icon: ShoppingCart },
          { name: "Favorites", href: "/dashboard/favorites", icon: Leaf },
          { name: "QR Scanner", href: "/dashboard/scanner", icon: QrCode },
          ...baseItems.slice(1),
        ]
      case "partner":
        return [
          ...baseItems.slice(0, 1),
          { name: "Farmers", href: "/dashboard/farmers", icon: Users },
          { name: "Approvals", href: "/dashboard/approvals", icon: Shield },
          { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
          { name: "Onboarding", href: "/dashboard/onboarding", icon: TrendingUp },
          ...baseItems.slice(1),
        ]
      case "admin":
        return [
          ...baseItems.slice(0, 1),
          { name: "Users", href: "/dashboard/users", icon: Users },
          { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
          { name: "System", href: "/dashboard/system", icon: Database },
          { name: "Reports", href: "/dashboard/reports", icon: TrendingUp },
          ...baseItems.slice(1),
        ]
      default:
        return baseItems
    }
  }

  const navigationItems = getNavigationItems()

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-primary">GroChain</span>
        </Link>
      </div>

      {/* User Info */}
      <div className="border-b p-6">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
            <AvatarFallback>
              {user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs capitalize">
                {user?.role}
              </Badge>
              {user?.emailVerified && <div className="h-2 w-2 rounded-full bg-success" />}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigationItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-muted-foreground">
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-background px-6">
          <div className="flex items-center space-x-4">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            </Sheet>

            <div>
              <h1 className="text-lg font-semibold">
                {user?.role === "farmer" && "Farmer Dashboard"}
                {user?.role === "buyer" && "Buyer Dashboard"}
                {user?.role === "partner" && "Partner Dashboard"}
                {user?.role === "admin" && "Admin Dashboard"}
              </h1>
              <p className="text-sm text-muted-foreground">Welcome back, {user?.name?.split(" ")[0]}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive text-xs" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                    <AvatarFallback>
                      {user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
