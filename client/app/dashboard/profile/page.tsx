"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "@/lib/api"

export default function ProfilePage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: "", phone: "" })

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res: any = await apiService.getProfile()
        const data = (res as any)?.data || res
        setForm({ name: data?.name || "", phone: data?.phone || "" })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const onSave = async () => {
    try {
      setSaving(true)
      await apiService.updateProfile({ name: form.name, phone: form.phone })
      toast({ title: "Profile updated", description: "Your profile has been saved." })
    } catch (err: any) {
      toast({ title: "Failed to update", description: err?.message || "Try again.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div className="pt-2">
                <Button onClick={onSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}



