GroChain Web2 MVP Specification

Scope: This document describes the complete Web2 version of GroChain for the MVP period. It covers product scope, user roles, functional modules, data model, API design, integrations, security, offline behavior, SMS and USSD, analytics, deployment, and testing. The design assumes an agency led onboarding model that uses cooperatives, extension services, NGOs, and aggregators to manage farmer clusters.

1. Product Overview

GroChain is a Progressive Web Application and REST API that enables transparent farm to market trade, provenance lookup with QR codes, and simple financial flows using Nigerian payment providers. The MVP is Web2 only. All provenance, orders, and verifications are stored in MongoDB. Agencies create and manage farmer profiles and batches. Farmers interact through assisted capture, SMS, USSD, and QR labels. Buyers browse inventory, place orders, and confirm delivery. Regulators and admins view analytics and audit logs.

Primary Goals for MVP

Prove that agency based onboarding can digitize real commodity flows without heavy farmer smartphone use.

Deliver end to end traceability inside a single database so that any item on the marketplace has a verifiable origin and chain of custody.

Process real orders with Naira payments using a trusted gateway.

Support offline data entry by field agents and synchronization.

Provide a director level dashboard for oversight and reporting.

2. User Roles and Permissions

Agency Administrator
• Creates agency, manages staff, assigns farmer clusters, approves listings, sees agency performance.

Field Agent
• Registers farmers, captures harvests and shipments, prints or writes QR labels, confirms deliveries, assists with orders.

Farmer Lite
• Verifies phone number, receives SMS updates, optionally confirms key events by SMS or USSD, views simple balance and order status when assisted.

Buyer
• Retailer, processor, exporter. Browses listings, scans QR to verify, places orders, pays, confirms receipt, rates experience.

Regulator or NGO Viewer
• Read only analytics for volumes, locations, and prices at aggregate level.

Platform Admin
• Global configuration, fraud and dispute handling, audit logs, user lifecycle, content moderation.

Role based access control is enforced in the API and the frontend. Each protected route checks JWT claims and role scopes.

3. Functional Modules
3.1 Authentication and Account Lifecycle

Email and password for organizations and buyers.

Phone based OTP for farmers and agents.

JWT access tokens with short expiry and HTTP only refresh tokens.

Optional two factor for agency administrators and platform admins.

Password reset by email and SMS code.

3.2 Agency and Farmer Management

Agency creation and verification by platform admin.

Farmer registration by agents: name, phone, sex, farm location, crop focus, cooperative membership, optional ID photo.

Farmer status lifecycle: pending, active, paused.

Cluster assignment: farmers grouped by ward or coop for reporting.

Document management for farmer records: photos and certificates in object storage with references in MongoDB.

3.3 Product, Batch, and Inventory

Batch creation: crop type, variety, grade, quantity, units, harvest date, farm geo point, moisture reading if available, quality notes.

QR code generation for each batch. The QR value is a short unique code that resolves to a public read endpoint.

Inventory state machine: harvested, at aggregator, in transit, at warehouse, listed, reserved, sold, delivered, closed.

Changes to state only by authorized actors with timestamps and actor ID.

Photos for quality evidence attached to batch records.

3.4 Marketplace and Orders

Listings created by agency admins or agents. Buyers filter by crop, grade, quantity, location, price, and delivery window.

Cart and order placement with delivery terms: pickup or delivery, expected date, location.

Reservation logic holds listed quantity for a short window before payment.

Order lifecycle: submitted, payment pending, paid, packed, in transit, delivered, buyer confirmed, completed, or disputed.

Ratings and notes after completion for service quality.

3.5 Payments and Disbursements

Integration with Paystack or Flutterwave for card and bank transfer.

Webhooks update payment status.

Split settlement option for agency fee and farmer payout when available from the provider.

Manual payout register if split settlement is not used.

Reconciliation dashboard that matches orders, gateway transactions, and payouts.

3.6 Logistics and Delivery

Pickup workflow for buyer trucks or agency partners.

Delivery assignment: driver name, phone, vehicle, estimated departure and arrival times.

Proof of delivery: recipient name, signature photo, optional OTP from buyer.

Dispute creation if quality or quantity differs from order.

3.7 QR Lookup and Public Verification

Public landing for QR scan that shows origin, harvest date, chain of custody, and current status.

Private details hidden to protect personal information.

A short share link is generated for consumer education campaigns.

3.8 Notifications and Messaging

SMS for farmer and buyer status updates: harvest captured, order paid, pickup scheduled, delivery confirmed.

Email for documents and invoices.

In app notifications for admins and agents.

Configurable frequency and language.

3.9 Offline Capture and Sync

Service worker caches application shell and core data.

Local queue in IndexedDB stores create and update actions performed offline.

Sync engine replays queued actions when connectivity returns, then refreshes views.

Conflict policy: latest write wins for non critical fields, guarded updates for quantities and statuses with server side version checks.

3.10 Analytics and Reports

Stock by crop and location.

Throughput by week and agency.

Average time from harvest to sale.

Post harvest loss proxy from discrepancies between harvested and sold quantities when captured.

Revenue, fees, payouts, and payment success rates.

Map view for movement of goods between wards and markets.

3.11 Admin, Audit, and Compliance

Full audit trail for sensitive actions with actor, timestamp, IP, and previous values.

Access logs by route and status code.

Content moderation for listings and photos.

Data retention policy and export tools for agencies.

Basic KYC collection and verification through partner check when available.

Key screens

Agency dashboard with KPIs, quick actions, and pending tasks.

Farmer registry with search, filters, and profile pages.

Batch capture wizard that supports offline.

Listing creator with pricing guide and stock checks.

Marketplace catalog for buyers with powerful filter and sort.

Order detail with payment and delivery timeline.

QR public page that is mobile friendly.

Admin console for users, roles, audits, and system settings.

Reports with export to CSV or PDF.

ntegrations

Payments: Paystack or Flutterwave. Create payment intent, redirect or inline, handle webhook, mark order as paid, create payout record.

SMS: twillo or Africa’s Talking. Templated messages in multiple languages. OTP for login and event updates.

Email: SMTP relay such as SendGrid.

File storage: cloudinary for photos, labels, invoices.

Optional map tiles for geo reporting with an open source provider.

. Security and Privacy

HTTPS everywhere.

HTTP only and secure cookies for refresh tokens.

Strong password policy and rate limits for auth endpoints.

Role based access with least privilege.

Input validation and output encoding to prevent injection.

CORS restricted to known origins in production.

Data at rest encryption at the storage layer.

Secrets in a vault and rotated.

Detailed audit logs for sensitive actions.

Backups nightly with point in time recovery tested regularly.

Basic PII handling policy: collect minimal data, mask when displayed in public, and never expose farmer exact locations on public pages.

Performance and Reliability

Pagination and cursor based listing on heavy queries.

Indexes for frequent filters such as crop, state, and status.

Caching layer for public QR reads and catalog pages.

CDN for static assets and images.

Health checks and readiness probes.

Graceful degradation when SMS or payment providers fail, with retries in the job queue.


Offline and Low Connectivity Strategy

All capture screens work offline with validation and local persistence.

Sync indicator shows pending actions and conflicts.

Image compression before upload to reduce bandwidth.

Lightweight UI with minimal third party libraries to keep bundle size small.

SMS and USSD as a parallel path for confirmations when data is unavailable.

SMS and USSD Flows

SMS examples
• Harvest captured: “GroChain: Maize 2,000 kg recorded for Adewale. Batch GC-MZ-9F2K7P.”
• Delivery OTP: “GroChain delivery code for Order ORD-2091 is 482913.”
• Payout notice: “GroChain: Payment of ₦145,000 scheduled. Ref: PYO-7712.”

USSD examples

Check order: dial short code, select language, enter order code, receive status.

Confirm delivery: dial short code, enter order code and OTP, receive confirmation.

Simple inquiry: dial short code, enter batch code, receive quantity and buyer contact.

KPIs for the MVP

Active agencies and active field agents per week.

New farmers registered and verified.

Batches created and percentage with photos.

Listings published and conversion to orders.

Payment success rate and average time to payout.

Delivery confirmation rate and average delivery time.

QR scan count on public pages.

Support tickets and mean time to resolution.

My Recommendation for GroChain MVP
Go with Hybrid:

Show a public preview of products (maybe 3–6 featured items, rotating).

Include QR verification prominently on the landing page (since it’s your unique differentiator).

Gate the full marketplace + purchase flow behind login.

This balances trust, visibility, and user acquisition.