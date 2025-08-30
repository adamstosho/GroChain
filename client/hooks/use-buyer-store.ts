import { create } from 'zustand'
import { apiService } from '@/lib/api'

interface BuyerState {
  profile: any
  favorites: any[]
  cart: any[]
  orders: any[]
  notifications: any[]
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchProfile: () => Promise<void>
  updateProfile: (data: any) => Promise<void>
  fetchFavorites: () => Promise<void>
  addToFavorites: (listingId: string, notes?: string) => Promise<void>
  removeFromFavorites: (listingId: string) => Promise<void>
  addToCart: (product: any, quantity: number) => void
  removeFromCart: (productId: string) => void
  updateCartQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  fetchOrders: () => Promise<void>
  createOrder: (orderData: any) => Promise<void>
  fetchNotifications: () => Promise<void>
  markNotificationAsRead: (notificationId: string) => Promise<void>
}

export const useBuyerStore = create<BuyerState>((set, get) => ({
  profile: null,
  favorites: [],
  cart: [],
  orders: [],
  notifications: [],
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiService.getBuyerProfile()
      set({ profile: response.data, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  updateProfile: async (data: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiService.updateBuyerProfile(data)
      set({ profile: response.data, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchFavorites: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiService.getFavorites(get().profile?._id)
      set({ favorites: response.data?.favorites || [], isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  addToFavorites: async (listingId: string, notes?: string) => {
    try {
      await apiService.addToFavorites(listingId, notes)
      await get().fetchFavorites()
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  removeFromFavorites: async (listingId: string) => {
    try {
      await apiService.removeFromFavorites(get().profile?._id, listingId)
      await get().fetchFavorites()
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  addToCart: (product: any, quantity: number) => {
    const existingItem = get().cart.find(item => item.id === product._id)
    if (existingItem) {
      get().updateCartQuantity(product._id, existingItem.quantity + quantity)
    } else {
      set(state => ({
        cart: [...state.cart, { 
          id: product._id,
          listingId: product._id,
          cropName: product.cropName,
          quantity,
          unit: product.unit,
          price: product.basePrice,
          total: product.basePrice * quantity,
          farmer: product.farmer.name,
          location: `${product.location.city}, ${product.location.state}`,
          image: product.images[0],
          availableQuantity: product.availableQuantity
        }]
      }))
    }
  },

  removeFromCart: (productId: string) => {
    set(state => ({
      cart: state.cart.filter(item => item.id !== productId)
    }))
  },

  updateCartQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeFromCart(productId)
    } else {
      set(state => ({
        cart: state.cart.map(item =>
          item.id === productId 
            ? { ...item, quantity, total: item.price * quantity }
            : item
        )
      }))
    }
  },

  clearCart: () => {
    set({ cart: [] })
  },

  fetchOrders: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiService.getBuyerOrders(get().profile?._id)
      set({ orders: response.data?.orders || [], isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  createOrder: async (orderData: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiService.createOrder(orderData)
      const newOrders = [...get().orders, response.data]
      set({ orders: newOrders, isLoading: false })
      get().clearCart() // Clear cart after successful order
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchNotifications: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiService.getUserNotifications()
      set({ notifications: response.data?.notifications || [], isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  markNotificationAsRead: async (notificationId: string) => {
    try {
      await apiService.markNotificationAsRead(notificationId)
      set(state => ({
        notifications: state.notifications.map(notification =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      }))
    } catch (error: any) {
      set({ error: error.message })
    }
  },
}))

