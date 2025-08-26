import { create } from "zustand"
import { persist } from "zustand/middleware"
import { apiService } from "./api"
import type { User } from "./types"

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  refreshAuth: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await apiService.login(email, password)
          const { user, token, refreshToken } = response.data!

          apiService.setToken(token)
          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (userData: any) => {
        set({ isLoading: true })
        try {
          const response = await apiService.register(userData)
          const { user, token, refreshToken } = response.data!

          apiService.setToken(token)
          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        apiService.clearToken()
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      refreshAuth: async () => {
        const { refreshToken } = get()
        if (!refreshToken) return

        try {
          const response = await apiService.refreshToken(refreshToken)
          const { token, refreshToken: newRefreshToken } = response.data!

          apiService.setToken(token)
          set({
            token,
            refreshToken: newRefreshToken,
          })
        } catch (error) {
          get().logout()
          throw error
        }
      },

      updateUser: (userData: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }))
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
    }),
    {
      name: "grochain-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

// Auth guard hook
export const useAuthGuard = (requiredRole?: string) => {
  const { user, isAuthenticated } = useAuthStore()

  const hasAccess = () => {
    if (!isAuthenticated || !user) return false
    if (!requiredRole) return true
    return user.role === requiredRole || user.role === "admin"
  }

  return {
    user,
    isAuthenticated,
    hasAccess: hasAccess(),
    role: user?.role,
  }
}
