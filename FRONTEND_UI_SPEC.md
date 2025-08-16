## GroChain Frontend UI Implementation Spec (Aligned with README, Swagger, Design System)

This document validates the attached Figma templates and translates them into actionable, error-free implementation details for a robust, offline-first PWA UI. It follows `client/README.md`, `server/src/swagger.ts`, `server/API_DOCUMENTATION.md`, `.cursorrules`, and `client/DESIGN_SYSTEM.md`.

Use this as the contract for building each screen: components, states, API calls, offline behavior, motion, accessibility, and acceptance criteria.

---

## Global Standards (No deviations)

- App Router, strict TypeScript, named exports, kebab-case directories, PascalCase components.
- DM Sans for headings, Nunito for body; wire via `app/fonts.ts` and Tailwind theme mapping (see `DESIGN_SYSTEM.md`).
- Colors via semantic CSS variables only (no raw hex). Light/Dark ready; High-contrast toggle in Settings.
- Framer Motion transitions; respect `prefers-reduced-motion`.
- PWA: Installable, precache app shell, runtime caching, offline page, background sync for mutations.
- Tokens: radii, shadows, spacing per design system; consistent 12px radius on cards/buttons; input radius 8–10px.
- Accessibility: WCAG AA minimum; focus-visible outlines; ARIA on inputs/modals/toasts; keyboard nav everywhere.
- i18n: next-intl, backed by `/api/languages` endpoints.
- Real-time: Socket.IO rooms for user/partner/farmer when authenticated.

Performance budgets:
- LCP ≤ 2.5s on Slow 3G, CLS < 0.1, TBT < 300ms (desktop), images responsive, fonts preloaded.

---

## Screen-by-Screen Specifications

Each section lists: Route, Components, Data/API, Offline behavior, Motion, A11y, Acceptance Criteria (AC).

### 1) Landing Page (Marketing)
- Route: `/`
- Components: TopNav, Hero, FeatureCards (6), Testimonials, CTA, Footer.
- Data/API: Static content; optionally pull highlights from `/api/analytics/overview` for dynamic counters.
- Offline: Fully precached.
- Motion: Subtle fade/slide; image lazy-load with blur placeholders.
- A11y: Landmarks (header/main/footer), skip link, semantic headings.
- AC:
  - Hero CTAs lead to `(public)/register` and `(public)/verify/[batchId]`.
  - Pass axe-core with zero critical violations.

### 2) Role Selection (Create Account)
- Route: `/register` (first step)
- Components: RoleCard list (Farmer, Buyer, Agency) with icons and descriptions.
- Data/API: None; selection stored in query or local state to pass to next step.
- Offline: Precachable; selection persists in sessionStorage.
- Motion: Cards scale-hover, select with spring.
- A11y: Role cards are radio group with roving tabindex and ARIA `role="radiogroup"`.
- AC:
  - Keyboard selection works; Enter/Space selects; Next advances.

### 3) Registration (Farmer/Buyer/Agency)
- Route: `/register/[role]`
- Components: AuthCard, Form fields: full name, email, phone (Intl), password, show/hide, terms checkbox, submit.
- API: `POST /api/auth/register` with role; then optionally `POST /api/auth/send-sms-otp`.
- Offline: Queue submission if offline via background sync; show pending state and retry. Do not duplicate on replay (use idempotency key in header if possible).
- Motion: Card fade-in; button tap feedback.
- A11y: Labels always visible; `aria-invalid`, `aria-describedby` for errors.
- AC:
  - Validates via Zod before submit; server errors mapped to fields.
  - On success, route to OTP or login.

### 4) Login
- Route: `/login`
- Components: AuthCard, Email, Password with show/hide, Submit, Link to register.
- API: `POST /api/auth/login`; store tokens via httpOnly cookies when possible; otherwise secure storage pattern.
- Offline: Display offline banner; allow queued login? No—require connectivity. Show clear error.
- Motion/A11y: As above.
- AC:
  - Invalid creds show non-blocking error toast; lock out per rate limits communicated.

### 5) Verify Product (QR)
- Route: `/verify/[batchId]?code=...` and `/verify` for manual entry
- Components: QRInput with camera scan button, Submit; InfoPanel explaining steps; ResultCard.
- API: Public `GET /api/verify/:batchId` preferred (fallback `GET /api/harvests/verify/:batchId`).
- Offline: If previously verified items are cached, show last-known data with an “offline result” badge; otherwise show offline error and allow camera to save scans for later.
- Motion: Result card slide-in; success badge pulse.
- A11y: Inputs labeled; camera button has accessible name and fallback.
- AC:
  - Manual code entry + camera scan both work.
  - Handles: found, not found (404), server error, offline.

### 6) Farmer Dashboard
- Route: `/dashboard`
- Components: TopNav (avatar, logout, theme toggle), Tabs: Overview / My products / Profile; StatCards; QuickActions; RecentProducts list with status badges.
- API:
  - Stats from `/api/analytics/harvests`, `/api/analytics/marketplace`, `/api/analytics/summary` (dashboard) as needed.
  - Recent harvests: `GET /api/harvests` with pagination.
- Offline: Cache dashboard JSON; SW background refresh; badges indicate staleness.
- Motion: Tab transitions via layout animations; stat count spring.
- A11y: Tabs use proper roles and keyboard behavior.
- AC:
  - Loads within budget; pagination works; empty states present.

### 7) Add New Products (Register Harvest)
- Route: `/harvests/new`
- Components: HarvestForm (farmer, cropType, quantity, date, geoLocation); Submit; Success shows QR with download.
- API:
  - `POST /api/harvests`
  - On success display QR from response (`qrData`) and persist to IndexedDB.
- Offline: Queue POST; lock fields after optimistic add; mark as “pending sync”.
- Motion: Success modal scale-in.
- AC:
  - Client validation; server validation errors mapped; QR renders and can be saved.

### 8) QR Codes List
- Route: `/harvests`
- Components: List of harvests with action “View QR Codes” and status.
- API: `GET /api/harvests` with filters.
- Offline: Cached lists; local-only items tagged until sync.
- AC: Filter/sort flows work; pagination; empty state.

### 9) Marketplace
- Route: `/marketplace`
- Components: Search bar with suggestions, ProductCards, Filters, Upload (for sellers), Order flow.
- API:
  - `GET /api/marketplace/listings`, `GET /api/marketplace/search-suggestions`
  - `POST /api/marketplace/listings` (seller)
  - `POST /api/marketplace/upload-image` (multipart)
  - `POST /api/marketplace/orders`, `PATCH /api/marketplace/orders/:id/status`
- Offline: Listings cached; order creation queued; image uploads require online (guard UI accordingly).
- AC: Suggestion dropdown debounced; orders handle error states; role-based visibility enforced.

### 10) Payments
- Flow: Initialize → Provider → Webhook (server) → Client status update.
- API: `POST /api/payments/initialize`; webhook handled server-side at `POST /api/payments/verify`.
- UI: Show “awaiting confirmation” with polling or Socket.IO notification.
- AC: Handles success, failure, cancellation; idempotent re-init requests.

### 11) Notifications
- Route: `/notifications`
- API: Preferences `GET/PUT /api/notifications/preferences`, `PUT /api/notifications/push-token`; admin/partner sends not exposed here.
- UI: Preferences toggles; history list (if implemented: `GET /api/notifications/:userId`).
- Offline: Changes queued; reflect optimistic state; rollback on failure.

### 12) Partners & Referrals (Agency)
- Routes: `/partners`, CSV upload modal.
- API: `POST /api/partners/bulk-onboard`, `POST /api/partners/upload-csv`, metrics `GET /api/partners/:id/metrics`.
- Offline: CSV upload requires online; bulk create can be queued with caution—prefer online.

### 13) Commissions (Partner/Admin)
- Route: `/commissions`
- API: `GET /api/commissions/summary`, `GET /api/commissions/history`, `POST /api/commissions/withdraw`.
- UI: Wallet Card, history table with pagination.

### 14) IoT (Farmer/Partner)
- Route: `/iot/sensors`
- API: `/api/iot/sensors*` endpoints including readings/alerts.
- UI: Sensor list, detail drawer, health summary.

### 15) AI & Image Recognition
- Routes: `/ai`, `/image-recognition`
- API: `/api/ai/*`, `/api/image-recognition/*`
- UI: Upload and analysis results; insights dashboards.

### 16) BVN Verification
- Route: part of onboarding settings
- API: `POST /api/verification/bvn`, `GET /api/verification/status/:userId`, admin-only offline/resend endpoints.

### 17) Weather
- Route: Widgets in dashboard
- API: Public `/api/weather/*`

---

## Component Library Mapping (from Design System)

- Buttons: variants and sizes as specified; use semantic colors and focus styles.
- Inputs: sizes sm/md/lg; visible labels; helper/error text; phone with country code.
- Cards: radius 12px; elevation sm/md; consistent padding (24–32px).
- Badges: statuses (verified, pending, failed) map to success/warning/error tokens.
- Modals/Toasts: ARIA roles; focus trap; ESC; motion per spec.
- Tabs/Accordion: Headless UI or Radix primitives with Tailwind.

---

## Offline-First Details (by operation)

- Reads (GET): cache via SW; SWR pattern in RSC where appropriate; show last updated timestamp.
- Writes (POST/PUT/PATCH/DELETE): enqueue in IndexedDB with idempotency keys; replay on reconnect; reconcile UI; show pending chip.
- Offline Page: `/offline` precached; global banner when offline; gracefully degrade camera features with hints.

---

## Security & RBAC

- Enforce roles on client navigation and hide unauthorized actions; verify on server responses as source of truth.
- Tokens via httpOnly cookies when possible; refresh flow; never store tokens in localStorage.
- All forms sanitized; client validation mirrors server schemas (Zod analogs).

---

## Motion & Interaction

- Page transitions: fade/slide 250–300ms; components 150–200ms.
- Prefer layout animations for list reorders; minimal parallax; disable heavy motion when reduced motion is set.

---

## QA Acceptance Checklist (No errors allowed)

- Accessibility: axe-core zero critical; keyboard-only navigation; screen reader labels complete.
- Performance: Lighthouse PWA installable; scores 90+ for Performance/Best Practices/Accessibility/SEO on key pages.
- Offline: Landing, login (banner), verify page, dashboard lists work predictably; queued mutations replay.
- Internationalization: Language switch updates UI strings; RTL layout sanity tested if enabled.
- Error States: All API failures produce non-blocking toasts and field-level messages; retry where meaningful.
- Consistency: Typography scale, spacing, colors, radii, and shadows match `DESIGN_SYSTEM.md`.

---

## API Mapping Index (for dev convenience)

See `client/README.md` section 9 (canonical). Key flows summarized here:

- Auth: `/api/auth/*` (login/register/refresh/otp/reset/protected)
- Harvest: `/api/harvests`, `/api/harvests/:batchId`, `/api/harvests/provenance/:batchId`, public `/api/verify/:batchId`
- Marketplace: listings/orders/suggestions/upload-image
- Payments: initialize, server webhook verify
- Analytics: dashboard and sub-areas; export/report
- Partners: bulk-onboard/upload-csv/metrics
- Commissions: summary/history/withdraw
- Notifications: preferences/push-token
- IoT, AI, Image Recognition, BVN, Weather, Sync, PWA, Websocket

---

## Implementation Order (Suggested)

1) Foundations: fonts, tokens, Tailwind theme, layout shell, navigation.
2) Public screens: Landing, Verify Product, Offline page.
3) Auth: Role selection, Register, Login, OTP if enabled.
4) Dashboard: Overview widgets, Harvest list, Harvest create with QR.
5) Marketplace: Listings, Order flow, Payments init + status handling.
6) Notifications & Settings (language/theme/high-contrast).
7) Partners/Commissions modules.
8) IoT, AI, Image Recognition enhancements.

Deliver each with unit and e2e tests (Playwright) and run Lighthouse/axe gates in CI.


