# 🌾 **FARMER ROLE INTEGRATION GUIDE**
## Complete Frontend-Backend Integration for GroChain Farmers

---

## 📋 **TABLE OF CONTENTS**
1. [Environment Setup](#environment-setup)
2. [Authentication Flow](#authentication-flow)
3. [Dashboard Integration](#dashboard-integration)
4. [Harvest Management](#harvest-management)
5. [Marketplace Integration](#marketplace-integration)
6. [QR Code System](#qr-code-system)
7. [Financial Services](#financial-services)
8. [Testing & Validation](#testing--validation)
9. [Common Issues & Fixes](#common-issues--fixes)

---

## 🔧 **ENVIRONMENT SETUP**

### **Backend Environment (.env)**
```bash
# Copy backend/env.template to backend/.env
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/grochain

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Email (SendGrid recommended)
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@grochain.ng

# SMS (Twilio recommended)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_FROM_NUMBER=+1234567890

# Payment Gateway
PAYSTACK_SECRET_KEY=your-paystack-secret-key
PAYSTACK_PUBLIC_KEY=your-paystack-public-key
```

### **Frontend Environment (.env.local)**
```bash
# Copy client/env.template to client/.env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=ws://localhost:5000
NEXT_PUBLIC_AUTH_REDIRECT_URL=/dashboard
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true
```

---

## 🔐 **AUTHENTICATION FLOW**

### **1. User Registration**
```typescript
// Frontend: client/components/auth/register-form.tsx
const handleRegister = async (data: RegisterData) => {
  try {
    const response = await apiService.register({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: 'farmer',
      location: data.location
    })
    
    if (response.status === 'success') {
      // Redirect to email verification
      router.push('/verify-email')
    }
  } catch (error) {
    toast({
      title: "Registration failed",
      description: error.message,
      variant: "destructive"
    })
  }
}
```

### **2. User Login**
```typescript
// Frontend: client/components/auth/login-form.tsx
const handleLogin = async (data: LoginData) => {
  try {
    const response = await apiService.login({
      email: data.email,
      password: data.password
    })
    
    if (response.status === 'success') {
      // Store token
      apiService.setToken(response.data.token)
      
      // Redirect to dashboard
      router.push('/dashboard')
    }
  } catch (error) {
    toast({
      title: "Login failed",
      description: error.message,
      variant: "destructive"
    })
  }
}
```

### **3. Token Management**
```typescript
// Frontend: client/lib/auth.ts
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  
  login: async (credentials) => {
    set({ isLoading: true })
    try {
      const response = await apiService.login(credentials)
      const { token, user } = response.data
      
      // Store token in API service
      apiService.setToken(token)
      
      // Update state
      set({ user, token, isLoading: false })
      
      return response
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },
  
  logout: () => {
    apiService.clearToken()
    set({ user: null, token: null })
    router.push('/login')
  }
}))
```

---

## 📊 **DASHBOARD INTEGRATION**

### **1. Dashboard Data Fetching**
```typescript
// Frontend: client/components/dashboard/farmer-dashboard.tsx
useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      const [dashboardResponse, harvestsResponse, creditResp] = await Promise.all([
        apiService.getDashboard(),
        apiService.getHarvests({ limit: 5 }),
        apiService.getMyCreditScore(),
      ])

      setStats(dashboardResponse.data)
      setRecentHarvests(harvestsResponse.data || [])
      setCredit((creditResp as any)?.data || creditResp)
    } catch (error: any) {
      toast({
        title: "Error loading dashboard",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  fetchDashboardData()
}, [toast])
```

### **2. Backend Dashboard Endpoint**
```javascript
// Backend: backend/routes/user.routes.js
router.get('/dashboard', authenticate, authorize('farmer'), async (req, res) => {
  try {
    const userId = req.user.id
    
    // Get farmer-specific data
    const [totalHarvests, pendingHarvests, activeListings, monthlyRevenue] = await Promise.all([
      Harvest.countDocuments({ farmer: userId }),
      Harvest.countDocuments({ farmer: userId, status: 'pending' }),
      Listing.countDocuments({ farmer: userId, status: 'active' }),
      Transaction.aggregate([
        {
          $match: {
            farmer: userId,
            status: 'completed',
            createdAt: { $gte: startOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ])
    ])
    
    const dashboardData = {
      totalHarvests,
      pendingApprovals: pendingHarvests,
      activeListings,
      monthlyRevenue: monthlyRevenue[0]?.total || 0
    }
    
    return res.json({ status: 'success', data: dashboardData })
  } catch (error) {
    console.error('Dashboard error:', error)
    return res.status(500).json({ 
      status: 'error', 
      message: 'Failed to load dashboard data' 
    })
  }
})
```

---

## 🌾 **HARVEST MANAGEMENT**

### **1. Create New Harvest**
```typescript
// Frontend: client/components/harvests/harvest-form.tsx
const handleSubmit = async (data: HarvestFormData) => {
  try {
    const harvestData = {
      cropType: data.cropType,
      quantity: data.quantity,
      date: data.harvestDate,
      geoLocation: {
        lat: data.latitude,
        lng: data.longitude
      },
      unit: data.unit,
      location: data.location,
      description: data.description,
      quality: data.quality,
      images: uploadedImages
    }
    
    const response = await apiService.createHarvest(harvestData)
    
    if (response.status === 'success') {
      toast({
        title: "Harvest created successfully",
        description: "Your harvest has been recorded and is pending verification."
      })
      router.push('/dashboard/harvests')
    }
  } catch (error) {
    toast({
      title: "Failed to create harvest",
      description: error.message,
      variant: "destructive"
    })
  }
}
```

### **2. View Harvests**
```typescript
// Frontend: client/components/harvests/harvest-list.tsx
const fetchHarvests = async () => {
  try {
    setLoading(true)
    const response = await apiService.getHarvests({
      page: currentPage,
      limit: itemsPerPage,
      cropType: filters.cropType,
      status: filters.status
    })
    
    if (response.status === 'success') {
      setHarvests(response.data.harvests || [])
      setTotalPages(response.data.pagination?.pages || 1)
    }
  } catch (error) {
    toast({
      title: "Failed to fetch harvests",
      description: error.message,
      variant: "destructive"
    })
  } finally {
    setLoading(false)
  }
}
```

### **3. Backend Harvest Endpoints**
```javascript
// Backend: backend/routes/harvest.routes.js
router.post('/', authenticate, ctrl.createHarvest)
router.get('/', authenticate, ctrl.getHarvests)
router.get('/:batchId', authenticate, ctrl.getProvenance)
router.delete('/:id', authenticate, ctrl.deleteHarvest)
```

---

## 🛒 **MARKETPLACE INTEGRATION**

### **1. Create Listing from Harvest**
```typescript
// Frontend: client/components/marketplace/create-listing.tsx
const handleCreateListing = async (data: ListingFormData) => {
  try {
    const listingData = {
      harvest: harvestId,
      price: data.price,
      quantity: data.quantity,
      description: data.description,
      images: data.images
    }
    
    const response = await apiService.createListing(listingData)
    
    if (response.status === 'success') {
      toast({
        title: "Listing created successfully",
        description: "Your harvest is now available in the marketplace."
      })
      router.push('/dashboard/marketplace')
    }
  } catch (error) {
    toast({
      title: "Failed to create listing",
      description: error.message,
      variant: "destructive"
    })
  }
}
```

### **2. View Marketplace Listings**
```typescript
// Frontend: client/components/marketplace/marketplace-list.tsx
const fetchListings = async () => {
  try {
    setLoading(true)
    const response = await apiService.getListings({
      page: currentPage,
      limit: itemsPerPage,
      category: filters.category,
      location: filters.location,
      priceRange: filters.priceRange
    })
    
    if (response.status === 'success') {
      setListings(response.data.listings || [])
      setTotalPages(response.data.pagination?.pages || 1)
    }
  } catch (error) {
    toast({
      title: "Failed to fetch listings",
      description: error.message,
      variant: "destructive"
    })
  } finally {
    setLoading(false)
  }
}
```

---

## 📱 **QR CODE SYSTEM**

### **1. Generate QR Code for Harvest**
```typescript
// Frontend: client/components/qr-codes/qr-generator.tsx
const generateQRCode = async (harvestId: string) => {
  try {
    const response = await apiService.getHarvestProvenance(harvestId)
    
    if (response.status === 'success') {
      const harvest = response.data.provenance
      const qrData = {
        batchId: harvest.batchId,
        cropType: harvest.cropType,
        harvestDate: harvest.date,
        farmer: harvest.farmer,
        location: harvest.location
      }
      
      const qrCode = await QRCode.toDataURL(JSON.stringify(qrData))
      setQrCodeUrl(qrCode)
    }
  } catch (error) {
    toast({
      title: "Failed to generate QR code",
      description: error.message,
      variant: "destructive"
    })
  }
}
```

### **2. QR Code Verification**
```javascript
// Backend: backend/routes/verify.routes.js
router.get('/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params
    const harvest = await Harvest.findOne({ batchId })
    
    if (!harvest) {
      return res.status(404).json({
        status: 'error',
        message: 'Harvest not found'
      })
    }
    
    const verificationData = {
      verified: true,
      batchId: harvest.batchId,
      cropType: harvest.cropType,
      harvestDate: harvest.date,
      quantity: harvest.quantity,
      unit: harvest.unit,
      quality: harvest.quality,
      location: harvest.location,
      farmer: harvest.farmer,
      status: harvest.status,
      verifiedAt: new Date()
    }
    
    return res.json({ status: 'success', data: verificationData })
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Verification failed'
    })
  }
})
```

---

## 💰 **FINANCIAL SERVICES**

### **1. Credit Score**
```typescript
// Frontend: client/components/finance/credit-score.tsx
const fetchCreditScore = async () => {
  try {
    const response = await apiService.getMyCreditScore()
    
    if (response.status === 'success') {
      setCreditScore(response.data)
    }
  } catch (error) {
    toast({
      title: "Failed to fetch credit score",
      description: error.message,
      variant: "destructive"
    })
  }
}
```

### **2. Loan Applications**
```typescript
// Frontend: client/components/finance/loan-application.tsx
const handleLoanApplication = async (data: LoanFormData) => {
  try {
    const loanData = {
      amount: data.amount,
      purpose: data.purpose,
      term: data.term,
      description: data.description
    }
    
    const response = await apiService.createLoanApplication(loanData)
    
    if (response.status === 'success') {
      toast({
        title: "Loan application submitted",
        description: "We'll review your application and get back to you soon."
      })
      router.push('/dashboard/finance')
    }
  } catch (error) {
    toast({
      title: "Failed to submit loan application",
      description: error.message,
      variant: "destructive"
    })
  }
}
```

---

## 🧪 **TESTING & VALIDATION**

### **1. Backend Testing**
```bash
# Test backend endpoints
cd backend
npm run test:endpoints

# Test specific endpoints
node test-individual-endpoints.js

# Health check
curl http://localhost:5000/api/health
```

### **2. Frontend Testing**
```bash
# Test frontend
cd client
npm run dev

# Open browser and test:
# 1. Registration flow
# 2. Login flow
# 3. Dashboard loading
# 4. Harvest creation
# 5. Marketplace listing
```

### **3. Integration Testing**
```typescript
// Test API connectivity
const testAPI = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/health')
    const data = await response.json()
    console.log('API Status:', data)
    return data.status === 'success'
  } catch (error) {
    console.error('API Test Failed:', error)
    return false
  }
}
```

---

## 🚨 **COMMON ISSUES & FIXES**

### **1. CORS Errors**
```javascript
// Backend: backend/app.js
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}))
```

### **2. Authentication Token Issues**
```typescript
// Frontend: Check token storage
const token = localStorage.getItem('grochain_auth_token')
if (!token) {
  router.push('/login')
}
```

### **3. API Response Format Mismatch**
```typescript
// Ensure backend returns consistent format
{
  status: 'success' | 'error',
  data: any,
  message?: string
}
```

### **4. Database Connection Issues**
```javascript
// Backend: Check MongoDB connection
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err)
})
```

---

## 🚀 **NEXT STEPS**

1. **Complete Farmer Role Integration**
   - Test all endpoints
   - Validate data flow
   - Fix any remaining issues

2. **Move to Partner Role Integration**
   - Partner dashboard
   - Farmer management
   - Commission tracking

3. **Implement Buyer Role Integration**
   - Marketplace browsing
   - Order management
   - Payment processing

4. **Admin Role Integration**
   - User management
   - System analytics
   - Content moderation

---

## 📞 **SUPPORT**

For integration issues:
1. Check browser console for errors
2. Verify backend server is running
3. Check environment variables
4. Validate API endpoints
5. Review database connections

**Happy Coding! 🚀**
