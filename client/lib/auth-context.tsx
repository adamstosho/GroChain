"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { api } from "./api"
import { User } from "@/types/api"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: any) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  forceReauth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper: set cookie via server route so middleware always sees it
const setCookie = async (name: string, value: string, days: number = 1) => {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  // Always set client cookie immediately
  try {
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax${secure}`
  } catch {}
  // Also ask server to set cookie for middleware reliability
  if (name === 'auth_token') {
    try {
      await fetch('/api/auth/set-cookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: value, maxAge: days * 24 * 60 * 60 })
      })
    } catch {}
  }
}

// Helper function to remove cookie
const removeCookie = async (name: string) => {
  try {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`
  } catch {}
  if (name === 'auth_token') {
    await fetch('/api/auth/clear-cookie', { method: 'POST' }).catch(() => {})
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isInitializingRef = useRef(false)

  // Set up automatic token refresh
  const setupTokenRefresh = (token: string) => {
    // Clear any existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current)
    }

    try {
      // Parse JWT to get expiration time
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expiresAt = payload.exp * 1000 // Convert to milliseconds
      const now = Date.now()
      const timeUntilExpiry = expiresAt - now
      
      // Refresh token 5 minutes before it expires
      const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 60000) // At least 1 minute
      
      console.log('🔐 Auth Context - Setting up token refresh in', Math.round(refreshTime / 60000), 'minutes')
      
      refreshTimerRef.current = setTimeout(async () => {
        console.log('🔐 Auth Context - Automatically refreshing token...')
        await refreshTokenSilently()
      }, refreshTime)
    } catch (error) {
      console.error('🔐 Auth Context - Error parsing token for refresh timing:', error)
      // Fallback: refresh every 23 hours
      refreshTimerRef.current = setTimeout(async () => {
        await refreshTokenSilently()
      }, 23 * 60 * 60 * 1000)
    }
  }

  // Silent token refresh
  const refreshTokenSilently = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token")
      if (!refreshToken) {
        console.log('🔐 Auth Context - No refresh token available')
        return false
      }

      console.log('🔐 Auth Context - Attempting silent token refresh...')
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.status === 'success' && data.accessToken) {
          console.log('🔐 Auth Context - Silent token refresh successful')
          
          const newToken = data.accessToken
          const newRefreshToken = data.refreshToken
          
          localStorage.setItem("auth_token", newToken)
          if (newRefreshToken) {
            localStorage.setItem("refresh_token", newRefreshToken)
          }
          
          api.setToken(newToken)
          api.refreshTokenFromStorage()
          await setCookie('auth_token', newToken)
          
          // Set up next refresh
          setupTokenRefresh(newToken)
          
          return true
        }
      }
      
      console.log('🔐 Auth Context - Silent token refresh failed')
      return false
    } catch (error) {
      console.error('🔐 Auth Context - Error during silent token refresh:', error)
      return false
    }
  }

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      if (isInitializingRef.current) {
        console.log('🔐 Auth Context - Already initializing, skipping...')
        return
      }
      
      isInitializingRef.current = true
      
      try {
        console.log('🔐 Auth Context - Initializing auth...')
        
        const token = localStorage.getItem("auth_token")
        const savedUser = localStorage.getItem("user_data")
        
        console.log('🔐 Auth Context - Init data:', { 
          hasToken: !!token, 
          hasSavedUser: !!savedUser,
          currentCookie: document.cookie
        })
        
        if (token && savedUser) {
          console.log('🔐 Auth Context - Found existing auth data, setting token...')
          
          // Set the token in the API client
          api.setToken(token)
          
          // Ensure cookie is set
          await setCookie('auth_token', token)
          
          // Refresh token in API client from storage
          api.refreshTokenFromStorage()
          
          // Set up automatic refresh
          setupTokenRefresh(token)
          
          // Try to get fresh user data
          try {
            const meResp = await fetch('/api/auth/me', { 
              cache: 'no-store', 
              credentials: 'include',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
            
            if (meResp.ok) {
              const meData = await meResp.json()
              if (meData.status === 'success' && meData.data?.user) {
                const u = meData.data.user
                const normalizedUser = {
                  id: u._id || u.id,
                  email: u.email,
                  name: u.name,
                  role: u.role || 'farmer',
                  phone: u.phone || "",
                  emailVerified: u.emailVerified || false,
                  createdAt: u.createdAt || new Date().toISOString(),
                  updatedAt: u.updatedAt || new Date().toISOString(),
                }
                setUser(normalizedUser)
                localStorage.setItem("user_data", JSON.stringify(normalizedUser))
                console.log('🔐 Auth Context - User session restored successfully')
                return
              }
            } else if (meResp.status === 401 || meResp.status === 403) {
              console.log('🔐 Auth Context - Token is invalid, attempting refresh...')
              
              // Try to refresh the token
              const refreshToken = localStorage.getItem("refresh_token")
              if (refreshToken) {
                try {
                  const refreshResp = await fetch('/api/auth/refresh', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken }),
                    credentials: 'include'
                  })
                  
                  if (refreshResp.ok) {
                    const refreshData = await refreshResp.json()
                    if (refreshData.status === 'success' && refreshData.accessToken) {
                      console.log('🔐 Auth Context - Token refreshed successfully')
                      
                      const newToken = refreshData.accessToken
                      const newRefreshToken = refreshData.refreshToken
                      
                      localStorage.setItem("auth_token", newToken)
                      if (newRefreshToken) {
                        localStorage.setItem("refresh_token", newRefreshToken)
                      }
                      
                      api.setToken(newToken)
                      api.refreshTokenFromStorage()
                      await setCookie('auth_token', newToken)
                      
                      // Set up automatic refresh
                      setupTokenRefresh(newToken)
                      
                      // Get fresh user data
                      const meResp2 = await fetch('/api/auth/me', { 
                        cache: 'no-store', 
                        credentials: 'include',
                        headers: {
                          'Authorization': `Bearer ${newToken}`,
                          'Content-Type': 'application/json'
                        }
                      })
                      
                      if (meResp2.ok) {
                        const meData2 = await meResp2.json()
                        if (meData2.status === 'success' && meData2.data?.user) {
                          const u = meData2.data.user
                          const normalizedUser = {
                            id: u._id || u.id,
                            email: u.email,
                            name: u.name,
                            role: u.role || 'farmer',
                            phone: u.phone || "",
                            emailVerified: u.emailVerified || false,
                            createdAt: u.createdAt || new Date().toISOString(),
                            updatedAt: u.updatedAt || new Date().toISOString(),
                          }
                          setUser(normalizedUser)
                          localStorage.setItem("user_data", JSON.stringify(normalizedUser))
                          console.log('🔐 Auth Context - User session restored after refresh')
                          return
                        }
                      }
                    }
                  }
                } catch (refreshError) {
                  console.error('🔐 Auth Context - Token refresh failed:', refreshError)
                }
              }
              
              // If we get here, refresh failed or no refresh token
              console.log('🔐 Auth Context - Clearing invalid auth data')
              localStorage.removeItem("auth_token")
              localStorage.removeItem("refresh_token")
              localStorage.removeItem("user_data")
              removeCookie("auth_token")
              api.clearToken()
            }
          } catch (meError) {
            console.error('🔐 Auth Context - Error getting user data:', meError)
            // Fall back to saved user data if API call fails
            try {
              const userData = JSON.parse(savedUser)
              setUser(userData)
              console.log('🔐 Auth Context - Using saved user data as fallback')
            } catch (parseError) {
              console.error('🔐 Auth Context - Error parsing saved user data:', parseError)
            }
          }
        } else {
          console.log('🔐 Auth Context - No saved auth data found, trying /api/auth/me')
          try {
            const me = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' })
              .then(r => r.json()).catch(() => null)
            if (me && me.status === 'success' && me.data?.user) {
              const u = me.data.user
              const normalizedUser = {
                id: u._id || u.id,
                email: u.email,
                name: u.name,
                role: u.role || 'farmer',
                phone: u.phone || "",
                emailVerified: u.emailVerified || false,
                createdAt: u.createdAt || new Date().toISOString(),
                updatedAt: u.updatedAt || new Date().toISOString(),
              }
              setUser(normalizedUser)
              localStorage.setItem("user_data", JSON.stringify(normalizedUser))
              
              // Set token if we got user data
              if (me.accessToken) {
                api.setToken(me.accessToken)
                api.refreshTokenFromStorage()
                localStorage.setItem("auth_token", me.accessToken)
                await setCookie('auth_token', me.accessToken)
                setupTokenRefresh(me.accessToken)
              }
            }
          } catch {}
        }
      } catch (error) {
        console.error("🔐 Auth Context - Error initializing auth:", error)
        // Clear invalid data
        localStorage.removeItem("auth_token")
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("user_data")
        removeCookie("auth_token")
        api.clearToken()
      } finally {
        console.log('🔐 Auth Context - Init complete, setting loading to false')
        setLoading(false)
        isInitializingRef.current = false
      }
    }

    initAuth()

    // Listen for token expiration events from API client
    const handleTokenExpired = () => {
      console.log('🔐 Auth Context - Received token expired event')
      forceReauth()
    }

    window.addEventListener('auth:token-expired', handleTokenExpired)

    return () => {
      window.removeEventListener('auth:token-expired', handleTokenExpired)
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
      }
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.login({ email, password })

      if (response.success && response.data) {
        const { user: userData, accessToken: token, refreshToken } = response.data as any
        
        console.log('🔐 Auth Context - Login response data:', { userData, token })
        
        if (!userData || !token) {
          console.error('🔐 Auth Context - Missing user data or token')
          toast.error("Login failed: Invalid response from server")
          return false
        }

        // Create normalized user object first
        const normalizedUser = {
          id: userData._id || userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role || 'farmer',
          phone: userData.phone || "",
          emailVerified: userData.emailVerified || false,
          createdAt: userData.createdAt || new Date().toISOString(),
          updatedAt: userData.updatedAt || new Date().toISOString(),
        }

        console.log('🔐 Auth Context - Normalized user:', normalizedUser)

        // Save everything synchronously
        localStorage.setItem("auth_token", token)
        if (refreshToken) {
          localStorage.setItem("refresh_token", refreshToken)
        }
        localStorage.setItem("user_data", JSON.stringify(normalizedUser))
        api.setToken(token)
        
        // Refresh token in API client from storage
        api.refreshTokenFromStorage()
        
        // Set cookie immediately
        await setCookie('auth_token', token)
        
        // Set up automatic token refresh
        setupTokenRefresh(token)
        
        console.log('🔐 Auth Context - About to set user state')
        
        // Update state immediately
        setUser(normalizedUser)
        
        console.log('🔐 Auth Context - User state set, login successful')
        
        toast.success(`Welcome back, ${normalizedUser.name}!`)
        return true
      }

      console.error('🔐 Auth Context - Login failed:', response.error)
      toast.error(response.error || "Login failed. Please try again.")
      return false
    } catch (error) {
      console.error("🔐 Auth Context - Login error:", error)
      toast.error("Network error. Please check your connection.")
      return false
    }
  }

  const register = async (userData: any): Promise<boolean> => {
    try {
      const response = await api.register(userData)

      if (response.success && response.data) {
        const responseData = response.data as any
        const { user: responseUser, accessToken: token } = responseData

        if (token) {
          localStorage.setItem("auth_token", token)
          api.setToken(token)
          api.refreshTokenFromStorage()
          setCookie('auth_token', token)
          setupTokenRefresh(token)
        }
        if ((responseData as any).refreshToken) {
          localStorage.setItem("refresh_token", (responseData as any).refreshToken)
        }

        const normalizedUser = {
          id: responseUser._id || responseUser.id,
          email: responseUser.email,
          name: responseUser.name,
          role: responseUser.role,
          phone: responseUser.phone || "",
          emailVerified: responseUser.emailVerified || false,
          createdAt: responseUser.createdAt || new Date().toISOString(),
          updatedAt: responseUser.updatedAt || new Date().toISOString(),
        }

        localStorage.setItem("user_data", JSON.stringify(normalizedUser))
        setUser(normalizedUser)
        toast.success("Registration successful!")
        return true
      }

      toast.error(response.error || "Registration failed. Please try again.")
      return false
    } catch (error) {
      console.error("Registration error:", error)
      toast.error("Network error. Please check your connection.")
      return false
    }
  }

  const logout = () => {
    console.log('🔐 Auth Context - Logging out user')
    
    // Clear refresh timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current)
      refreshTimerRef.current = null
    }
    
    // Clear all auth data
    localStorage.removeItem("auth_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user_data")
    removeCookie("auth_token")
    api.clearToken()
    
    // Clear user state
    setUser(null)
    
    // Redirect to login
    router.push("/login")
    
    toast.success("Logged out successfully")
  }

  const forceReauth = () => {
    console.log('🔐 Auth Context - Forcing re-authentication')
    
    // Clear refresh timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current)
      refreshTimerRef.current = null
    }
    
    // Clear all auth data
    localStorage.removeItem("auth_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user_data")
    removeCookie("auth_token")
    api.clearToken()
    
    // Clear user state
    setUser(null)
    
    // Redirect to login
    router.push("/login")
    
    toast.error("Session expired. Please log in again.")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        forceReauth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
