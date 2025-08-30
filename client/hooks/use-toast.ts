import { useState, useCallback, useEffect } from 'react'

interface ToastOptions {
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
  duration?: number
}

interface Toast extends ToastOptions {
  id: string
}

// Global toast state
let toastState: Toast[] = []
let listeners: Array<(toasts: Toast[]) => void> = []

const notify = (toasts: Toast[]) => {
  listeners.forEach(listener => listener(toasts))
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(toastState)

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setToasts(newToasts)
    }
    
    listeners.push(listener)
    return () => {
      listeners = listeners.filter(l => l !== listener)
    }
  }, [])

  const toast = useCallback((options: ToastOptions) => {
    const newToast: Toast = { 
      ...options, 
      id: Math.random().toString(36).substr(2, 9),
      duration: options.duration || 5000 
    }
    
    toastState = [...toastState, newToast]
    notify(toastState)
    
    // Auto remove toast after duration
    setTimeout(() => {
      toastState = toastState.filter(t => t.id !== newToast.id)
      notify(toastState)
    }, newToast.duration)
  }, [])

  const removeToast = useCallback((id: string) => {
    toastState = toastState.filter(t => t.id !== id)
    notify(toastState)
  }, [])

  return {
    toasts,
    toast,
    removeToast
  }
}

// Hook for components that only need to display toasts
export function useToaster() {
  const [toasts, setToasts] = useState<Toast[]>(toastState)

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setToasts(newToasts)
    }
    
    listeners.push(listener)
    return () => {
      listeners = listeners.filter(l => l !== listener)
    }
  }, [])

  return { toasts }
}

