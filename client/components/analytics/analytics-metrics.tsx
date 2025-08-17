"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  Package, 
  DollarSign, 
  Leaf, 
  Shield, 
  Globe,
  BarChart3,
  ShoppingCart,
  CreditCard,
  Target
} from "lucide-react"

interface AnalyticsMetricsProps {
  data: any
}

export function AnalyticsMetrics({ data }: AnalyticsMetricsProps) {
  const metrics = [
    {
      title: "Total Farmers",
      value: data.overview.totalFarmers.toLocaleString(),
      change: data.overview.growthRate,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Total Transactions",
      value: data.overview.totalTransactions.toLocaleString(),
      change: 15.2,
      icon: BarChart3,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Total Revenue",
      value: `₦${(data.overview.totalRevenue / 1000000).toFixed(1)}M`,
      change: 28.7,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      title: "Active Partners",
      value: data.overview.activePartners,
      change: 12.3,
      icon: Shield,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Total Harvests",
      value: data.harvests.total.toLocaleString(),
      change: 18.9,
      icon: Package,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Marketplace Listings",
      value: data.marketplace.listings.toLocaleString(),
      change: 22.4,
      icon: ShoppingCart,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      title: "Credit Scores",
      value: data.fintech.creditScores.average,
      change: 5.6,
      icon: CreditCard,
      color: "text-rose-600",
      bgColor: "bg-rose-50"
    },
    {
      title: "Impact Score",
      value: `${data.impact.incomeIncrease.toFixed(1)}%`,
      change: 34.2,
      icon: Target,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-lg ${metric.bgColor} flex items-center justify-center`}>
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <Badge 
                  variant={metric.change >= 0 ? "default" : "secondary"}
                  className={metric.change >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                >
                  {metric.change >= 0 ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {Math.abs(metric.change)}%
                </Badge>
              </div>
              
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                <p className="text-sm text-muted-foreground">{metric.title}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
