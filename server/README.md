# GroChain Backend

A production-ready MERN-stack backend for GroChain - Digital Trust Platform for Nigeria's Agriculture.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Partner Management**: Bulk onboarding, referral tracking, commission management
- **Supply Chain Tracking**: Harvest logging, QR codes, shipment tracking
- **Marketplace**: Product listings, orders, payments via Paystack
- **Fintech Integration**: Credit scoring, loan referrals
- **Analytics**: System overview and partner-specific metrics
- **Notifications**: SMS, email, USSD support
- **API Documentation**: Interactive Swagger UI
- **Testing**: Comprehensive test suite with Jest
- **Docker Support**: Containerized deployment
- **Security**: Rate limiting, input validation, CORS protection

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens
- **Validation**: Joi schema validation
- **Logging**: Pino structured logging
- **Testing**: Jest + Supertest
- **Documentation**: Swagger/OpenAPI 3.0
- **Containerization**: Docker + Docker Compose

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- Docker (optional)

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd server
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Database Setup

```bash
# Start MongoDB (if using local)
mongod

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

### 4. Seed Database (Optional)

```bash
npm run seed
```

### 5. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:5000/api/docs`
- **Health Check**: `http://localhost:5000/health`

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run integration tests only
npm run test:integration

# Check test coverage
npm test -- --coverage
```

## 🐳 Docker Deployment

### Development with Docker Compose

```bash
# Start all services (MongoDB + Backend)
npm run docker:compose

# Stop services
npm run docker:compose:down
```

### Production Build

```bash
# Build production image
npm run docker:build

# Run production container
npm run docker:run
```

## 📁 Project Structure

```
server/
├── src/
│   ├── controllers/     # Route handlers
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routes
│   ├── services/       # Business logic
│   ├── middlewares/    # Custom middleware
│   ├── utils/          # Helper functions
│   ├── index.ts        # App entry point
│   └── swagger.ts      # API documentation
├── tests/              # Test files
├── scripts/            # Database seeding
├── Dockerfile          # Production container
├── docker-compose.yml  # Development services
└── package.json        # Dependencies & scripts
```

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/grochain` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_REFRESH_SECRET` | JWT refresh secret | Required |
| `PAYSTACK_SECRET_KEY` | Paystack API secret | Required |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Required |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:3000` |

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/protected` - Protected route example

### Partners
- `POST /api/partners/bulk-onboard` - Bulk farmer onboarding
- `GET /api/partners/:id/metrics` - Partner analytics

### Harvests
- `POST /api/harvests` - Create harvest record
- `GET /api/harvests/:batchId` - Get harvest provenance

### Marketplace
- `GET /api/marketplace/listings` - Get product listings
- `POST /api/marketplace/listings` - Create listing
- `POST /api/marketplace/orders` - Create order
- `PUT /api/marketplace/orders/:id/status` - Update order status

### Payments
- `POST /api/payments/initialize` - Initialize Paystack payment
- `POST /api/payments/verify` - Verify payment webhook

### Analytics
- `GET /api/analytics/overview` - System overview
- `GET /api/analytics/partner/:partnerId` - Partner analytics

### Notifications
- `POST /api/notifications/send` - Send notification
- `GET /api/notifications/:userId` - Get user notifications

## 🚀 Production Deployment

### 1. Environment Setup
```bash
# Set production environment variables
export NODE_ENV=production
export MONGODB_URI=mongodb+srv://...
export JWT_SECRET=your-super-secret-key
```

### 2. Build and Deploy
```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### 3. Docker Production
```bash
# Build production image
docker build -t grochain-backend .

# Run with environment variables
docker run -d \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e MONGODB_URI=... \
  grochain-backend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the API documentation at `/api/docs`
- Review the test files for usage examples
- Open an issue for bugs or feature requests
