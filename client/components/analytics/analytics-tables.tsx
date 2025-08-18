"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  MapPin,
  Calendar,
  DollarSign,
  Award
} from "lucide-react"

interface AnalyticsTablesProps {
  data: any
  type: "farmers" | "harvests" | "marketplace" | "impact" | "transactions" | "fintech" | "partners" | "weather"
}

export function AnalyticsTables({ data, type }: AnalyticsTablesProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const renderFarmersTable = () => (
    <div className="space-y-6">
      {/* Demographics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Demographics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gender Distribution */}
            <div>
              <h4 className="font-medium mb-3">Gender Distribution</h4>
              <div className="space-y-2">
                {Object.entries(data.farmers.byGender).map(([gender, count]: [string, any]) => (
                  <div key={gender} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground capitalize">{gender}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{count}</span>
                      <Badge variant="outline">
                        {((count / data.farmers.total) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Age Groups */}
            <div>
              <h4 className="font-medium mb-3">Age Groups</h4>
              <div className="space-y-2">
                {Object.entries(data.farmers.byAgeGroup).map(([ageGroup, count]: [string, any]) => (
                  <div key={ageGroup} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{ageGroup}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{count}</span>
                      <Badge variant="outline">
                        {((count / data.farmers.total) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            Regional Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(data.farmers.byRegion)
              .sort(([,a]: [string, any], [,b]: [string, any]) => b - a)
              .map(([region, count]: [string, any]) => (
                <div key={region} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{region}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{count}</span>
                    <Badge variant="secondary">
                      {((count / data.farmers.total) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderHarvestsTable = () => (
    <div className="space-y-6">
      {/* Crop Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-600" />
            Crop Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(data.harvests.byCrop)
              .sort(([,a]: [string, any], [,b]: [string, any]) => b - a)
              .map(([crop, volume]: [string, any]) => (
                <div key={crop} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{crop}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{formatNumber(volume)} kg</span>
                    <Badge variant="secondary">
                      {((volume / data.harvests.totalVolume) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Quality Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Quality Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(data.harvests.byQuality).map(([quality, volume]: [string, any]) => (
              <div key={quality} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Award className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium capitalize">{quality}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatNumber(volume)} kg</span>
                  <Badge variant="secondary">
                    {((volume / data.harvests.totalVolume) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{data.harvests.total}</p>
              <p className="text-sm text-muted-foreground">Total Harvests</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{formatNumber(data.harvests.totalVolume)}</p>
              <p className="text-sm text-muted-foreground">Total Volume (kg)</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{data.harvests.averageYield}</p>
              <p className="text-sm text-muted-foreground">Average Yield (kg)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderMarketplaceTable = () => (
    <div className="space-y-6">
      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-600" />
            Top Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.marketplace.topProducts.map((product: any, index: number) => (
              <div key={product.productId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">{formatCurrency(product.revenue)}</p>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Marketplace Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Marketplace Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{data.marketplace.listings}</p>
              <p className="text-sm text-muted-foreground">Active Listings</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{data.marketplace.orders}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(data.marketplace.revenue)}</p>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(data.marketplace.commission)}</p>
              <p className="text-sm text-muted-foreground">Commission</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderImpactTable = () => (
    <div className="space-y-6">
      {/* Impact Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Impact Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{data.impact.incomeIncrease}%</p>
              <p className="text-sm text-muted-foreground">Income Increase</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{data.impact.productivityImprovement}%</p>
              <p className="text-sm text-muted-foreground">Productivity Improvement</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{data.impact.foodSecurity}%</p>
              <p className="text-sm text-muted-foreground">Food Security</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{data.impact.employmentCreated}</p>
              <p className="text-sm text-muted-foreground">Jobs Created</p>
            </div>
            <div className="text-center p-4 bg-cyan-50 rounded-lg">
              <p className="text-2xl font-bold text-cyan-600">{data.impact.carbonFootprintReduction}%</p>
              <p className="text-sm text-muted-foreground">Carbon Reduction</p>
            </div>
            <div className="text-center p-4 bg-rose-50 rounded-lg">
              <p className="text-2xl font-bold text-rose-600">{data.impact.waterConservation}%</p>
              <p className="text-sm text-muted-foreground">Water Conservation</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partner Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Top Performing Partners
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.partners.topPerformers.map((partner: any, index: number) => (
              <div key={partner.partnerId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{partner.name}</p>
                    <p className="text-sm text-muted-foreground">{partner.referrals} referrals</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">{formatCurrency(partner.revenue)}</p>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {partner.score.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderTransactionsTable = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Transactions Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{data.transactions.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(data.transactions.volume)}</p>
              <p className="text-sm text-muted-foreground">Volume</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(data.transactions.averageValue)}</p>
              <p className="text-sm text-muted-foreground">Avg Value</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            By Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(data.transactions.byStatus).map(([status, count]: [string, any]) => (
              <div key={status} className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm text-muted-foreground capitalize">{status}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderFintechTable = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Credit Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(data.fintech.creditScores.distribution).map(([band, count]: [string, any]) => (
              <div key={band} className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm text-muted-foreground">{band}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Loans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg"><p className="text-2xl font-bold text-blue-600">{data.fintech.loans.total}</p><p className="text-sm text-muted-foreground">Total</p></div>
            <div className="text-center p-4 bg-green-50 rounded-lg"><p className="text-2xl font-bold text-green-600">{formatCurrency(data.fintech.loans.amount)}</p><p className="text-sm text-muted-foreground">Amount</p></div>
            <div className="text-center p-4 bg-purple-50 rounded-lg"><p className="text-2xl font-bold text-purple-600">{formatCurrency(data.fintech.loans.averageAmount)}</p><p className="text-sm text-muted-foreground">Average</p></div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg"><p className="text-2xl font-bold text-emerald-600">{data.fintech.loans.repaymentRate}%</p><p className="text-sm text-muted-foreground">Repayment</p></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderPartnersTable = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Partners Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg"><p className="text-2xl font-bold text-blue-600">{data.partners.total}</p><p className="text-sm text-muted-foreground">Total</p></div>
            <div className="text-center p-4 bg-green-50 rounded-lg"><p className="text-2xl font-bold text-green-600">{data.partners.active}</p><p className="text-sm text-muted-foreground">Active</p></div>
            <div className="text-center p-4 bg-orange-50 rounded-lg"><p className="text-2xl font-bold text-orange-600">{data.partners.farmerReferrals}</p><p className="text-sm text-muted-foreground">Referrals</p></div>
            <div className="text-center p-4 bg-purple-50 rounded-lg"><p className="text-2xl font-bold text-purple-600">{formatCurrency(data.partners.revenueGenerated)}</p><p className="text-sm text-muted-foreground">Revenue</p></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderWeatherTable = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            Weather Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg"><p className="text-2xl font-bold text-blue-600">{data.weather.averageTemperature}°C</p><p className="text-sm text-muted-foreground">Avg Temp</p></div>
            <div className="text-center p-4 bg-cyan-50 rounded-lg"><p className="text-2xl font-bold text-cyan-600">{data.weather.averageHumidity}%</p><p className="text-sm text-muted-foreground">Avg Humidity</p></div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg"><p className="text-2xl font-bold text-emerald-600">{data.weather.favorableDays}</p><p className="text-sm text-muted-foreground">Favorable Days</p></div>
            <div className="text-center p-4 bg-rose-50 rounded-lg"><p className="text-2xl font-bold text-rose-600">{data.weather.unfavorable}</p><p className="text-sm text-muted-foreground">Unfavorable</p></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderTable = () => {
    switch (type) {
      case "farmers":
        return renderFarmersTable()
      case "harvests":
        return renderHarvestsTable()
      case "marketplace":
        return renderMarketplaceTable()
      case "impact":
        return renderImpactTable()
      case "transactions":
        return renderTransactionsTable()
      case "fintech":
        return renderFintechTable()
      case "partners":
        return renderPartnersTable()
      case "weather":
        return renderWeatherTable()
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {renderTable()}
    </motion.div>
  )
}
