"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  MapPin, 
  Leaf, 
  Scale, 
  Calendar,
  Truck,
  Shield,
  Eye,
  MessageCircle,
  Share2,
  QrCode
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface MarketplaceProduct {
  id: string
  name: string
  cropType: string
  variety: string
  description: string
  price: number
  originalPrice?: number
  unit: string
  quantity: number
  availableQuantity: number
  quality: "excellent" | "good" | "fair" | "poor"
  grade: "A" | "B" | "C"
  organic: boolean
  harvestDate: Date
  location: string
  farmer: {
    id: string
    name: string
    avatar?: string
    rating: number
    verified: boolean
    location: string
  }
  images: string[]
  certifications: string[]
  shipping: {
    available: boolean
    cost: number
    estimatedDays: number
  }
  rating: number
  reviewCount: number
  qrCode: string
  tags: string[]
}

interface MarketplaceCardProps {
  product: MarketplaceProduct
  onAddToCart?: (productId: string) => void
  onAddToWishlist?: (productId: string) => void
  onView?: (productId: string) => void
  onContact?: (farmerId: string) => void
  onShare?: (productId: string) => void
  variant?: "default" | "compact" | "detailed"
  className?: string
}

const qualityColors = {
  excellent: "bg-success text-success-foreground",
  good: "bg-primary text-primary-foreground",
  fair: "bg-warning text-warning-foreground",
  poor: "bg-destructive text-destructive-foreground"
}

const gradeColors = {
  A: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white",
  B: "bg-gradient-to-r from-blue-400 to-blue-600 text-white",
  C: "bg-gradient-to-r from-gray-400 to-gray-600 text-white"
}

export function MarketplaceCard({ 
  product, 
  onAddToCart, 
  onAddToWishlist, 
  onView,
  onContact,
  onShare,
  variant = "default",
  className 
}: MarketplaceCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showQR, setShowQR] = useState(false)

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    if (onAddToWishlist) {
      onAddToWishlist(product.id)
    }
  }

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product.id)
    }
  }

  const handleView = () => {
    if (onView) {
      onView(product.id)
    }
  }

  const handleContact = () => {
    if (onContact) {
      onContact(product.farmer.id)
    }
  }

  const handleShare = () => {
    if (onShare) {
      onShare(product.id)
    }
  }

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  if (variant === "compact") {
    return (
      <Card className={cn("hover:shadow-md transition-shadow cursor-pointer", className)}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              {product.organic && (
                <Badge className="absolute -top-1 -right-1 text-xs px-1 py-0">
                  Organic
                </Badge>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">{product.name}</h4>
              <p className="text-xs text-muted-foreground truncate">
                {product.farmer.name} • {product.location}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={cn("text-xs", qualityColors[product.quality])}>
                  Grade {product.grade}
                </Badge>
                <span className="text-sm font-medium">₦{product.price.toLocaleString()}</span>
              </div>
            </div>
            <Button size="sm" onClick={handleAddToCart}>
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("hover:shadow-lg transition-all duration-200 group", className)}>
      {/* Product Image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        
        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 space-y-2">
          {product.organic && (
            <Badge className="bg-green-600 text-white text-xs">
              <Leaf className="h-3 w-3 mr-1" />
              Organic
            </Badge>
          )}
          <Badge className={cn("text-xs", qualityColors[product.quality])}>
            Grade {product.grade}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleWishlist}
          >
            <Heart className={cn("h-4 w-4", isWishlisted && "fill-red-500 text-red-500")} />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setShowQR(!showQR)}
          >
            <QrCode className="h-4 w-4" />
          </Button>
        </div>

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{discount}%
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="space-y-2">
          <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
          <CardDescription className="line-clamp-2">
            {product.description}
          </CardDescription>
        </div>

        {/* Price Section */}
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">
            ₦{product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="text-lg text-muted-foreground line-through">
              ₦{product.originalPrice.toLocaleString()}
            </span>
          )}
          <span className="text-sm text-muted-foreground">per {product.unit}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < Math.floor(product.rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                )}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            ({product.rating.toFixed(1)} • {product.reviewCount} reviews)
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-muted-foreground" />
            <span>{product.availableQuantity} {product.unit} available</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Harvested {product.harvestDate.toLocaleDateString()}</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{product.location}</span>
        </div>

        {/* Farmer Information */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={product.farmer.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {product.farmer.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{product.farmer.name}</span>
                {product.farmer.verified && (
                  <Shield className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{product.farmer.rating.toFixed(1)}</span>
                <span>•</span>
                <span>{product.farmer.location}</span>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleContact}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Contact
          </Button>
        </div>

        {/* Certifications */}
        {product.certifications.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.certifications.map((cert) => (
              <Badge key={cert} variant="outline" className="text-xs">
                {cert}
              </Badge>
            ))}
          </div>
        )}

        {/* Shipping Info */}
        {product.shipping.available && (
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-600 dark:text-blue-400">
                Shipping available
              </span>
            </div>
            <span className="text-sm font-medium">
              ₦{product.shipping.cost.toLocaleString()} • {product.shipping.estimatedDays} days
            </span>
          </div>
        )}

        {/* QR Code Display */}
        {showQR && (
          <div className="p-4 border rounded-lg bg-muted/30">
            <div className="text-center">
              <div className="inline-block p-4 bg-white rounded-lg border">
                <div className="w-32 h-32 bg-muted rounded flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-muted-foreground" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Scan to verify product authenticity
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <Separator />

      <CardFooter className="flex items-center justify-between pt-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleView}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>

        <Button onClick={handleAddToCart} className="flex-1 max-w-[200px]">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}
