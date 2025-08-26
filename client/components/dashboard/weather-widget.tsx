"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Cloud, Sun, CloudRain, Wind, Droplets } from "lucide-react"

export function WeatherWidget() {
  const [weather, setWeather] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await apiService.getCurrentWeather()
        setWeather(response.data)
      } catch (error: any) {
        // Use mock data if API fails
        setWeather({
          location: "Lagos, Nigeria",
          current: {
            temperature: 28,
            humidity: 75,
            windSpeed: 12,
            description: "Partly cloudy",
            icon: "partly-cloudy",
          },
          agriculturalInsights: {
            plantingRecommendations: ["Good conditions for planting tomatoes", "Consider irrigation for dry crops"],
            harvestingRecommendations: ["Ideal weather for harvesting grains"],
            irrigationAdvice: "Moderate irrigation needed",
            pestWarnings: ["Watch for aphids in humid conditions"],
          },
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchWeather()
  }, [toast])

  const getWeatherIcon = (description: string) => {
    if (description.includes("rain")) return CloudRain
    if (description.includes("cloud")) return Cloud
    if (description.includes("sun")) return Sun
    return Cloud
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weather</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-8 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const WeatherIcon = getWeatherIcon(weather?.current?.description || "")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weather</CardTitle>
        <CardDescription>{weather?.location}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Weather */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <WeatherIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{weather?.current?.temperature}°C</div>
                <div className="text-sm text-muted-foreground capitalize">{weather?.current?.description}</div>
              </div>
            </div>
          </div>

          {/* Weather Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Droplets className="h-4 w-4 text-muted-foreground" />
              <span>{weather?.current?.humidity}% humidity</span>
            </div>
            <div className="flex items-center space-x-2">
              <Wind className="h-4 w-4 text-muted-foreground" />
              <span>{weather?.current?.windSpeed} km/h</span>
            </div>
          </div>

          {/* Agricultural Insights */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Farming Insights</h4>
            <div className="space-y-1">
              {weather?.agriculturalInsights?.plantingRecommendations?.slice(0, 2).map((rec: string, index: number) => (
                <div key={index} className="text-xs text-muted-foreground flex items-start space-x-1">
                  <div className="h-1 w-1 rounded-full bg-primary mt-2" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          <Button variant="outline" size="sm" className="w-full bg-transparent">
            View Forecast
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
