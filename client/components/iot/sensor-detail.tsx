"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { AlertTriangle, Droplets, RefreshCw, Settings, Thermometer, Wind } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts"

type SensorStatus = "online" | "offline" | "warning"

interface SensorDetailData {
	id: string
	name: string
	type: "temperature" | "humidity" | "soil_moisture" | "ph" | "light"
	location: string
	status: SensorStatus
	batteryLevel: number
	signalStrength?: number
}

interface SensorReading {
	value: number
	unit: string
	timestamp: string
	metric?: string
	quality?: string
}

interface SensorAlert {
	type: string
	message: string
	severity: "low" | "medium" | "high" | "critical"
	timestamp: string
	resolved?: boolean
}

export function SensorDetail({ sensorId }: { sensorId: string }) {
	const { user } = useAuth()
	const [loading, setLoading] = useState(false)
	const [sensor, setSensor] = useState<SensorDetailData | null>(null)
	const [readings, setReadings] = useState<SensorReading[]>([])
	const [alerts, setAlerts] = useState<SensorAlert[]>([])
	const [activeTab, setActiveTab] = useState("overview")
	const [filters, setFilters] = useState({ startDate: "", endDate: "", limit: 100 })
	const [update, setUpdate] = useState({ status: "active", battery: "", signal: "" })
  const [maintenance, setMaintenance] = useState<any | null>(null)
  const [anomalies, setAnomalies] = useState<any[]>([])
  const router = useRouter()
  const chartData = useMemo(() => {
    return readings.map(r => ({ time: new Date(r.timestamp).toLocaleTimeString(), value: r.value }))
  }, [readings])

	useEffect(() => {
		loadAll()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sensorId])

	const loadAll = async () => {
		try {
			setLoading(true)
			const [infoResp, readResp, alertResp] = await Promise.all([
				api.getSensor(sensorId),
				api.getSensorReadings(sensorId),
				api.getSensorAlerts(sensorId)
			])
			if (infoResp.success && infoResp.data) {
				const s: any = (infoResp.data as any).data || infoResp.data
				setSensor({
					id: s._id || s.id || sensorId,
					name: s.metadata?.model || s.sensorId || "Sensor",
					type: (s.sensorType === 'soil' ? 'soil_moisture' : s.sensorType) as any,
					location: `${s.location?.latitude ?? ''}, ${s.location?.longitude ?? ''}`,
					status: (s.status === 'active' ? 'online' : (s.status === 'inactive' ? 'offline' : 'warning')),
					batteryLevel: s.batteryLevel ?? 100,
					signalStrength: s.signalStrength ?? 100,
				})
				setUpdate({ status: s.status || 'active', battery: String(s.batteryLevel ?? ''), signal: String(s.signalStrength ?? '') })
			}
			if (readResp.success && readResp.data) {
				const arr: any[] = ((readResp.data as any).data || readResp.data) as any[]
				setReadings(arr)
			}
			if (alertResp.success && alertResp.data) {
				const arr: any[] = ((alertResp.data as any).data || alertResp.data) as any[]
				setAlerts(arr)
			}

      // Load maintenance and anomalies (Advanced ML)
      try {
        const [mResp, aResp] = await Promise.all([
          api.getSensorMaintenance(sensorId),
          api.getSensorAnomalies(sensorId)
        ])
        if (mResp.success && mResp.data) setMaintenance((mResp.data as any).data || mResp.data)
        if (aResp.success && aResp.data) setAnomalies(((aResp.data as any).data || aResp.data) as any[])
      } catch {}
		} finally {
			setLoading(false)
		}
	}

	const refreshReadings = async () => {
		const params: any = {}
		if (filters.startDate) params.startDate = filters.startDate
		if (filters.endDate) params.endDate = filters.endDate
		if (filters.limit) params.limit = filters.limit
		const query = new URLSearchParams(params).toString()
		const resp = await api.getSensorReadings(sensorId, filters)
		if (resp.success && resp.data) {
			const arr: any[] = ((resp.data as any).data || resp.data) as any[]
			setReadings(Array.isArray(arr) ? arr : [])
		}
	}

	const resolveAlert = async (index: number) => {
		await api.resolveSensorAlert(sensorId, index)
		setAlerts(prev => prev.map((a, i) => i === index ? { ...a, resolved: true } : a))
	}

	const updateStatus = async () => {
		await api.updateSensorStatus(sensorId, update.status)
		setSensor(prev => prev ? { ...prev, status: (update.status === 'active' ? 'online' : (update.status === 'inactive' ? 'offline' : 'warning')) as SensorStatus } : prev)
	}

  const deleteSensor = async () => {
    if (!confirm('Delete this sensor? This action cannot be undone.')) return
    await api.deleteSensor(sensorId)
    router.replace('/iot/sensors')
  }

	const getStatusBadge = (status: SensorStatus) => {
		switch (status) {
			case "online": return <Badge variant="default">Online</Badge>
			case "offline": return <Badge variant="destructive">Offline</Badge>
			case "warning": return <Badge variant="secondary">Warning</Badge>
			default: return <Badge variant="outline">{status}</Badge>
		}
	}

	const icon = useMemo(() => {
		if (!sensor) return <Settings className="w-6 h-6 text-muted-foreground" />
		switch (sensor.type) {
			case "temperature": return <Thermometer className="w-6 h-6 text-orange-500" />
			case "humidity": return <Droplets className="w-6 h-6 text-blue-500" />
			case "soil_moisture": return <Droplets className="w-6 h-6 text-emerald-600" />
			case "ph": return <Wind className="w-6 h-6 text-purple-500" />
			case "light": return <Settings className="w-6 h-6 text-yellow-500" />
			default: return <Settings className="w-6 h-6 text-muted-foreground" />
		}
	}, [sensor])

	return (
		<DashboardLayout user={user as any}>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-3">
						{icon}
						<div>
							<h1 className="text-2xl font-heading font-bold text-foreground">Sensor Detail</h1>
							<p className="text-muted-foreground">{sensor?.name} • {sensor?.location}</p>
						</div>
					</div>
					<div className="flex items-center space-x-2">
						<Link href="/iot/sensors"><Button variant="outline">Back</Button></Link>
						<Button variant="outline" onClick={loadAll}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
					</div>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<span>Overview</span>
							{sensor && getStatusBadge(sensor.status)}
						</CardTitle>
					</CardHeader>
					<CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div className="space-y-1">
							<p className="text-sm text-muted-foreground">Battery</p>
							<p className="text-xl font-bold">{sensor?.batteryLevel ?? '--'}%</p>
						</div>
						<div className="space-y-1">
							<p className="text-sm text-muted-foreground">Signal</p>
							<p className="text-xl font-bold">{sensor?.signalStrength ?? '--'}%</p>
						</div>
						<div className="space-y-1">
							<p className="text-sm text-muted-foreground">Type</p>
							<p className="text-xl font-bold">{sensor?.type}</p>
						</div>
						<div className="space-y-1">
							<p className="text-sm text-muted-foreground">Status</p>
							<div className="flex items-center space-x-2">
								<Select value={update.status} onValueChange={(v)=> setUpdate({ ...update, status: v })}>
									<SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
									<SelectContent>
										<SelectItem value="active">Active</SelectItem>
										<SelectItem value="inactive">Inactive</SelectItem>
										<SelectItem value="maintenance">Maintenance</SelectItem>
										<SelectItem value="error">Error</SelectItem>
									</SelectContent>
								</Select>
								<Button size="sm" onClick={updateStatus}>Update</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
					<TabsList className="grid w-full grid-cols-3 md:grid-cols-5">
						<TabsTrigger value="readings">Readings</TabsTrigger>
						<TabsTrigger value="alerts">Alerts</TabsTrigger>
						<TabsTrigger value="maintenance">Maintenance</TabsTrigger>
						<TabsTrigger value="anomalies">Anomalies</TabsTrigger>
						<TabsTrigger value="settings" className="hidden md:inline-flex">Settings</TabsTrigger>
					</TabsList>

					<TabsContent value="readings" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									<span>Sensor Readings</span>
									<div className="flex items-end gap-2">
										<div>
											<p className="text-xs text-muted-foreground">Start</p>
											<Input type="date" value={filters.startDate} onChange={(e)=> setFilters({ ...filters, startDate: e.target.value })} />
										</div>
										<div>
											<p className="text-xs text-muted-foreground">End</p>
											<Input type="date" value={filters.endDate} onChange={(e)=> setFilters({ ...filters, endDate: e.target.value })} />
										</div>
										<div>
											<p className="text-xs text-muted-foreground">Limit</p>
											<Input type="number" value={filters.limit} onChange={(e)=> setFilters({ ...filters, limit: Number(e.target.value || 0) })} />
										</div>
										<Button onClick={refreshReadings}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
									</div>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="overflow-x-auto border rounded-md">
									<table className="w-full text-sm">
										<thead>
											<tr className="text-left">
												<th className="px-3 py-2 border-b">Time</th>
												<th className="px-3 py-2 border-b">Metric</th>
												<th className="px-3 py-2 border-b">Value</th>
												<th className="px-3 py-2 border-b">Quality</th>
											</tr>
										</thead>
										<tbody>
											{readings.map((r, i) => (
												<tr key={i} className="odd:bg-muted/30">
													<td className="px-3 py-2 border-b">{new Date(r.timestamp).toLocaleString()}</td>
													<td className="px-3 py-2 border-b">{r.metric || sensor?.type}</td>
													<td className="px-3 py-2 border-b">{r.value} {r.unit}</td>
													<td className="px-3 py-2 border-b">{r.quality || 'good'}</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>

								{chartData.length > 0 && (
									<div className="mt-4">
										<ChartContainer config={{ value: { label: 'Value', color: 'hsl(var(--primary))' } }}>
											<LineChart data={chartData} margin={{ left: 12, right: 12 }}>
												<CartesianGrid vertical={false} strokeDasharray="3 3" />
												<XAxis dataKey="time" tickLine={false} axisLine={false} interval={Math.ceil(chartData.length/6)} />
												<YAxis tickLine={false} axisLine={false} width={40} />
												<ChartTooltip content={<ChartTooltipContent />} />
												<Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} dot={false} />
											</LineChart>
										</ChartContainer>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="alerts" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Sensor Alerts</CardTitle>
							</CardHeader>
							<CardContent>
								{alerts.length ? (
									<div className="space-y-3">
										{alerts.map((a, i) => (
											<div key={i} className="flex items-center justify-between p-3 border rounded-md">
												<div className="flex items-center space-x-3">
													{a.severity === 'critical' ? <AlertTriangle className="w-5 h-5 text-red-500" /> : <AlertTriangle className="w-5 h-5 text-orange-500" />}
													<div>
														<p className="font-medium">{a.message}</p>
														<p className="text-xs text-muted-foreground">{new Date(a.timestamp).toLocaleString()}</p>
													</div>
												</div>
												<div className="flex items-center space-x-2">
													<Badge>{a.severity.toUpperCase()}</Badge>
													<Button size="sm" variant="outline" onClick={() => resolveAlert(i)} disabled={a.resolved}>Resolve</Button>
												</div>
											</div>
										))}
									</div>
								) : (
									<p className="text-sm text-muted-foreground">No alerts.</p>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="maintenance" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Predictive Maintenance</CardTitle>
							</CardHeader>
							<CardContent>
								{maintenance ? (
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div>
											<p className="text-sm text-muted-foreground">Risk Score</p>
											<p className="text-xl font-bold">{maintenance.riskScore ?? maintenance.score ?? 'N/A'}</p>
										</div>
										<div>
											<p className="text-sm text-muted-foreground">Next Maintenance</p>
											<p className="text-xl font-bold">{maintenance.nextMaintenanceDate ? new Date(maintenance.nextMaintenanceDate).toLocaleDateString() : 'N/A'}</p>
										</div>
										<div>
											<p className="text-sm text-muted-foreground">Recommendation</p>
											<p className="text-sm">{maintenance.recommendation || maintenance.action || '—'}</p>
										</div>
										{Array.isArray(maintenance.recommendations) && maintenance.recommendations.length > 0 && (
											<div className="md:col-span-3">
												<p className="text-sm font-semibold mb-2">Recommendations</p>
												<ul className="list-disc list-inside text-sm text-muted-foreground">
													{maintenance.recommendations.map((r: string, i: number) => (<li key={i}>{r}</li>))}
												</ul>
											</div>
										)}
									</div>
								) : (
									<p className="text-sm text-muted-foreground">No maintenance data available.</p>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="anomalies" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Detected Anomalies</CardTitle>
							</CardHeader>
							<CardContent>
								{anomalies.length ? (
									<div className="space-y-2">
										{anomalies.map((a: any, i: number) => (
											<div key={i} className="flex items-center justify-between p-3 border rounded-md">
												<div>
													<p className="font-medium">{a.message || a.description || 'Anomaly detected'}</p>
													<p className="text-xs text-muted-foreground">{a.timestamp ? new Date(a.timestamp).toLocaleString() : ''}</p>
												</div>
												<Badge>{(a.severity || 'medium').toString().toUpperCase()}</Badge>
											</div>
										))}
									</div>
								) : (
									<p className="text-sm text-muted-foreground">No anomalies found.</p>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="settings" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Maintenance</CardTitle>
							</CardHeader>
							<CardContent className="text-sm text-muted-foreground">
								<div className="flex items-center gap-2">
									<Button variant="destructive" onClick={deleteSensor}>Delete Sensor</Button>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</DashboardLayout>
	)
}


