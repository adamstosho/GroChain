# GroChain Frontend Development Prompt for v0.dev

## Project Overview
Build a comprehensive, beautiful, and highly functional agricultural supply chain management frontend application called "GroChain" that connects farmers, partners, buyers, and administrators. The app should be visually stunning, user-friendly, and integrate seamlessly with all backend APIs.

## Core Requirements

### 1. Technology Stack
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: Shadcn/ui components with custom styling
- **State Management**: Zustand for global state
- **Authentication**: NextAuth.js with JWT
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React icons
- **Charts**: Recharts for analytics
- **QR Code**: react-qr-code for QR generation/scanning
- **Maps**: Leaflet for geolocation features
- **Notifications**: React-hot-toast for user feedback

### 2. Design System & Visual Identity

#### Color Palette
- **Primary**: Deep Green (#1B5E20) - representing agriculture and growth
- **Secondary**: Golden Yellow (#FFD700) - representing harvest and prosperity
- **Accent**: Earth Brown (#8B4513) - representing soil and foundation
- **Success**: Emerald Green (#10B981)
- **Warning**: Amber (#F59E0B)
- **Error**: Red (#EF4444)
- **Neutral**: Slate Gray (#64748B)

#### Typography
- **Headings**: Inter (Bold, Semi-bold)
- **Body**: Inter (Regular, Medium)
- **Display**: Playfair Display (for hero sections)

#### Design Principles
- **Modern & Clean**: Minimalist design with ample white space
- **Agricultural Theme**: Subtle farming/agriculture imagery and patterns
- **Responsive**: Mobile-first design approach
- **Accessible**: WCAG 2.1 AA compliance
- **Smooth Animations**: Micro-interactions and page transitions
- **Glass Morphism**: Subtle glass effects for cards and modals

### 3. Landing Page (Public Access)

#### Hero Section
- **Animated Background**: Subtle moving agricultural patterns
- **Headline**: "Connecting Farmers to the Future of Agriculture"
- **Subheadline**: "Digital supply chain management for sustainable farming"
- **CTA Buttons**: "Explore Marketplace", "Join as Farmer", "Partner with Us"
- **Visual Elements**: Animated farming illustrations

#### Features Section
- **Harvest Traceability**: QR code scanning demo
- **Digital Marketplace**: Live product showcase
- **Financial Services**: Credit and insurance highlights
- **Weather Insights**: Real-time weather widget
- **Partner Network**: Success stories and testimonials

#### Live Marketplace Preview
- **Product Grid**: Display featured products with images
- **Search & Filter**: Basic search functionality (no login required)
- **Product Cards**: Beautiful cards with hover effects
- **QR Verification Demo**: Interactive QR code scanner
- **Call-to-Action**: "Login to Purchase" buttons

#### Navigation
- **Header**: Logo, navigation links, "Login/Register" buttons
- **Footer**: Links, social media, contact information
- **Mobile Menu**: Hamburger menu with smooth animations

### 4. Authentication System

#### Login Page
- **Clean Design**: Minimalist form with agricultural background
- **Form Fields**: Email, Password, Remember Me
- **Social Login**: Google OAuth integration
- **Forgot Password**: Link to password reset
- **Register Link**: Direct to registration page

#### Registration Page
- **Multi-step Form**: 
  1. Basic Information (Name, Email, Phone)
  2. Role Selection (Farmer, Buyer, Partner)
  3. Password Creation
  4. Email Verification
- **Role-specific Fields**: Different fields based on selected role
- **Progress Indicator**: Visual progress bar
- **Validation**: Real-time form validation

#### Password Reset
- **Email Input**: Clean form design
- **Reset Link**: Email-based reset flow
- **New Password**: Secure password creation

### 5. Dashboard System (Role-Based)

#### Common Dashboard Elements
- **Sidebar Navigation**: Role-specific menu items
- **Header**: User profile, notifications, logout
- **Breadcrumbs**: Navigation context
- **Quick Actions**: Role-specific shortcuts
- **Recent Activity**: Timeline of recent actions

#### Farmer Dashboard
- **Overview Cards**:
  - Total Harvests
  - Pending Approvals
  - Active Listings
  - Revenue This Month
- **Harvest Management**:
  - Create New Harvest form
  - Harvest list with status indicators
  - QR code generation
  - Image upload functionality
- **Marketplace**:
  - My Listings
  - Sales Analytics
  - Order Management
- **Financial Services**:
  - Credit Score display
  - Loan Applications
  - Insurance Policies
- **Weather Widget**: Local weather with farming recommendations

#### Buyer Dashboard
- **Overview Cards**:
  - Total Orders
  - Favorites
  - Recent Purchases
  - Spending Analytics
- **Marketplace**:
  - Product browsing with advanced filters
  - Search functionality
  - Favorites management
  - Shopping cart
- **Orders**:
  - Order history
  - Order tracking
  - Order details with QR verification
- **Profile Management**:
  - Personal information
  - Delivery addresses
  - Payment methods

#### Partner Dashboard
- **Overview Cards**:
  - Total Farmers
  - Pending Approvals
  - Commission Earned
  - Active Partnerships
- **Farmer Management**:
  - Farmer list with search/filter
  - Bulk onboarding interface
  - CSV upload functionality
  - Individual farmer profiles
- **Harvest Approval**:
  - Pending harvests queue
  - Approval/rejection interface
  - Quality assessment forms
- **Analytics**:
  - Performance metrics
  - Commission tracking
  - Regional insights

#### Admin Dashboard
- **Overview Cards**:
  - Total Users
  - Platform Revenue
  - Active Transactions
  - System Health
- **User Management**:
  - User list with advanced filters
  - User details and editing
  - Role management
  - Account suspension/reactivation
- **Analytics**:
  - Platform-wide metrics
  - User behavior analytics
  - Financial reports
  - Export functionality
- **System Settings**:
  - Platform configuration
  - Commission rates
  - Feature toggles

### 6. Marketplace Features

#### Product Browsing
- **Grid Layout**: Responsive product grid
- **Advanced Filters**:
  - Category (Grains, Tubers, Vegetables, etc.)
  - Price range
  - Location
  - Quality grade
  - Organic certification
- **Search**: Full-text search with suggestions
- **Sorting**: Price, date, popularity, rating
- **Product Cards**: 
  - High-quality images
  - Price and quantity
  - Farmer information
  - Quality indicators
  - Quick add to favorites

#### Product Details
- **Image Gallery**: Multiple product images
- **Product Information**:
  - Detailed description
  - Nutritional information
  - Farming practices
  - Certifications
- **Farmer Profile**: Seller information and rating
- **QR Code**: Product traceability QR
- **Purchase Options**: Quantity selector, add to cart
- **Related Products**: Similar items

#### Shopping Cart
- **Cart Sidebar**: Slide-out cart panel
- **Item Management**: Quantity adjustment, removal
- **Price Calculation**: Subtotal, taxes, shipping
- **Checkout Process**: Multi-step checkout flow

#### Order Management
- **Order History**: Complete order timeline
- **Order Tracking**: Real-time delivery status
- **Order Details**: Comprehensive order information
- **QR Verification**: Product authenticity verification

### 7. Harvest Management

#### Create Harvest
- **Multi-step Form**:
  1. Basic Information (Crop type, quantity, date)
  2. Location (GPS coordinates, address)
  3. Quality Assessment (Images, description)
  4. Review and Submit
- **Image Upload**: Drag-and-drop with preview
- **Location Picker**: Interactive map integration
- **Validation**: Real-time form validation

#### Harvest List
- **Status Indicators**: Visual status badges
- **Filtering**: By status, date, crop type
- **Actions**: Edit, view details, generate QR
- **Bulk Actions**: Select multiple harvests

#### Harvest Details
- **Complete Information**: All harvest data
- **QR Code**: Generated QR for traceability
- **Status Timeline**: Approval process tracking
- **Quality Assessment**: Partner feedback
- **Images**: Harvest photo gallery

### 8. QR Code System

#### QR Generation
- **Batch QR Codes**: Unique codes for harvest batches
- **Product QR Codes**: Individual product tracking
- **Download Options**: PNG, SVG, PDF formats
- **Print Integration**: Direct printing functionality

#### QR Scanning
- **Camera Integration**: Mobile camera access
- **File Upload**: Upload QR code images
- **Verification Results**: Detailed product information
- **Public Verification**: No login required

### 9. Analytics & Reporting

#### Dashboard Analytics
- **Charts & Graphs**: 
  - Revenue trends
  - Sales analytics
  - User growth
  - Regional performance
- **Interactive Elements**: Hover effects, drill-down capabilities
- **Export Options**: PDF, CSV, Excel formats
- **Real-time Updates**: Live data refresh

#### Custom Reports
- **Report Builder**: Drag-and-drop report creation
- **Date Range Selection**: Flexible time periods
- **Filter Options**: Multiple filter criteria
- **Scheduled Reports**: Automated report generation

### 10. Notification System

#### Notification Center
- **Real-time Notifications**: WebSocket integration
- **Notification Types**: 
  - Order updates
  - Payment confirmations
  - Harvest approvals
  - Weather alerts
- **Mark as Read**: Bulk read/unread actions
- **Settings**: Notification preferences

#### Push Notifications
- **Browser Notifications**: Desktop push notifications
- **Mobile Integration**: PWA push notifications
- **Permission Management**: User consent handling

### 11. Weather Integration

#### Weather Widget
- **Current Weather**: Real-time weather display
- **Forecast**: 7-day weather prediction
- **Agricultural Insights**: Farming recommendations
- **Alerts**: Weather warnings and notifications

#### Weather Dashboard
- **Historical Data**: Past weather patterns
- **Regional Analysis**: Location-based insights
- **Crop Recommendations**: Weather-based farming advice

### 12. Financial Services

#### Credit Score Display
- **Visual Score**: Circular progress indicator
- **Score Breakdown**: Factors affecting score
- **Improvement Tips**: Recommendations for better score
- **History**: Score changes over time

#### Loan Management
- **Loan Applications**: Application forms
- **Application Status**: Real-time status tracking
- **Loan History**: Past and current loans
- **Payment Schedule**: Repayment tracking

#### Insurance Services
- **Policy Management**: Active policies display
- **Quote Requests**: Insurance quote forms
- **Claims Processing**: Claim submission and tracking

### 13. User Experience Features

#### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Responsive tablet layouts
- **Desktop Experience**: Enhanced desktop features
- **Touch-Friendly**: Mobile gesture support

#### Accessibility
- **WCAG 2.1 AA**: Full accessibility compliance
- **Keyboard Navigation**: Complete keyboard support
- **Screen Reader**: ARIA labels and descriptions
- **Color Contrast**: High contrast ratios
- **Font Scaling**: Responsive typography

#### Performance
- **Fast Loading**: Optimized bundle sizes
- **Lazy Loading**: Image and component lazy loading
- **Caching**: Intelligent caching strategies
- **Progressive Enhancement**: Graceful degradation

#### Error Handling
- **User-Friendly Errors**: Clear error messages
- **Error Boundaries**: React error boundaries
- **Offline Support**: Service worker for offline functionality
- **Retry Mechanisms**: Automatic retry for failed requests

### 14. Animation & Interactions

#### Page Transitions
- **Smooth Navigation**: Framer Motion page transitions
- **Loading States**: Skeleton screens and spinners
- **Micro-interactions**: Button hover effects, form feedback

#### Component Animations
- **Entrance Animations**: Staggered component loading
- **Hover Effects**: Interactive element animations
- **Success/Error States**: Animated feedback messages

### 15. Integration Requirements

#### API Integration
- **Authentication**: JWT token management
- **Request Handling**: Axios with interceptors
- **Error Handling**: Centralized error management
- **Loading States**: Global loading indicators

#### Real-time Features
- **WebSocket Connection**: Socket.io client integration
- **Live Updates**: Real-time data synchronization
- **Notifications**: Instant notification delivery

#### External Services
- **Payment Gateway**: Paystack integration
- **SMS Services**: Twilio integration
- **Email Services**: SendGrid integration
- **Cloud Storage**: Cloudinary integration

### 16. Security Features

#### Authentication Security
- **Token Management**: Secure token storage
- **Session Handling**: Proper session management
- **Route Protection**: Role-based route guards
- **Logout**: Secure logout functionality

#### Data Security
- **Input Validation**: Client-side validation
- **XSS Protection**: Content sanitization
- **CSRF Protection**: Cross-site request forgery prevention

### 17. Testing & Quality Assurance

#### Testing Strategy
- **Unit Tests**: Component testing
- **Integration Tests**: API integration testing
- **E2E Tests**: Complete user flow testing
- **Accessibility Tests**: Automated accessibility testing

#### Code Quality
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Git Hooks**: Pre-commit quality checks

### 18. Deployment & Performance

#### Build Optimization
- **Code Splitting**: Route-based code splitting
- **Bundle Analysis**: Webpack bundle analyzer
- **Image Optimization**: Next.js image optimization
- **CDN Integration**: Content delivery network

#### Monitoring
- **Error Tracking**: Sentry integration
- **Performance Monitoring**: Core Web Vitals tracking
- **Analytics**: User behavior analytics

## Implementation Guidelines

### 1. Project Structure
```
src/
├── app/                    # Next.js app router
├── components/             # Reusable components
│   ├── ui/                # Shadcn/ui components
│   ├── forms/             # Form components
│   ├── charts/            # Chart components
│   └── layout/            # Layout components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── stores/                # Zustand stores
├── types/                 # TypeScript types
└── styles/                # Global styles
```

### 2. Component Architecture
- **Atomic Design**: Atoms, molecules, organisms, templates, pages
- **Composition**: Component composition over inheritance
- **Props Interface**: Strict TypeScript interfaces
- **Default Props**: Sensible default values

### 3. State Management
- **Global State**: Zustand for app-wide state
- **Local State**: React useState for component state
- **Server State**: React Query for API state
- **Form State**: React Hook Form for form management

### 4. API Integration
- **Service Layer**: Centralized API service functions
- **Error Handling**: Consistent error handling patterns
- **Loading States**: Global and local loading indicators
- **Caching**: Intelligent data caching strategies

### 5. Performance Optimization
- **Code Splitting**: Route-based and component-based splitting
- **Lazy Loading**: Images, components, and routes
- **Memoization**: React.memo and useMemo for expensive operations
- **Virtualization**: For large lists and tables

## Success Criteria

### 1. User Experience
- **Intuitive Navigation**: Users can easily find what they need
- **Fast Performance**: Page load times under 3 seconds
- **Mobile Responsive**: Perfect experience on all devices
- **Accessibility**: Full WCAG 2.1 AA compliance

### 2. Functionality
- **Complete Integration**: All backend APIs properly integrated
- **Role-Based Access**: Proper permissions and access control
- **Real-time Features**: Live updates and notifications
- **Error-Free Operation**: No critical bugs or errors

### 3. Visual Design
- **Beautiful Interface**: Modern, clean, and professional design
- **Consistent Branding**: Cohesive visual identity throughout
- **Smooth Animations**: Engaging but not distracting animations
- **High-Quality Assets**: Professional images and icons

### 4. Technical Excellence
- **Clean Code**: Well-structured and maintainable code
- **Type Safety**: Comprehensive TypeScript implementation
- **Performance**: Optimized for speed and efficiency
- **Scalability**: Architecture supports future growth

## Final Notes

This frontend application should be a showcase of modern web development best practices, combining beautiful design with powerful functionality. The focus should be on creating an exceptional user experience that makes agricultural supply chain management accessible, efficient, and enjoyable for all stakeholders.

The application should feel premium and professional while maintaining the warmth and approachability needed for the agricultural community. Every interaction should be smooth, every feature should work flawlessly, and every user should feel empowered to achieve their goals within the platform.

Remember: This is not just a web application - it's a digital transformation tool for the agricultural sector. The success of this platform will directly impact the livelihoods of farmers and the efficiency of agricultural supply chains. Every detail matters.
