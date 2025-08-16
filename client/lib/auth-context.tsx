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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem("auth_token")
    if (token) {
      api.setToken(token)
      // In a real app, you'd validate the token with the server
      // For now, we'll set a mock user
      setUser({
        id: "1",
        email: "user@example.com",
        name: "John Doe",
        role: "farmer",
        phone: "+2348012345678",
        emailVerified: true,
        phoneVerified: true,
      })
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.login({ email, password })

      if (response.success && response.data) {
        const userData = response.data.user || response.data
        const token = response.data.accessToken || response.data.token

        if (token) {
          localStorage.setItem("auth_token", token)
          api.setToken(token)
        }

        setUser({
          id: userData.id || userData._id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          name: userData.name || `${userData.firstName} ${userData.lastName}`,
          role: userData.role,
          phoneNumber: userData.phoneNumber,
          phone: userData.phone || userData.phoneNumber,
          emailVerified: userData.emailVerified || false,
          phoneVerified: userData.phoneVerified || false,
          bvnVerified: userData.bvnVerified || false,
          location: userData.location,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
        })
        
        toast.success("Login successful! Welcome back.")
        return true
      }

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
        const user = response.data.user
        const token = response.data.accessToken || response.data.token

        if (token) {
          localStorage.setItem("auth_token", token)
          api.setToken(token)
        }

        setUser({
          id: user.id || user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          emailVerified: user.emailVerified || false,
          phoneVerified: user.phoneVerified || false,
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
    api.clearToken()
    api.logout()
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
