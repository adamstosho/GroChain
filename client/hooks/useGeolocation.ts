import { useState, useEffect } from 'react'

interface GeolocationData {
  lat: number
  lng: number
  city?: string
  state?: string
  country?: string
  accuracy?: number
}

interface GeolocationHookResult {
  location: GeolocationData | null
  loading: boolean
  error: string | null
  requestLocation: () => void
}

export const useGeolocation = (): GeolocationHookResult => {
  const [location, setLocation] = useState<GeolocationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Function to get city/state from coordinates using reverse geocoding
  const reverseGeocode = async (lat: number, lng: number): Promise<{ city?: string; state?: string; country?: string }> => {
    try {
      // Using OpenStreetMap Nominatim API for reverse geocoding (free and reliable)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`,
        {
          headers: {
            'User-Agent': 'GroChain/1.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Reverse geocoding failed')
      }

      const data = await response.json()

      // Extract location details from the response
      const address = data.address || {}
      
      // More comprehensive city detection
      const city = address.city ||
                   address.town ||
                   address.village ||
                   address.hamlet ||
                   address.suburb ||
                   address.county ||
                   address.municipality ||
                   address.city_district ||
                   'Unknown City'

      // More comprehensive state detection
      const state = address.state || 
                   address.region || 
                   address.state_district ||
                   address.province ||
                   'Unknown State'
      
      const country = address.country || 'Nigeria'

      console.log('🌍 Reverse geocoding result:', { 
        lat, 
        lng, 
        city, 
        state, 
        country,
        fullAddress: data.display_name 
      })

      return { city, state, country }
    } catch (err) {
      console.error('Reverse geocoding error:', err)
      return { city: 'Current Location', state: 'Unknown State', country: 'Nigeria' }
    }
  }

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      return
    }

    setLoading(true)
    setError(null)

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords

        console.log('📍 Got user location:', { latitude, longitude, accuracy })

        // Get city/state information
        const locationDetails = await reverseGeocode(latitude, longitude)

        const locationData: GeolocationData = {
          lat: latitude,
          lng: longitude,
          city: locationDetails.city,
          state: locationDetails.state,
          country: locationDetails.country,
          accuracy
        }

        setLocation(locationData)
        setLoading(false)

        console.log('📍 Complete location data:', locationData)
      },
      (err) => {
        console.error('❌ Geolocation error:', err)
        let errorMessage = 'Unable to get your location'

        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.'
            break
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.'
            break
          case err.TIMEOUT:
            errorMessage = 'Location request timed out.'
            break
        }

        setError(errorMessage)
        setLoading(false)
      },
      options
    )
  }

  // Auto-request location on first load if not already available
  useEffect(() => {
    if (!location && !loading && !error) {
      console.log('🌍 Auto-requesting user location...')
      // Add a small delay to ensure the component is ready
      const timer = setTimeout(() => {
        requestLocation()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [])

  return {
    location,
    loading,
    error,
    requestLocation
  }
}

