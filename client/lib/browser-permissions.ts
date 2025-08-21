/**
 * Browser permissions utility functions
 */

export interface PermissionStatus {
  geolocation: 'granted' | 'denied' | 'prompt' | 'unknown'
  camera: 'granted' | 'denied' | 'prompt' | 'unknown'
  microphone: 'granted' | 'denied' | 'prompt' | 'unknown'
}

/**
 * Check current permission status for various features
 */
export const checkPermissions = async (): Promise<PermissionStatus> => {
  const permissions: PermissionStatus = {
    geolocation: 'unknown',
    camera: 'unknown',
    microphone: 'unknown'
  }

  // Check geolocation permission
  if ('permissions' in navigator) {
    try {
      const geoPermission = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
      permissions.geolocation = geoPermission.state as 'granted' | 'denied' | 'prompt'
    } catch (error) {
      console.log('Geolocation permission check failed:', error)
      permissions.geolocation = 'unknown'
    }

    try {
      const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName })
      permissions.camera = cameraPermission.state as 'granted' | 'denied' | 'prompt'
    } catch (error) {
      console.log('Camera permission check failed:', error)
      permissions.camera = 'unknown'
    }

    try {
      const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName })
      permissions.microphone = micPermission.state as 'granted' | 'denied' | 'prompt'
    } catch (error) {
      console.log('Microphone permission check failed:', error)
      permissions.microphone = 'unknown'
    }
  }

  return permissions
}

/**
 * Get instructions for enabling location permissions based on browser
 */
export const getLocationPermissionInstructions = (): {
  browser: string
  instructions: string[]
} => {
  const userAgent = navigator.userAgent.toLowerCase()
  
  if (userAgent.includes('chrome') || userAgent.includes('edge')) {
    return {
      browser: 'Chrome/Edge',
      instructions: [
        '1. Click the lock/info icon in the address bar (left of the URL)',
        '2. Click "Site settings"',
        '3. Find "Location" and change it from "Block" to "Allow"',
        '4. Refresh the page'
      ]
    }
  } else if (userAgent.includes('firefox')) {
    return {
      browser: 'Firefox',
      instructions: [
        '1. Click the shield icon in the address bar',
        '2. Click "Site Permissions"',
        '3. Find "Access Your Location" and change to "Allow"',
        '4. Refresh the page'
      ]
    }
  } else if (userAgent.includes('safari')) {
    return {
      browser: 'Safari',
      instructions: [
        '1. Go to Safari > Preferences > Websites > Location',
        '2. Find your site and change to "Allow"',
        '3. Refresh the page'
      ]
    }
  } else {
    return {
      browser: 'Unknown Browser',
      instructions: [
        '1. Look for a lock, shield, or info icon in the address bar',
        '2. Click it to access site permissions',
        '3. Find location settings and change to "Allow"',
        '4. Refresh the page'
      ]
    }
  }
}

/**
 * Check if geolocation is supported by the browser
 */
export const isGeolocationSupported = (): boolean => {
  return 'geolocation' in navigator
}

/**
 * Get a user-friendly error message for geolocation errors
 */
export const getGeolocationErrorMessage = (errorCode: number): string => {
  switch (errorCode) {
    case 1: // PERMISSION_DENIED
      return 'Location access denied. Please enable location permissions in your browser settings.'
    case 2: // POSITION_UNAVAILABLE
      return 'Location information unavailable. Please try again or enter location manually.'
    case 3: // TIMEOUT
      return 'Location request timed out. Please try again or enter location manually.'
    default:
      return 'An unknown error occurred while getting location.'
  }
}

/**
 * Request location permission explicitly (for browsers that support it)
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  if (!isGeolocationSupported()) {
    return false
  }

  try {
    // Try to get a single position to trigger permission request
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 60000
      })
    })
    return true
  } catch (error) {
    console.log('Location permission request failed:', error)
    return false
  }
}

