"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Crop,
  RefreshCw,
  Bell,
  BellOff
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "@/lib/api"

interface WeatherAlert {
  _id: string
  location: {
    lat: number
    lng: number
    city: string
    state: string
    country: string
  }
  type: 'weather' | 'climate' | 'agricultural' | 'emergency'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  startTime: string
  endTime: string
  affectedCrops: string[]
  weatherConditions?: {
    temperature?: number
    humidity?: number
    windSpeed?: number
    precipitation?: number
    pressure?: number
  }
  recommendations?: string[]
  status: 'active' | 'expired' | 'cancelled'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  notificationsSent: number
  farmersNotified: Array<{
    _id: string
    name: string
    email: string
    phone: string
  }>
  createdAt: string
  updatedAt: string
}

interface WeatherAlertsProps {
  location?: {
    lat: number
    lng: number
    city: string
    state: string
  }
  cropType?: string
  showSubscription?: boolean
}

export function WeatherAlerts({ location, cropType, showSubscription = true }: WeatherAlertsProps) {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [subscribed, setSubscribed] = useState(false)
  const [subscribing, setSubscribing] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    fetchAlerts()
  }, [location, cropType])

  const fetchAlerts = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiService.getWeatherAlerts(
        location?.lat,
        location?.lng,
        undefined,
        undefined,
        cropType
      )

      if (response.status === 'success') {
        setAlerts(response.data.alerts || [])
      } else {
        throw new Error(response.message || 'Failed to fetch weather alerts')
      }
    } catch (err: any) {
      console.error('Weather alerts fetch error:', err)
      setError(err.message || 'Failed to fetch weather alerts')
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async () => {
    if (!location) {
      toast({
        title: "Location Required",
        description: "Please select a location to subscribe to weather alerts",
        variant: "destructive"
      })
      return
    }

    setSubscribing(true)

    try {
      const response = await apiService.subscribeToWeatherAlerts(
        location.lat,
        location.lng,
        ['weather', 'agricultural'],
        cropType ? [cropType] : []
      )

      if (response.status === 'success') {
        setSubscribed(true)
        toast({
          title: "Subscribed Successfully",
          description: "You will now receive weather alerts for your area",
        })
      } else {
        throw new Error(response.message || 'Failed to subscribe to alerts')
      }
    } catch (err: any) {
      console.error('Subscription error:', err)
      toast({
        title: "Subscription Failed",
        description: err.message || 'Failed to subscribe to weather alerts',
        variant: "destructive"
      })
    } finally {
      setSubscribing(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    const colors = {
      'low': 'bg-green-100 text-green-800 border-green-200',
      'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'high': 'bg-orange-100 text-orange-800 border-orange-200',
      'critical': 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[severity as keyof typeof colors] || colors.low
  }

  const getSeverityIcon = (severity: string) => {
    if (severity === 'critical') return <AlertTriangle className="h-5 w-5 text-red-500" />
    if (severity === 'high') return <AlertTriangle className="h-5 w-5 text-orange-500" />
    if (severity === 'medium') return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    return <AlertTriangle className="h-5 w-5 text-green-500" />
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'agricultural':
        return <Crop className="h-4 w-4" />
      case 'weather':
        return <AlertTriangle className="h-4 w-4" />
      case 'climate':
        return <Clock className="h-4 w-4" />
      case 'emergency':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isAlertActive = (alert: WeatherAlert) => {
    const now = new Date()
    const startTime = new Date(alert.startTime)
    const endTime = new Date(alert.endTime)
    return alert.status === 'active' && startTime <= now && endTime >= now
  }

  const activeAlerts = alerts.filter(isAlertActive)
  const expiredAlerts = alerts.filter(alert => !isAlertActive(alert))

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Weather Alerts</h3>
          <p className="text-sm text-gray-600">
            {location ? `${location.city}, ${location.state}` : 'All locations'}
            {cropType && ` • ${cropType}`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAlerts}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {showSubscription && location && (
            <Button
              variant={subscribed ? "default" : "outline"}
              size="sm"
              onClick={handleSubscribe}
              disabled={subscribing || subscribed}
            >
              {subscribed ? (
                <>
                  <BellOff className="h-4 w-4 mr-2" />
                  Subscribed
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Subscribe
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
          <span className="ml-2">Loading alerts...</span>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700">Active Alerts ({activeAlerts.length})</h4>
          {activeAlerts.map((alert) => (
            <Alert key={alert._id} className={getSeverityColor(alert.severity)}>
              <div className="flex items-start space-x-3">
                {getSeverityIcon(alert.severity)}
                <div className="flex-1">
                  <AlertTitle className="flex items-center justify-between">
                    <span>{alert.title}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {alert.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {alert.severity}
                      </Badge>
                    </div>
                  </AlertTitle>
                  <AlertDescription className="mt-2">
                    <p className="mb-3">{alert.description}</p>
                    
                    {/* Weather Conditions */}
                    {alert.weatherConditions && (
                      <div className="mb-3 p-2 bg-white/50 rounded text-xs">
                        <p className="font-medium mb-1">Current Conditions:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {alert.weatherConditions.temperature && (
                            <span>Temp: {alert.weatherConditions.temperature}°C</span>
                          )}
                          {alert.weatherConditions.humidity && (
                            <span>Humidity: {alert.weatherConditions.humidity}%</span>
                          )}
                          {alert.weatherConditions.windSpeed && (
                            <span>Wind: {alert.weatherConditions.windSpeed} m/s</span>
                          )}
                          {alert.weatherConditions.precipitation && (
                            <span>Rain: {alert.weatherConditions.precipitation}mm</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Affected Crops */}
                    {alert.affectedCrops.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium mb-1">Affected Crops:</p>
                        <div className="flex flex-wrap gap-1">
                          {alert.affectedCrops.map((crop, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {crop}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {alert.recommendations && alert.recommendations.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium mb-1">Recommendations:</p>
                        <ul className="text-xs space-y-1">
                          {alert.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-1">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Time and Location */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>
                            {formatTime(alert.startTime)} - {formatTime(alert.endTime)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{alert.location.city}, {alert.location.state}</span>
                        </div>
                      </div>
                      <div className="text-xs">
                        {alert.notificationsSent} farmers notified
                      </div>
                    </div>
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* No Active Alerts */}
      {!loading && activeAlerts.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold mb-2">No Active Alerts</h4>
            <p className="text-gray-600">
              {location 
                ? `There are no active weather alerts for ${location.city}, ${location.state} at this time.`
                : 'There are no active weather alerts at this time.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Expired Alerts */}
      {expiredAlerts.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700">Recent Alerts ({expiredAlerts.length})</h4>
          <div className="space-y-2">
            {expiredAlerts.slice(0, 3).map((alert) => (
              <Card key={alert._id} className="opacity-60">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(alert.type)}
                      <span className="font-medium text-sm">{alert.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {alert.severity}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTime(alert.endTime)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
