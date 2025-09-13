"use client"

import React, { useState, useEffect } from 'react'
import { WeatherDashboard } from '@/components/weather/weather-dashboard'
import { WeatherAlerts } from '@/components/weather/weather-alerts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Cloud, 
  AlertTriangle, 
  TrendingUp, 
  MapPin,
  RefreshCw,
  Settings
} from "lucide-react"
import { useAuthGuard } from '@/lib/auth'

export default function WeatherPage() {
  const { user, hasAccess } = useAuthGuard()
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number
    lng: number
    city: string
    state: string
  } | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Set default location based on user profile or default to Lagos
  useEffect(() => {
    if (user?.profile?.state && user?.profile?.city) {
      // Use user's profile location if available
      const userLocation = {
        lat: user.profile.coordinates?.lat || 6.5244,
        lng: user.profile.coordinates?.lng || 3.3792,
        city: user.profile.city || 'Lagos',
        state: user.profile.state || 'Lagos'
      }
      setSelectedLocation(userLocation)
    } else {
      // Default to Lagos
      setSelectedLocation({
        lat: 6.5244,
        lng: 3.3792,
        city: 'Lagos',
        state: 'Lagos'
      })
    }
  }, [user])

  const handleLocationChange = (location: { lat: number; lng: number; city: string; state: string }) => {
    setSelectedLocation(location)
    setLastUpdated(new Date())
  }

  const handleRefresh = () => {
    setLastUpdated(new Date())
  }

  if (!hasAccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-gray-600">
              You need to be logged in to access weather information.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Cloud className="h-8 w-8 mr-3 text-blue-500" />
              Weather Services
            </h1>
            <p className="text-gray-600 mt-2">
              Real-time weather data and agricultural insights for Nigerian farmers
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {lastUpdated && (
              <Badge variant="outline" className="text-xs">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh All
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard" className="flex items-center">
            <Cloud className="h-4 w-4 mr-2" />
            Weather Dashboard
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Weather Alerts
          </TabsTrigger>
        </TabsList>

        {/* Weather Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <WeatherDashboard
            location={selectedLocation}
            onLocationChange={handleLocationChange}
          />
        </TabsContent>

        {/* Weather Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <WeatherAlerts
            location={selectedLocation}
            cropType={user?.preferences?.cropTypes?.[0]} // Use first crop type if available
            showSubscription={true}
          />
        </TabsContent>
      </Tabs>

      {/* Weather Information Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Coverage Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Weather data available for all major Nigerian cities including Lagos, Abuja, Kano, and Port Harcourt.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Agricultural Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Get personalized farming recommendations based on weather conditions, soil moisture, and crop types.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Smart Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Receive timely weather alerts via SMS and email to protect your crops from adverse conditions.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Footer Information */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <Settings className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Weather Data Sources</h4>
            <p className="text-sm text-blue-700 mt-1">
              Our weather data is sourced from OpenWeather API and AgroMonitoring services, 
              providing accurate and up-to-date information for Nigerian agricultural conditions. 
              Data is updated every 30 minutes to ensure farmers have the most current information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
