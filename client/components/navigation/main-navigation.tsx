"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
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
  Menu,
  X,
  ChevronDown,
  ExternalLink,
  Bell,
  User,
  LogOut,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react'

interface NavigationItem {
  title: string
  href: string
  description?: string
  icon: React.ReactNode
  badge?: string
  children?: NavigationItem[]
  roles?: string[]
}

interface MainNavigationProps {
  className?: string
}

export function MainNavigation({ className }: MainNavigationProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Check system theme preference
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDarkMode(isDark)
  }, [])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    // You can implement theme switching logic here
  }

  const navigationItems: NavigationItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      description: 'Main dashboard and overview',
      icon: <Home className="h-4 w-4" />,
      roles: ['admin', 'manager', 'partner', 'farmer', 'buyer', 'aggregator']
    },
    {
      title: 'Harvests',
      href: '/harvests',
      description: 'Manage harvest records and tracking',
      icon: <Package className="h-4 w-4" />,
      roles: ['admin', 'manager', 'partner', 'farmer']
    },
    {
      title: 'Marketplace',
      href: '/marketplace',
      description: 'Buy and sell agricultural products',
      icon: <BarChart3 className="h-4 w-4" />,
      roles: ['admin', 'manager', 'partner', 'farmer', 'buyer']
    },
    {
      title: 'Orders',
      href: '/orders',
      description: 'Manage orders and fulfillment',
      icon: <Package className="h-4 w-4" />,
      roles: ['admin', 'manager', 'partner', 'farmer', 'buyer']
    },
    {
      title: 'Inventory',
      href: '/inventory',
      description: 'Track inventory and stock levels',
      icon: <Package className="h-4 w-4" />,
      roles: ['admin', 'manager', 'partner']
    },
    {
      title: 'Quality Control',
      href: '/quality',
      description: 'Quality standards and inspections',
      icon: <Shield className="h-4 w-4" />,
      roles: ['admin', 'manager', 'partner', 'inspector']
    },
    {
      title: 'Analytics',
      href: '/analytics',
      description: 'Data insights and reporting',
      icon: <BarChart3 className="h-4 w-4" />,
      roles: ['admin', 'manager', 'partner']
    },
    {
      title: 'AI & ML',
      href: '/ai',
      description: 'Artificial intelligence and machine learning',
      icon: <Brain className="h-4 w-4" />,
      roles: ['admin', 'manager', 'partner', 'farmer']
    },
    {
      title: 'IoT & Sensors',
      href: '/iot',
      description: 'Internet of Things and sensor data',
      icon: <Wifi className="h-4 w-4" />,
      roles: ['admin', 'manager', 'partner', 'farmer']
    },
    {
      title: 'Shipments',
      href: '/shipments',
      description: 'Logistics and delivery management',
      icon: <Truck className="h-4 w-4" />,
      roles: ['admin', 'manager', 'partner', 'farmer']
    },
    {
      title: 'Fintech',
      href: '/fintech',
      description: 'Financial services and tools',
      icon: <CreditCard className="h-4 w-4" />,
      roles: ['admin', 'manager', 'partner', 'farmer', 'buyer']
    },
    {
      title: 'Verification',
      href: '/verification',
      description: 'BVN verification and compliance',
      icon: <Shield className="h-4 w-4" />,
      roles: ['admin', 'manager', 'partner']
    },
    {
      title: 'PWA',
      href: '/pwa',
      description: 'Progressive Web App features',
      icon: <Smartphone className="h-4 w-4" />,
      roles: ['admin', 'manager', 'partner', 'farmer', 'buyer', 'aggregator']
    },
    {
      title: 'Language',
      href: '/language',
      description: 'Multi-language support and translation',
      icon: <Globe className="h-4 w-4" />,
      roles: ['admin', 'manager', 'partner', 'farmer', 'buyer', 'aggregator']
    },
    {
      title: 'QR Codes',
      href: '/qr-codes',
      description: 'QR code generation and scanning',
      icon: <QrCode className="h-4 w-4" />,
      roles: ['admin', 'manager', 'partner', 'farmer']
    },
    {
      title: 'Weather',
      href: '/weather',
      description: 'Weather forecasts and alerts',
      icon: <Cloud className="h-4 w-4" />,
      roles: ['admin', 'manager', 'partner', 'farmer']
    },
    {
      title: 'USSD',
      href: '/ussd',
      description: 'USSD services and menu',
      icon: <Phone className="h-4 w-4" />,
      roles: ['admin', 'manager', 'partner', 'farmer']
    },
    {
      title: 'Partners',
      href: '/partners',
      description: 'Partner management and onboarding',
      icon: <Handshake className="h-4 w-4" />,
      roles: ['admin', 'manager', 'partner']
    },
    {
      title: 'Referrals',
      href: '/referrals',
      description: 'Referral system and tracking',
      icon: <Handshake className="h-4 w-4" />,
      roles: ['admin', 'manager', 'partner']
    },
    {
      title: 'Commissions',
      href: '/commissions',
      description: 'Commission tracking and payments',
      icon: <CreditCard className="h-4 w-4" />,
      roles: ['admin', 'manager', 'partner']
    },
    {
      title: 'Users',
      href: '/users',
      description: 'User management and administration',
      icon: <Users className="h-4 w-4" />,
      roles: ['admin', 'manager']
    },
    {
      title: 'Reports',
      href: '/reports',
      description: 'Comprehensive reporting system',
      icon: <BarChart3 className="h-4 w-4" />,
      roles: ['admin', 'manager', 'partner']
    },
    {
      title: 'Settings',
      href: '/settings',
      description: 'System settings and preferences',
      icon: <Settings className="h-4 w-4" />,
      roles: ['admin', 'manager', 'partner', 'farmer', 'buyer', 'aggregator']
    }
  ]

  const filteredNavigationItems = navigationItems.filter(item => 
    !item.roles || item.roles.includes(user?.role || '')
  )

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const renderNavigationItem = (item: NavigationItem) => (
    <Link
      key={item.href}
      href={item.href}
      className={cn(
        'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
        isActive(item.href) && 'bg-accent text-accent-foreground'
      )}
      onClick={() => setIsMobileMenuOpen(false)}
    >
      {item.icon}
      <span>{item.title}</span>
      {item.badge && (
        <Badge variant="secondary" className="ml-auto">
          {item.badge}
        </Badge>
      )}
    </Link>
  )

  const renderDesktopNavigation = () => (
    <NavigationMenu className="hidden lg:flex">
      <NavigationMenuList>
        {filteredNavigationItems.map((item) => (
          <NavigationMenuItem key={item.href}>
            {item.children ? (
              <>
                <NavigationMenuTrigger className="flex items-center space-x-2">
                  {item.icon}
                  <span>{item.title}</span>
                  <ChevronDown className="h-4 w-4" />
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {item.children.map((child) => (
                      <NavigationMenuLink key={child.href} asChild>
                        <Link
                          href={child.href}
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="flex items-center space-x-2">
                            {child.icon}
                            <span className="text-sm font-medium leading-none">{child.title}</span>
                          </div>
                          {child.description && (
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {child.description}
                            </p>
                          )}
                        </Link>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </>
            ) : (
              <NavigationMenuLink asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                    isActive(item.href) && 'bg-accent text-accent-foreground'
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )

  const renderMobileNavigation = () => (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-2">
          {filteredNavigationItems.map(renderNavigationItem)}
        </div>
      </SheetContent>
    </Sheet>
  )

  if (!user) {
    return null
  }

  return (
    <nav className={cn('border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60', className)}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">GC</span>
              </div>
              <span className="hidden sm:inline-block font-bold text-xl">GroChain</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-center">
            {renderDesktopNavigation()}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="hidden sm:flex"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Notifications */}
            <Link href="/notifications">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs">
                  3
                </Badge>
              </Button>
            </Link>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline-block">{user.name || user.email}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            {renderMobileNavigation()}
          </div>
        </div>
      </div>
    </nav>
  )
}
