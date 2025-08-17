"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
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
  testSetUser: (user: User) => void // Add test function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  console.log('🔐 AuthProvider render - user:', user, 'loading:', loading)

  useEffect(() => {
    console.log('🔐 AuthProvider useEffect - user state changed:', user)
    console.log('🔐 AuthProvider useEffect - user type:', typeof user)
    console.log('🔐 AuthProvider useEffect - user keys:', user ? Object.keys(user) : 'null')
  }, [user])

  useEffect(() => {
    console.log('🔐 AuthProvider useEffect - loading state changed:', loading)
  }, [loading])

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem("auth_token")
    if (token) {
      api.setToken(token)
      
      // Also set the cookie for middleware authentication
      document.cookie = `auth_token=${token}; path=/; max-age=3600; samesite=lax`
      
      // TODO: Validate token with server instead of setting mock user
      // For now, we'll check if we have user data in localStorage
      const savedUser = localStorage.getItem("user_data")
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          setUser(userData)
        } catch (error) {
          console.error("Error parsing saved user data:", error)
          // Clear invalid data
          localStorage.removeItem("user_data")
          localStorage.removeItem("auth_token")
          document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        }
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Starting login process...')
      const response = await api.login({ email, password })

      console.log('🔐 Full API response:', response)
      console.log('🔐 Response success:', response.success)
      console.log('🔐 Response data:', response.data)
      console.log('🔐 Response error:', response.error)
      console.log('🔐 Response data keys:', response.data ? Object.keys(response.data) : 'No data')
      console.log('🔐 Response data.status:', response.data?.status)
      console.log('🔐 Response data.user:', response.data?.user)
      console.log('🔐 Response data.accessToken:', response.data?.accessToken)

      if (response.success && response.data) {
        // Backend returns: { status: 'success', user: {...}, accessToken: '...' }
        // response.data contains the actual response body from backend
        // Handle both response formats: direct properties or nested in data
        let userData = response.data.user
        let token = response.data.accessToken
        
        // If the main response doesn't have user/token, check the nested data property
        if (!userData && response.data.data) {
          userData = response.data.data.user
          token = response.data.data.accessToken
        }

        console.log('🔐 Login response data:', response.data)
        console.log('🔐 User data extracted:', userData)
        console.log('🔐 Token extracted:', token)

        if (!userData) {
          console.error('🔐 No user data found in response!')
          console.error('🔐 Available keys in response.data:', Object.keys(response.data))
          if (response.data.data) {
            console.error('🔐 Available keys in response.data.data:', Object.keys(response.data.data))
          }
          toast.error("Login response missing user data")
          return false
        }

        if (token) {
          localStorage.setItem("auth_token", token)
          api.setToken(token)
          
          // Also set a cookie for middleware authentication
          document.cookie = `auth_token=${token}; path=/; max-age=3600; samesite=lax`
          
          console.log('🔐 Token saved to localStorage, API client, and cookie')
        } else {
          console.error('🔐 No token found in response!')
          toast.error("Login response missing token")
          return false
        }

        // Ensure we have the correct user data structure
        const user = {
          id: userData._id || userData.id, // Backend returns _id
          email: userData.email,
          name: userData.name,
          role: userData.role || 'farmer', // Default to farmer if no role
          phone: userData.phone || "",
          emailVerified: userData.emailVerified || false,
          createdAt: userData.createdAt || new Date().toISOString(),
          updatedAt: userData.updatedAt || new Date().toISOString(),
        }

        console.log('🔐 Final user object:', user)
        
        // Save user data to localStorage for persistence
        localStorage.setItem("user_data", JSON.stringify(user))
        
        console.log('🔐 About to call setUser with:', user)
        setUser(user)
        console.log('🔐 setUser called')
        
        // Show role-specific welcome message
        const roleNames = {
          farmer: 'Farmer',
          buyer: 'Buyer', 
          partner: 'Partner',
          aggregator: 'Aggregator',
          admin: 'Administrator'
        }
        
        toast.success(`Login successful! Welcome back, ${roleNames[user.role as keyof typeof roleNames] || 'User'}!`)
        return true
      }

      console.error('🔐 Login failed:', response.error || 'Unknown error')
      toast.error(response.error || "Login failed. Please try again.")
      return false
    } catch (error) {
      console.error("Login error:", error)
      toast.error("Network error. Please check your connection.")
      return false
    }
  }

  const register = async (userData: any): Promise<boolean> => {
    try {
      const response = await api.register(userData)

      if (response.success && response.data) {
        const user = (response.data as any).user
        const token = (response.data as any).accessToken || (response.data as any).token

        if (token) {
          localStorage.setItem("auth_token", token)
          api.setToken(token)
        }

        setUser({
          id: user.id || user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone || "",
          emailVerified: user.emailVerified || false,
          createdAt: user.createdAt || new Date().toISOString(),
          updatedAt: user.updatedAt || new Date().toISOString(),
        })
        return true
      }

      return false
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    api.clearToken()
    
    // Also clear the auth cookie
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    
    api.logout()
  }

  const testSetUser = (user: User) => {
    console.log('🔐 Test function called to set user:', user)
    setUser(user)
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
        testSetUser,
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
