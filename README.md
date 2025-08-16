## GroChain Frontend (Next.js + TypeScript + Tailwind + Framer Motion + PWA)

This document is the single source of truth for building the GroChain frontend. It details project setup, architecture, offline-first PWA strategy, typed API integration, real-time updates, internationalization, role-based routing, design system, testing, and a complete mapping of backend endpoints to pages and components.

### Tech Stack
- **Framework**: Next.js (App Router, React Server Components by default)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS (with custom theme tokens)
- **Animations**: Framer Motion
- **State/Data**: RSC + `fetch` for SSR/ISR; TanStack Query for client-side caching where needed
- **Forms**: React Hook Form + Zod (schema validation on the client)
- **HTTP**: Native `fetch` in RSC; `ky` for client-side requests with typed wrappers
- **PWA**: next-pwa (Workbox) + custom service worker (offline-first + background sync)
- **Storage**: IndexedDB via `idb` for offline cache and request queue
- **Real-time**: Socket.IO client
- **i18n**: next-intl (backed by `/api/languages` endpoints)
- **Component Library**: Headless UI + Radix Primitives (optional) with Tailwind

## 1) Project Setup

### 1.1 Create App
```bash
# from repo root
cd client
npm create next-app@latest . -- --ts --eslint --src-dir --import-alias "@/*" --app
```

### 1.2 Install Dependencies
```bash
# UI & animations
npm i tailwindcss postcss autoprefixer framer-motion @radix-ui/react-icons @headlessui/react

# Data & forms
npm i @tanstack/react-query react-hook-form zod ky idb

# PWA & real-time
npm i next-pwa workbox-window socket.io-client

# i18n
npm i next-intl

# Types/dev
npm i -D @types/node @types/react @types/react-dom @types/socket.io-client
```

### 1.3 Tailwind Init
```bash
npx tailwindcss init -p
```
Update `tailwind.config.js` content paths to include the App Router:
```js
content: [
  "./app/**/*.{js,ts,jsx,tsx}",
  "./components/**/*.{js,ts,jsx,tsx}",
]
```

### 1.4 Environment Variables
Create `client/.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=http://localhost:5000
NEXT_PUBLIC_ENABLE_PWA=true
```

### 1.5 next.config and PWA
Enable PWA only in production-like builds to avoid dev complexity:
```js
// next.config.mjs
import withPWA from 'next-pwa'

const isProd = process.env.NODE_ENV === 'production'

export default withPWA({
  dest: 'public',
  disable: !isProd && process.env.NEXT_PUBLIC_ENABLE_PWA !== 'true',
  runtimeCaching: [], // we will rely on custom service worker below
  register: true,
  skipWaiting: true,
})({
  reactStrictMode: true,
  experimental: { serverActions: { bodySizeLimit: '2mb' } },
})
```

### 1.6 File/Folder Structure
```
client/
  app/
    (public)/
      login/page.tsx
      register/page.tsx
      reset-password/page.tsx
      verify/[batchId]/page.tsx
      offline/page.tsx
    (dashboard)/
      dashboard/page.tsx
      harvests/page.tsx
      harvests/new/page.tsx
      marketplace/page.tsx
      marketplace/[id]/page.tsx
      orders/page.tsx
      iot/sensors/page.tsx
      ai/page.tsx
      image-recognition/page.tsx
      analytics/page.tsx
      fintech/page.tsx
      commissions/page.tsx
      partners/page.tsx
      notifications/page.tsx
      settings/page.tsx
    layout.tsx
    globals.css
    manifest.ts
  components/
    ui/*
    charts/*
  lib/
    api/
      http.ts
      auth.ts
      marketplace.ts
      harvests.ts
      payments.ts
      notifications.ts
      analytics.ts
      fintech.ts
      partners.ts
      referrals.ts
      verify.ts
      pwa.ts
      sync.ts
      languages.ts
      ai.ts
      iot.ts
      imageRecognition.ts
      advancedML.ts
      weather.ts
      verification.ts
      websocket.ts
    pwa/
      sw-registration.ts
      offline-queue.ts
      storage.ts
    auth/
      session.ts
      rbac.ts
  public/
    icons/*
    images/*
    sw.js (built)
  types/
    api.ts
    domain/*.ts
```

## 2) Architecture & Conventions

- **App Router** with routes in `app/*`. Prefer RSC for data fetching; mark client components with `'use client'` only when interactivity is required.
- **Separation of concerns**:
  - `components/` for UI and presentational components
  - `lib/api/*` for domain API clients with strict TypeScript types
  - `lib/pwa/*` for offline storage, background sync, and SW registration
  - `types/` for shared types and DTOs
- **RBAC**: Gate routes and components by role using server-side checks in layouts or route groups.
- **Error handling**: Normalize API errors with a shared error type and user-friendly toasts.
- **Design system**: Tokens in Tailwind theme; `ui/` primitives composed with Headless/Radix; animations via Framer Motion.

## 3) PWA: Offline-First Strategy

### 3.1 Service Worker and Caching
- Precache app shell, critical pages, and static assets.
- Runtime caching strategies:
  - GET APIs: Stale-While-Revalidate for analytics/weather/marketplace listings.
  - Critical user data (harvests, profile): Cache-First with background revalidation.
  - Images: Cache-First with expiration (e.g., 30 days, 100 entries per route).
  - Fallback to `/(public)/offline` page when offline.

### 3.2 Background Sync for Mutations
- Queue POST/PUT/PATCH/DELETE requests in IndexedDB when offline.
- Replay queue when connectivity returns using Workbox Background Sync.
- Show optimistic UI and reconcile on replay success/failure.

### 3.3 Integration Points
- Fetch manifest/service worker guidance from backend PWA endpoints:
  - `GET /api/pwa/manifest`
  - `GET /api/pwa/service-worker` (reference implementation)
  - `GET /api/pwa/offline` for offline content baseline
  - `GET /api/pwa/install` for install tips (show in `/settings`)

## 4) Authentication & Session

- Endpoints:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/refresh`
  - `POST /api/auth/forgot-password`
  - `POST /api/auth/reset-password`
  - `POST /api/auth/verify-email`
  - `POST /api/auth/send-sms-otp`
  - `POST /api/auth/verify-sms-otp`
  - `GET /api/auth/protected`

- Pattern:
  - Store tokens in httpOnly cookies set by API (recommended); on the client, use short-lived access tokens with automatic refresh.
  - Use a server component `layout.tsx` to fetch user profile and roles; pass down via context.
  - Use Next middleware for protected route groups to redirect unauthenticated users to `(public)/login`.

## 5) API Client Layer (Typed)

### 5.1 HTTP Helper (`lib/api/http.ts`)
- Wrap `fetch` in RSC; use `ky` in client components.
- Add base URL from `NEXT_PUBLIC_API_BASE_URL`.
- Inject `Authorization: Bearer <token>` server-side from cookies.
- Normalize errors to `{ code, message, details }`.

### 5.2 Domain Clients (`lib/api/*.ts`)
- Export named functions per endpoint with strict request/response types.
- Validate inputs with Zod where helpful.
- Cache hints: set `next: { revalidate }` in RSC fetches for dashboards/lists.

## 6) Internationalization

- Use `next-intl` with language packs resolved from backend:
  - `GET /api/languages` (supported list)
  - `GET /api/languages/translations/:language` (all keys)
  - `POST /api/languages/translations` (specific keys)
  - `GET /api/languages/:language` (language info)
  - `PUT /api/languages/preference` (persist user preference)

## 7) Real-time Updates

- Connect Socket.IO to `NEXT_PUBLIC_WS_URL`.
- Rooms:
  - `join-user-room` with userId
  - `join-partner-room` with partnerId
  - `join-farmer-room` with farmerId
- HTTP helpers available:
  - `GET /api/websocket/status`
  - `POST /api/websocket/notify-user`
  - `POST /api/websocket/notify-partner-network`

## 8) Notifications (Web Push readiness)

- Manage preferences via:
  - `GET /api/notifications/preferences`
  - `PUT /api/notifications/preferences`
  - `PUT /api/notifications/push-token` (store device token from SW/FCM if used)
- Event-specific:
  - `POST /api/notifications/transaction`
  - `POST /api/notifications/harvest`
  - `POST /api/notifications/marketplace`

## 9) Feature Pages and Endpoint Mapping

Below is an authoritative map from backend code (`server/src/index.ts` and route files). Use these paths exactly.

### 9.1 Public
- **Health**: `GET /health`
- **QR Verification**: `GET /api/verify/:batchId`
- **PWA**: `GET /api/pwa/manifest`, `GET /api/pwa/service-worker`, `GET /api/pwa/offline`, `GET /api/pwa/install`
- **Weather (public)**: 
  - `GET /api/weather/current`
  - `GET /api/weather/forecast`
  - `GET /api/weather/agricultural-insights`
  - `GET /api/weather/alerts`
  - `GET /api/weather/historical`
  - `GET /api/weather/coordinates/:lat/:lng`
  - `GET /api/weather/statistics/:region`
  - `GET /api/weather/regional-alerts`
  - `GET /api/weather/climate-summary`
- **USSD (public webhooks/info)**: `POST /api/ussd`, `POST /api/ussd/callback`, `GET /api/ussd/info`

### 9.2 Auth & Profile
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/verify-email`
- `POST /api/auth/send-sms-otp`
- `POST /api/auth/verify-sms-otp`
- `GET /api/auth/protected`

### 9.3 Harvests & QR
- `GET /api/harvests` (query filters supported)
- `POST /api/harvests`
- `GET /api/harvests/:batchId`
- `GET /api/harvests/provenance/:batchId`
- `GET /api/harvests/verify/:batchId` (public)

### 9.4 Marketplace & Orders
- `GET /api/marketplace/listings`
- `GET /api/marketplace/search-suggestions`
- `POST /api/marketplace/listings`
- `POST /api/marketplace/orders`
- `PATCH /api/marketplace/orders/:id/status`
- `POST /api/marketplace/upload-image` (multipart)

### 9.5 Payments
- `POST /api/payments/initialize`
- `POST /api/payments/verify` (webhook target; ensure raw body when configuring backend)

### 9.6 Analytics (Admin/Partner)
- GET: `/api/analytics/dashboard`, `/farmers`, `/transactions`, `/harvests`, `/marketplace`, `/fintech`, `/impact`, `/partners`, `/weather`, `/predictive`, `/summary`
- POST: `/api/analytics/report`, `/compare`, `/regional`
- GET Export: `/api/analytics/export`

### 9.7 Fintech
- `GET /api/fintech/credit-score/:farmerId`
- `POST /api/fintech/loan-referrals`

### 9.8 Partners
- `POST /api/partners/bulk-onboard`
- `POST /api/partners/upload-csv`
- `GET /api/partners/:id/metrics`

### 9.9 Referrals
- `POST /api/referrals/:farmerId/complete` (partners/admin)

### 9.10 Commissions (note plural route base)
- `GET /api/commissions/summary`
- `GET /api/commissions/history`
- `POST /api/commissions/withdraw`
- `GET /api/commissions/all` (admin)
- `POST /api/commissions/process-payment` (admin)

### 9.11 AI & Advanced ML
- AI:
  - `POST /api/ai/crop-recommendations`, `POST /api/ai/yield-prediction`, `GET /api/ai/market-insights`, `GET /api/ai/farming-insights`, `GET /api/ai/farming-recommendations`, `GET /api/ai/analytics-dashboard`, `GET /api/ai/seasonal-calendar`, `GET /api/ai/weather-prediction`, `GET /api/ai/market-trends`, `POST /api/ai/risk-assessment`, `POST /api/ai/predictive-insights`
- Advanced ML:
  - `GET /api/advanced-ml/sensors/:sensorId/maintenance`, `GET /api/advanced-ml/sensors/:sensorId/anomalies`, `GET /api/advanced-ml/optimize/irrigation`, `GET /api/advanced-ml/optimize/fertilizer`, `GET /api/advanced-ml/optimize/harvest`, `GET /api/advanced-ml/optimize/report`, `GET /api/advanced-ml/insights/sensor-health`, `GET /api/advanced-ml/insights/efficiency-score`, `GET /api/advanced-ml/insights/predictive`, `GET /api/advanced-ml/models/performance`

### 9.12 Image Recognition
- `POST /api/image-recognition/analyze`
- `GET /api/image-recognition/analyses`
- `GET /api/image-recognition/analyses/:analysisId`
- `GET /api/image-recognition/analyses/crop/:cropType`
- `GET /api/image-recognition/analyses/risk/high`
- `PUT /api/image-recognition/analyses/:analysisId/status`
- `POST /api/image-recognition/analyses/:analysisId/recommendations`
- `DELETE /api/image-recognition/analyses/:analysisId`

### 9.13 IoT
- `POST /api/iot/sensors`
- `GET /api/iot/sensors`
- `GET /api/iot/sensors/:sensorId`
- `PUT /api/iot/sensors/:sensorId/data`
- `GET /api/iot/sensors/:sensorId/readings`
- `GET /api/iot/sensors/:sensorId/alerts`
- `PUT /api/iot/sensors/:sensorId/alerts/:alertIndex/resolve`
- `PUT /api/iot/sensors/:sensorId/status`
- `DELETE /api/iot/sensors/:sensorId`
- `GET /api/iot/sensors/:sensorId/maintenance`
- `GET /api/iot/sensors/:sensorId/anomalies`
- `GET /api/iot/sensors/health/summary`

### 9.14 BVN Verification
- `POST /api/verification/bvn`
- `GET /api/verification/status/:userId`
- `POST /api/verification/bvn/offline` (admin)
- `POST /api/verification/bvn/resend`

### 9.15 USSD (Admin-only ops)
- `POST /api/ussd/test`
- `GET /api/ussd/stats`
- `POST /api/ussd/register`

### 9.16 Notifications
- `POST /api/notifications/send` (admin/partner)
- `POST /api/notifications/send-bulk` (admin)
- `GET /api/notifications/preferences`
- `PUT /api/notifications/preferences`
- `PUT /api/notifications/push-token`
- `POST /api/notifications/transaction`
- `POST /api/notifications/harvest`
- `POST /api/notifications/marketplace`

### 9.17 Sync (Offline Data)
- `POST /api/sync/offline-data`
- `POST /api/sync/sync-user`
- `GET /api/sync/status/:userId`
- `POST /api/sync/force-sync`
- `GET /api/sync/history/:userId`
- `DELETE /api/sync/clear-failed/:userId`
- `GET /api/sync/stats`

### 9.18 Shipments
- `POST /api/shipments` (create shipment)

### 9.19 API Docs
- Swagger UI: `GET /api/docs` (Interactive API reference from backend)

## 10) UI/UX Standards

- **Layout**: Responsive, accessible, mobile-first. Keep core actions within thumb-reach on mobile.
- **Theme**: Tailwind theme with brand colors, spacing, fonts; use CSS vars for dark mode.
- **Motion**: Prefer subtle motions; limit to 150–300ms. Page transitions using Framer Motion layout animations.
- **Empty/Loading/Error states**: Always provide each state with helpful CTAs.

## 11) Example Snippets

### 11.1 Minimal HTTP helper (client-side)
```ts
// lib/api/http.ts
import ky from 'ky'

export const api = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  credentials: 'include',
  hooks: {
    beforeRequest: [
      request => {
        // token is sent via cookie by server ideally; if needed, attach here
      }
    ],
    afterResponse: [
      async (_req, _opt, res) => {
        if (res.status === 401) {
          // trigger refresh flow or redirect to login
        }
      }
    ]
  }
})
```

### 11.2 Background Sync queue
```ts
// lib/pwa/offline-queue.ts
import { openDB } from 'idb'

const DB_NAME = 'grochain-offline'
const STORE = 'mutations'

export async function enqueueMutation(entry: { url: string; method: string; body?: any; headers?: Record<string,string> }) {
  const db = await openDB(DB_NAME, 1, { upgrade(db) { db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true }) } })
  await db.add(STORE, { ...entry, createdAt: Date.now() })
}
```

### 11.3 Socket.IO client
```ts
// lib/api/websocket.ts
import { io } from 'socket.io-client'

export const socket = io(process.env.NEXT_PUBLIC_WS_URL!, { withCredentials: true })

export function joinRooms({ userId, partnerId, farmerId }: { userId?: string; partnerId?: string; farmerId?: string }) {
  if (userId) socket.emit('join-user-room', userId)
  if (partnerId) socket.emit('join-partner-room', partnerId)
  if (farmerId) socket.emit('join-farmer-room', farmerId)
}
```

## 12) Testing & Quality

- **Unit**: Component tests with Vitest/RTL, lib tests for API clients.
- **E2E**: Playwright covering core flows (auth, harvest create, listing create/order, payments init, offline queue replay, QR verify).
- **Accessibility**: axe checks in CI, keyboard navigation verified.

## 13) Security Notes

- Use httpOnly cookies for tokens; never store tokens in localStorage.
- Respect backend rate limits; implement client-side backoff and debouncing.
- Sanitize user inputs; validate with Zod and server-side schemas.
- Enforce RBAC on UI and data fetching.

## 14) Dev Scripts

```bash
# from client/
npm run dev
npm run build
npm run start
```

## 15) Implementation Checklist

- [ ] App Router skeleton with route groups `(public)` and `(dashboard)`
- [ ] Tailwind theme + components setup
- [ ] Auth pages + cookie-based sessions; refresh token flow
- [ ] API client layer per domain (`lib/api/*.ts`)
- [ ] PWA: SW registration, precache, runtime caching, offline page
- [ ] Background sync for mutations with IndexedDB queue
- [ ] Socket.IO integration and room joins
- [ ] i18n bootstrapped from `/api/languages` endpoints
- [ ] Role-based route guards and conditional navigation
- [ ] Feature pages wired to endpoints (sections 9.1–9.17)
- [ ] E2E tests for critical offline and payment flows

## 16) Notes on Endpoint Sources

- The mappings above are derived from the backend source (`server/src/index.ts` and `server/src/routes/*`). Where conflicts existed with older docs, the code-defined paths here should be treated as canonical (e.g., `commissions` route base is plural).

---

If any backend route changes, update section 9 to keep this document authoritative for the frontend.

## 17) Page-to-Endpoint Flow Examples

- Login/Register
  - Pages: `(public)/login`, `(public)/register`, `(public)/reset-password`
  - Endpoints: `/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password`, `/api/auth/reset-password`, `/api/auth/verify-email`

- Dashboard Overview
  - Page: `(dashboard)/dashboard`
  - Endpoints: `/api/analytics/dashboard` (+ others for widgets)

- Harvests
  - Pages: `(dashboard)/harvests`, `(dashboard)/harvests/new`
  - Endpoints: `GET /api/harvests`, `POST /api/harvests`, `GET /api/harvests/:batchId`, `GET /api/harvests/provenance/:batchId`
  - Public QR Verify Page: `(public)/verify/[batchId]` → `GET /api/verify/:batchId`

- Marketplace & Orders
  - Pages: `(dashboard)/marketplace`, `(dashboard)/marketplace/[id]`, `(dashboard)/orders`
  - Endpoints: `GET /api/marketplace/listings`, `POST /api/marketplace/listings`, `POST /api/marketplace/upload-image`, `POST /api/marketplace/orders`, `PATCH /api/marketplace/orders/:id/status`

- Payments
  - Flow: Initialize → Redirect to provider → Verify webhook (server) → Poll order status or receive socket event
  - Endpoint: `POST /api/payments/initialize` (client), `POST /api/payments/verify` (server webhook)

- IoT Sensors
  - Page: `(dashboard)/iot/sensors`
  - Endpoints: `/api/iot/sensors*` per section 9.13; join rooms via Socket.IO for live alerts

- AI & Image Recognition
  - Pages: `(dashboard)/ai`, `(dashboard)/image-recognition`
  - Endpoints: `/api/ai/*`, `/api/image-recognition/*`

- Fintech
  - Page: `(dashboard)/fintech`
  - Endpoints: `GET /api/fintech/credit-score/:farmerId`, `POST /api/fintech/loan-referrals`

- Commissions
  - Page: `(dashboard)/commissions`
  - Endpoints: `/api/commissions/summary`, `/api/commissions/history`, `/api/commissions/withdraw`

- Partners
  - Page: `(dashboard)/partners`
  - Endpoints: `/api/partners/bulk-onboard`, `/api/partners/upload-csv`, `/api/partners/:id/metrics`

- Notifications
  - Page: `(dashboard)/notifications`
  - Endpoints: `/api/notifications/preferences`, `/api/notifications/push-token`, message sends (admin/partner)

- Languages (Settings)
  - Page: `(dashboard)/settings`
  - Endpoints: `/api/languages`, `/api/languages/translations/:language`, `/api/languages/preference`

- PWA & Offline
  - Pages: `(public)/offline`, installation tips in `(dashboard)/settings`
  - Endpoints: `/api/pwa/*`, `/api/sync/*`


