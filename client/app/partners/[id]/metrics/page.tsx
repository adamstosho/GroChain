"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Users, TrendingUp, DollarSign, BarChart3 } from "lucide-react"

export default function PartnerMetricsPage() {
  const params = useParams()
  const partnerId = params?.id as string
  const [metrics, setMetrics] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!partnerId) return
      setLoading(true)
      try {
        const resp = await api.getPartnerMetrics(partnerId)
        if (resp.success && resp.data) {
          const payload: any = resp.data
          setMetrics(payload.data || payload)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [partnerId])

  if (loading || !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  const cards = [
    { title: 'Total Farmers', value: metrics.totalFarmers || 0, icon: Users },
    { title: 'Active Farmers', value: metrics.activeFarmers || 0, icon: TrendingUp },
    { title: 'Total Commission', value: `₦${(metrics.totalCommission || 0).toLocaleString()}`, icon: DollarSign },
    { title: 'Performance Score', value: `${metrics.performanceScore || 0}%`, icon: BarChart3 },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Partner Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((c) => (
              <Card key={c.title}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">{c.title}</div>
                    <div className="text-xl font-semibold">{c.value}</div>
                  </div>
                  <c.icon className="w-6 h-6 text-primary" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


