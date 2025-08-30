# 🧪 GroChain Backend Testing - Quick Reference

## 🚀 Quick Start Commands

```bash
# 1. Health Check (ALWAYS START HERE)
npm run test:health

# 2. Quick Test (Public endpoints)
npm run test:quick

# 3. Full Test (All endpoints)
npm run test:endpoints

# 4. Individual Test (Specific categories)
npm run test:individual
```

## 📁 Test Scripts

| Script | Purpose | Command |
|--------|---------|---------|
| `test-health-check.js` | Verify backend is running | `npm run test:health` |
| `test-individual-endpoints.js` | Test specific categories | `npm run test:individual` |
| `test-all-endpoints.js` | Test ALL endpoints | `npm run test:endpoints` |
| `test-example.js` | Manual testing examples | `node test-example.js` |

## 🎯 Windows Users

```bash
# Batch file (Command Prompt)
test-endpoints.bat

# PowerShell script
.\test-endpoints.ps1
```

## ⚙️ Configuration

### Environment Variables
```bash
# Base URL (default: http://localhost:5000/api)
BASE_URL=http://localhost:3000/api

# JWT token for authenticated testing
AUTH_TOKEN=your_jwt_token_here
```

### Command Line Options
```bash
# Custom base URL
--base-url http://localhost:3000/api

# Help
--help or -h
```

## 📊 What Gets Tested

### 🔐 Authentication
- Registration, login, password reset
- SMS OTP, email verification
- Token refresh

### 👥 User Management
- Profile, preferences, settings
- Admin operations, bulk actions

### 🤝 Partners
- CRUD operations, dashboard
- Farmer onboarding, CSV upload

### 🛒 Marketplace
- Listings, search, favorites
- Orders, image uploads

### 🌾 Harvests
- Creation, tracking, verification
- Provenance, approval workflows

### 💰 Fintech
- Credit scoring, loans
- Insurance, financial health

### 📊 Analytics
- Dashboard, transactions
- Impact, regional, predictive

### 📤📥 Export/Import
- Data export/import
- Templates, validation

### 🔔 Other Services
- Notifications, payments
- QR codes, referrals, shipments

## 🚨 Troubleshooting

### Common Issues
1. **Backend not running** → Start with `npm run dev`
2. **Connection refused** → Check port and firewall
3. **Authentication required** → Set `AUTH_TOKEN` environment variable
4. **Endpoint not found** → Check route configuration

### Debug Steps
1. Run health check first
2. Check backend console logs
3. Verify environment variables
4. Test manually with examples

## 📈 Test Results

- **✅ PASS**: Endpoint working (2xx status)
- **🔒 AUTH**: Requires authentication (401 status)
- **❌ FAIL**: Endpoint error (4xx/5xx status)
- **🔌 ERROR**: Connection/network issue

## 🔄 Development Workflow

```bash
# 1. Start backend
npm run dev

# 2. Test health (new terminal)
npm run test:health

# 3. Test endpoints
npm run test:quick

# 4. After changes
npm run test:endpoints
```

## 📚 More Information

- **Full Guide**: See `TESTING.md` for detailed instructions
- **Examples**: Check `test-example.js` for manual testing
- **Backend Docs**: Review main `README.md`

---

**Happy Testing! 🎉**
