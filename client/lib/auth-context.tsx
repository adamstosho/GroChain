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

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
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
          console.log('🔐 Auth Context - Found existing auth data, restoring session')
          
          const userData = JSON.parse(savedUser)
          api.setToken(token)
          
          // Ensure cookie is set
          // Cookie will also be set by backend; keep client copy
          await setCookie('auth_token', token)
          
          console.log('🔐 Auth Context - Setting user from saved data:', userData)
          setUser(userData)
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
            }
          } catch {}
        }
      } catch (error) {
        console.error("🔐 Auth Context - Error initializing auth:", error)
        // Clear invalid data
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
        removeCookie("auth_token")
      } finally {
        console.log('🔐 Auth Context - Init complete, setting loading to false')
        setLoading(false)
      }
    }

    initAuth()
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
        
        // Set cookie immediately
        await setCookie('auth_token', token)
        
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
          setCookie('auth_token', token)
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
    setUser(null)
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    api.clearToken()
    
    // Clear auth cookie
    removeCookie("auth_token")
    
    toast.success("Logged out successfully")
    router.push("/login")
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