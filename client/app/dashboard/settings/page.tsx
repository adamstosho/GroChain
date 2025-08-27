"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "@/lib/api"
import { Input } from "@/components/ui/input"

export default function SettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [prefs, setPrefs] = useState({ email: true, sms: true, push: false, marketing: true })
  const [security, setSecurity] = useState({ twoFactorEnabled: false, loginNotifications: true })
  const [display, setDisplay] = useState({ compactMode: false, showTutorials: true })
  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "", confirm: "" })

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const prefRes: any = await apiService.getPreferences()
        const p = (prefRes as any)?.data?.notifications || (prefRes as any)?.data || (prefRes as any)
        setPrefs({
          email: p?.email ?? true,
          sms: p?.sms ?? true,
          push: p?.push ?? false,
          marketing: p?.marketing ?? true,
        })
        const settingsRes: any = await apiService.getSettings()
        const s = (settingsRes as any)?.data || (settingsRes as any)
        setSecurity(s?.security || { twoFactorEnabled: false, loginNotifications: true })
        setDisplay(s?.display || { compactMode: false, showTutorials: true })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const onSave = async () => {
    try {
      setSaving(true)
      await apiService.updatePreferences(prefs)
      await apiService.updateSettings({ security, display })
      toast({ title: "Settings saved", description: "Your preferences have been updated." })
    } catch (err: any) {
      toast({ title: "Failed to save", description: err?.message || "Try again.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Label>Email</Label>
                <Switch checked={prefs.email} onCheckedChange={(v) => setPrefs({ ...prefs, email: Boolean(v) })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>SMS</Label>
                <Switch checked={prefs.sms} onCheckedChange={(v) => setPrefs({ ...prefs, sms: Boolean(v) })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Push</Label>
                <Switch checked={prefs.push} onCheckedChange={(v) => setPrefs({ ...prefs, push: Boolean(v) })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Marketing</Label>
                <Switch checked={prefs.marketing} onCheckedChange={(v) => setPrefs({ ...prefs, marketing: Boolean(v) })} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Label>Two-factor authentication</Label>
                <Switch checked={security.twoFactorEnabled} onCheckedChange={(v) => setSecurity({ ...security, twoFactorEnabled: Boolean(v) })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Login notifications</Label>
                <Switch checked={security.loginNotifications} onCheckedChange={(v) => setSecurity({ ...security, loginNotifications: Boolean(v) })} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div>
                  <Label htmlFor="cur">Current password</Label>
                  <Input id="cur" type="password" value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="new">New password</Label>
                  <Input id="new" type="password" value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="cf">Confirm new password</Label>
                  <Input id="cf" type="password" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} />
                </div>
                <div className="md:col-span-3">
                  <Button
                    variant="outline"
                    className="bg-transparent"
                    disabled={!pwd.currentPassword || !pwd.newPassword || pwd.newPassword !== pwd.confirm}
                    onClick={async () => {
                      try {
                        await apiService.changePassword(pwd.currentPassword, pwd.newPassword)
                        setPwd({ currentPassword: "", newPassword: "", confirm: "" })
                        toast({ title: "Password changed", description: "Your password has been updated." })
                      } catch (err: any) {
                        toast({ title: "Failed to change password", description: err?.message || "Try again.", variant: "destructive" })
                      }
                    }}
                  >
                    Change Password
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Display</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Label>Compact mode</Label>
                <Switch checked={display.compactMode} onCheckedChange={(v) => setDisplay({ ...display, compactMode: Boolean(v) })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show tutorials</Label>
                <Switch checked={display.showTutorials} onCheckedChange={(v) => setDisplay({ ...display, showTutorials: Boolean(v) })} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="pt-2">
        <Button onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save All"}
        </Button>
      </div>
    </div>
  )
}


