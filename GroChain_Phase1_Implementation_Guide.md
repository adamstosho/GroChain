# GroChain Frontend - Phase 1 Implementation Guide
## Core Infrastructure & Authentication

### Step 1: API Integration Layer

#### 1.1 Create API Client (`lib/api/client.ts`)
```typescript
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          this.handleUnauthorized();
        } else if (error.response?.status >= 500) {
          toast.error('Server error. Please try again later.');
        }
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private handleUnauthorized() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  // Generic methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
```

#### 1.2 Create API Services (`lib/api/services.ts`)
```typescript
import { apiClient } from './client';

// Auth Services
export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    return apiClient.post('/auth/login', credentials);
  },

  register: async (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: string;
  }) => {
    return apiClient.post('/auth/register', userData);
  },

  forgotPassword: async (email: string) => {
    return apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string) => {
    return apiClient.post('/auth/reset-password', { token, password });
  },

  verifyEmail: async (token: string) => {
    return apiClient.post('/auth/verify-email', { token });
  },

  refreshToken: async (refreshToken: string) => {
    return apiClient.post('/auth/refresh', { refreshToken });
  },

  sendSmsOtp: async (phone: string) => {
    return apiClient.post('/auth/send-sms-otp', { phone });
  },

  verifySmsOtp: async (phone: string, otp: string) => {
    return apiClient.post('/auth/verify-sms-otp', { phone, otp });
  },
};

// User Services
export const userService = {
  getProfile: async () => {
    return apiClient.get('/users/profile/me');
  },

  updateProfile: async (data: any) => {
    return apiClient.put('/users/profile/me', data);
  },

  getUsers: async (params?: any) => {
    return apiClient.get('/users', { params });
  },

  getUser: async (userId: string) => {
    return apiClient.get(`/users/${userId}`);
  },
};

// Marketplace Services
export const marketplaceService = {
  getListings: async (params?: any) => {
    return apiClient.get('/marketplace/listings', { params });
  },

  getListing: async (id: string) => {
    return apiClient.get(`/marketplace/listings/${id}`);
  },

  createListing: async (data: any) => {
    return apiClient.post('/marketplace/listings', data);
  },

  updateListing: async (id: string, data: any) => {
    return apiClient.patch(`/marketplace/listings/${id}`, data);
  },

  createOrder: async (data: any) => {
    return apiClient.post('/marketplace/orders', data);
  },

  getOrders: async (params?: any) => {
    return apiClient.get('/marketplace/orders', { params });
  },

  getOrder: async (id: string) => {
    return apiClient.get(`/marketplace/orders/${id}`);
  },
};

// Harvest Services
export const harvestService = {
  getHarvests: async (params?: any) => {
    return apiClient.get('/harvests', { params });
  },

  createHarvest: async (data: any) => {
    return apiClient.post('/harvests', data);
  },

  getHarvest: async (batchId: string) => {
    return apiClient.get(`/harvests/${batchId}`);
  },

  getProvenance: async (batchId: string) => {
    return apiClient.get(`/harvests/provenance/${batchId}`);
  },
};

// Analytics Services
export const analyticsService = {
  getDashboard: async (params?: any) => {
    return apiClient.get('/analytics/dashboard', { params });
  },

  getFarmerAnalytics: async (params?: any) => {
    return apiClient.get('/analytics/farmers', { params });
  },

  getTransactionAnalytics: async (params?: any) => {
    return apiClient.get('/analytics/transactions', { params });
  },

  getMarketplaceAnalytics: async (params?: any) => {
    return apiClient.get('/analytics/marketplace', { params });
  },
};

// Weather Services
export const weatherService = {
  getCurrentWeather: async (params?: any) => {
    return apiClient.get('/weather/current', { params });
  },

  getForecast: async (params?: any) => {
    return apiClient.get('/weather/forecast', { params });
  },

  getAgriculturalInsights: async (params?: any) => {
    return apiClient.get('/weather/agricultural-insights', { params });
  },
};

// Payment Services
export const paymentService = {
  initializePayment: async (data: any) => {
    return apiClient.post('/payments/initialize', data);
  },

  getPaymentConfig: async () => {
    return apiClient.get('/payments/config');
  },
};

// Notification Services
export const notificationService = {
  getPreferences: async () => {
    return apiClient.get('/notifications/preferences');
  },

  updatePreferences: async (preferences: any) => {
    return apiClient.put('/notifications/preferences', preferences);
  },

  updatePushToken: async (token: string) => {
    return apiClient.put('/notifications/push-token', { pushToken: token });
  },
};
```

### Step 2: State Management

#### 2.1 Install Zustand
```bash
npm install zustand
```

#### 2.2 Create Auth Store (`stores/auth-store.ts`)
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/lib/api/services';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'farmer' | 'partner' | 'admin' | 'buyer';
  status: 'active' | 'inactive' | 'suspended';
  emailVerified: boolean;
  phoneVerified: boolean;
  location?: string;
  partner?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(credentials);
          const { user, accessToken, refreshToken } = response;
          
          // Store token in localStorage for API client
          localStorage.setItem('auth_token', accessToken);
          
          set({
            user,
            token: accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(userData);
          set({ isLoading: false });
          return response;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('auth_token');
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      refreshAuth: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return;

        try {
          const response = await authService.refreshToken(refreshToken);
          const { accessToken, newRefreshToken } = response;
          
          localStorage.setItem('auth_token', accessToken);
          
          set({
            token: accessToken,
            refreshToken: newRefreshToken,
          });
        } catch (error) {
          get().logout();
        }
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

#### 2.3 Create User Store (`stores/user-store.ts`)
```typescript
import { create } from 'zustand';
import { userService } from '@/lib/api/services';

interface UserState {
  users: any[];
  currentUser: any | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchUsers: (params?: any) => Promise<void>;
  fetchUser: (userId: string) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  currentUser: null,
  isLoading: false,
  error: null,

  fetchUsers: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const users = await userService.getUsers(params);
      set({ users, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch users',
        isLoading: false,
      });
    }
  },

  fetchUser: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const user = await userService.getUser(userId);
      set({ currentUser: user, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch user',
        isLoading: false,
      });
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await userService.updateProfile(data);
      set({ currentUser: updatedUser, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update profile',
        isLoading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
```

### Step 3: Complete Authentication System

#### 3.1 Enhanced Login Page (`app/login/page.tsx`)
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      clearError();
      await login(data);
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-yellow-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">G</span>
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Welcome to GroChain
            </CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3 bg-red-50 border border-red-200 rounded-md"
                >
                  <p className="text-sm text-red-600">{error}</p>
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <a
                href="/forgot-password"
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Forgot your password?
              </a>
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="/register" className="text-green-600 hover:text-green-700 font-medium">
                  Sign up
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
```

#### 3.2 Enhanced Registration Page (`app/register/page.tsx`)
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, User, Mail, Phone, Lock, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/stores/auth-store';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['farmer', 'buyer', 'partner']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      clearError();
      await registerUser(data);
      toast.success('Registration successful! Please check your email to verify your account.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-yellow-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">G</span>
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Join GroChain
            </CardTitle>
            <CardDescription className="text-gray-600">
              Create your account to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    className="pl-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
                    {...register('name')}
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    className="pl-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
                    {...register('phone')}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                  I am a
                </Label>
                <Select onValueChange={(value) => setValue('role', value as any)}>
                  <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="farmer">Farmer</SelectItem>
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    className="pl-10 pr-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    className="pl-10 pr-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3 bg-red-50 border border-red-200 rounded-md"
                >
                  <p className="text-sm text-red-600">{error}</p>
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="text-green-600 hover:text-green-700 font-medium">
                  Sign in
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
```

### Step 4: Route Protection Middleware

#### 4.1 Enhanced Middleware (`middleware.ts`)
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/marketplace',
    '/verify',
  ];

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If no token and trying to access protected route, redirect to login
  if (!token && pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If token exists and trying to access auth pages, redirect to dashboard
  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### Step 5: Environment Configuration

#### 5.1 Environment Variables (`.env.local`)
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=http://localhost:5000

# Authentication
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# External Services
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your-paystack-public-key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
NEXT_PUBLIC_OPENWEATHER_API_KEY=your-openweather-api-key

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

### Step 6: Type Definitions

#### 6.1 API Types (`types/api.ts`)
```typescript
// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'farmer' | 'partner' | 'admin' | 'buyer';
  status: 'active' | 'inactive' | 'suspended';
  emailVerified: boolean;
  phoneVerified: boolean;
  location?: string;
  partner?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: 'farmer' | 'buyer' | 'partner';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Marketplace Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  unit: string;
  category: string;
  images: string[];
  farmer: User;
  qualityGrade: 'premium' | 'standard' | 'basic';
  organic: boolean;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  buyer: User;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

// Harvest Types
export interface Harvest {
  id: string;
  batchId: string;
  farmer: User;
  cropType: string;
  quantity: number;
  unit: string;
  date: string;
  location: string;
  geoLocation: {
    lat: number;
    lng: number;
  };
  status: 'pending' | 'verified' | 'rejected' | 'approved';
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  description?: string;
  images: string[];
  qrData: string;
  verifiedBy?: User;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Analytics Types
export interface DashboardMetrics {
  totalUsers: number;
  totalHarvests: number;
  totalOrders: number;
  totalRevenue: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'harvest' | 'order' | 'user' | 'payment';
  description: string;
  timestamp: string;
  user?: User;
}

// Weather Types
export interface WeatherData {
  current: {
    temperature: number;
    humidity: number;
    description: string;
    icon: string;
  };
  forecast: WeatherForecast[];
  alerts: WeatherAlert[];
}

export interface WeatherForecast {
  date: string;
  temperature: {
    min: number;
    max: number;
  };
  description: string;
  icon: string;
}

export interface WeatherAlert {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'order' | 'harvest' | 'payment' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  marketing: boolean;
  transaction: boolean;
  harvest: boolean;
  marketplace: boolean;
}
```

This Phase 1 implementation provides the solid foundation needed for the GroChain frontend. It includes:

✅ **Complete API Integration Layer** - Centralized API client with interceptors
✅ **State Management** - Zustand stores for auth and user data
✅ **Enhanced Authentication** - Beautiful login/register pages with validation
✅ **Route Protection** - Middleware for protected routes
✅ **Type Safety** - Comprehensive TypeScript definitions
✅ **Error Handling** - Proper error management and user feedback
✅ **Loading States** - Smooth loading experiences
✅ **Responsive Design** - Mobile-first approach
✅ **Animations** - Framer Motion for smooth interactions

**Next Steps:**
1. Implement the dashboard layout system
2. Create role-based dashboard pages
3. Build the marketplace interface
4. Develop harvest management features
5. Integrate QR code functionality

This foundation ensures a robust, scalable, and maintainable frontend that integrates seamlessly with your backend APIs.
