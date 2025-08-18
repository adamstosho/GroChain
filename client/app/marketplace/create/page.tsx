"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Loader2, Package } from "lucide-react"

export default function CreateListingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({
    product: "",
    price: 0,
    quantity: 1,
  })
  const [images, setImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages(files)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSubmitting(true)
    try {
      // Upload images first
      let uploaded: string[] = []
      if (images.length > 0) {
        const fd = new FormData()
        images.forEach((f) => fd.append('images', f))
        const resp = await api.uploadMarketplaceImage(fd)
        if (resp.success && resp.data) {
          const payload: any = resp.data
          uploaded = payload.urls || []
        }
      }

      // Create listing
      const resp2 = await api.createMarketplaceListing({
        product: form.product,
        price: Number(form.price),
        quantity: Number(form.quantity),
        farmer: user.id,
        partner: user.id, // or partner id if applicable
        images: uploaded,
      })

      if (resp2.success && resp2.data) {
        router.push('/marketplace')
      } else {
        throw new Error(resp2.error || 'Failed to create listing')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Package className="w-5 h-5 mr-2" /> Create Marketplace Listing</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Product</Label>
              <Input value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Price (₦)</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Images</Label>
              <input type="file" multiple accept="image/*" onChange={onFileChange} className="hidden" id="img-upload" />
              <label htmlFor="img-upload" className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border rounded">
                <Upload className="w-4 h-4" /> Select Images
              </label>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>) : 'Create Listing'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


