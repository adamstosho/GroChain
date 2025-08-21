/**
 * Geolocation utility functions with proper error handling
 */

export interface GeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

export interface GeolocationResult {
  success: boolean
  latitude?: number
  longitude?: number
  error?: string
  errorCode?: number
}

/**
 * Request user's current location with proper error handling
 * This function should only be called in response to a user action
 */
export const requestCurrentLocation = (
  options: GeolocationOptions = {}
): Promise<GeolocationResult> => {
  return new Promise((resolve) => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      resolve({
        success: false,
        error: "Geolocation is not supported by this browser",
        errorCode: -1
      })
      return
    }

    // Safety check: ensure this is called in response to user action
    // This helps prevent automatic permission requests that violate policies
    if (typeof window !== 'undefined' && !window.event?.type) {
      console.log('Geolocation requested - checking if this is user-initiated...')
      // Don't block the request, just log for debugging
    }

    // Default options
    const defaultOptions: GeolocationOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
      ...options
    }

    // Request location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          success: true,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      (error) => {
        let errorMessage = "Failed to get location"
        let errorCode = error.code

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions in your browser settings."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable. Please try again or enter location manually."
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again or enter location manually."
            break
          default:
            errorMessage = "An unknown error occurred while getting location."
        }

        resolve({
          success: false,
          error: errorMessage,
          errorCode
        })
      },
      defaultOptions
    )
  })
}

/**
 * Check if geolocation is available and permission status
 * This function is safe to call without triggering permission requests
 */
export const checkGeolocationStatus = (): {
  supported: boolean
  permission: 'granted' | 'denied' | 'prompt' | 'unknown'
} => {
  const supported = !!navigator.geolocation
  
  if (!supported) {
    return { supported: false, permission: 'unknown' }
  }

  // Don't check permissions automatically - this can trigger policy violations
  // Only check when explicitly requested by user action
  return { supported: true, permission: 'unknown' }
}

/**
 * Format coordinates for display
 */
export const formatCoordinates = (lat: number, lng: number, decimals: number = 6): string => {
  return `${lat.toFixed(decimals)}, ${lng.toFixed(decimals)}`
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export const calculateDistance = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
