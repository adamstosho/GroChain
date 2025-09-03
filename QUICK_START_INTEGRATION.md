# 🚀 **GROCHAIN QUICK START INTEGRATION GUIDE**
## Get Your Frontend and Backend Running in 5 Minutes!

---

## ⚡ **IMMEDIATE SETUP STEPS**

### **Step 1: Backend Setup**
```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already done)
npm install

# Copy environment template
copy env.template .env

# Edit .env file with your actual values
# At minimum, set:
# - MONGODB_URI (your MongoDB connection string)
# - JWT_SECRET (any random string for development)
# - CORS_ORIGIN=http://localhost:3000

# Start backend server
npm run dev
```

### **Step 2: Frontend Setup**
```bash
# Open new terminal, navigate to client directory
cd client

# Install dependencies (if not already done)
npm install

# Copy environment template
copy env.template .env.local

# Edit .env.local file:
# - NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
# - NEXT_PUBLIC_WS_URL=ws://localhost:5000

# Start frontend development server
npm run dev
```

### **Step 3: Test Integration**
```bash
# Backend should be running on: http://localhost:5000
# Frontend should be running on: http://localhost:3000

# Test backend health:
curl http://localhost:5000/api/health

# Open browser and go to: http://localhost:3000
```

---

## 🔧 **MINIMAL ENVIRONMENT SETUP**

### **Backend (.env) - Minimum Required**
```bash
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/grochain
JWT_SECRET=dev-secret-key-change-in-production
```

### **Frontend (.env.local) - Minimum Required**
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=ws://localhost:5000
```

---

## 🧪 **QUICK TESTING**

### **1. Test Backend Health**
```bash
curl http://localhost:5000/api/health
# Expected: {"status":"success","message":"GroChain Backend is running"}
```

### **2. Test Frontend API Connection**
```typescript
// Open browser console on http://localhost:3000
fetch('http://localhost:5000/api/health')
  .then(res => res.json())
  .then(data => console.log('API Status:', data))
  .catch(err => console.error('API Error:', err))
```

### **3. Test Farmer Registration Flow**
1. Go to http://localhost:3000/register
2. Fill out farmer registration form
3. Submit and check backend logs
4. Verify email verification flow

---

## 🚨 **COMMON QUICK FIXES**

### **CORS Error?**
```javascript
// Backend: Ensure CORS is properly configured
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}))
```

### **Database Connection Failed?**
```bash
# Check if MongoDB is running
# For local MongoDB:
mongod

# For MongoDB Atlas, verify connection string
# Format: mongodb+srv://username:password@cluster.mongodb.net/grochain
```

### **Port Already in Use?**
```bash
# Kill process on port 5000
npx kill-port 5000

# Or change port in .env
PORT=5001
```

### **Frontend Build Errors?**
```bash
# Clear Next.js cache
cd client
rm -rf .next
npm run dev
```

---

## 📱 **TESTING THE FARMER DASHBOARD**

### **1. Complete Registration Flow**
- Register as farmer
- Verify email (or bypass in development)
- Login with credentials

### **2. Test Dashboard Loading**
- Dashboard should load with stats
- Check browser console for API calls
- Verify data is displayed correctly

### **3. Test Harvest Creation**
- Click "Add New Harvest"
- Fill out harvest form
- Submit and verify backend receives data

### **4. Test API Endpoints**
```bash
# Test harvest creation
curl -X POST http://localhost:5000/api/harvests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"cropType":"corn","quantity":100,"date":"2024-01-01","geoLocation":{"lat":6.5244,"lng":3.3792},"unit":"kg","location":"Lagos"}'
```

---

## 🔍 **DEBUGGING TIPS**

### **Backend Logs**
```bash
# Watch backend logs
cd backend
npm run dev

# Look for:
# ✅ MongoDB connected successfully
# ✅ Application initialized successfully
# ✅ GroChain Backend server listening on port 5000
```

### **Frontend Console**
```typescript
// Check for API errors in browser console
// Look for:
// - Network errors
// - CORS errors
// - Authentication errors
// - API response format issues
```

### **Database Check**
```bash
# Connect to MongoDB and check collections
mongosh
use grochain
show collections
db.users.find().limit(1)
db.harvests.find().limit(1)
```

---

## 🎯 **SUCCESS INDICATORS**

✅ **Backend running on port 5000**  
✅ **Frontend running on port 3000**  
✅ **API health check returns success**  
✅ **Farmer registration creates user in database**  
✅ **Dashboard loads with real data**  
✅ **Harvest creation works end-to-end**  
✅ **No CORS errors in browser console**  

---

## 🚀 **NEXT STEPS AFTER QUICK START**

1. **Complete Farmer Role Testing**
   - Test all dashboard features
   - Verify harvest management
   - Test marketplace integration

2. **Move to Other Roles**
   - Partner role integration
   - Buyer role integration
   - Admin role integration

3. **Production Preparation**
   - Set up proper environment variables
   - Configure production database
   - Set up monitoring and logging

---

## 📞 **NEED HELP?**

**Quick Issues:**
- Check this guide first
- Verify environment variables
- Check console logs

**Integration Issues:**
- Review FARMER_ROLE_INTEGRATION_GUIDE.md
- Check API endpoint documentation
- Verify data flow between frontend/backend

**Happy Coding! 🚀**

