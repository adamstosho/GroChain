"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QrCode, RefreshCcw } from "lucide-react"
import { apiService } from "@/lib/api"

export default function DashboardQRCodesPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setLoading(true)
      const res: any = await apiService.request("/api/qr-codes")
      setItems(res?.data || res?.qrCodes || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My QR Codes</h1>
        <Button variant="outline" className="bg-transparent" onClick={load}>
          <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No QR Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">You don’t have any QR codes yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((q: any, i: number) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><QrCode className="h-4 w-4" /> {q?.batchId || q?._id}</CardTitle>
              </CardHeader>
              <CardContent>
                <img src={q?.qrData || q?.image || "/placeholder.svg"} alt="QR" className="w-full h-48 object-contain" />
                <p className="text-xs text-gray-500 mt-2">Created: {q?.createdAt ? new Date(q.createdAt).toLocaleString() : ""}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}



