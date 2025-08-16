## 🌟 GroChain Design System (Web2 Agricultural Logistics + Verification)

This design system is tailored for a Web2 logistics platform that facilitates product verification, agency onboarding, and secure farmer deliveries. It prioritizes rural accessibility, mobile-first ergonomics, clarity, and research-grade rigor, while remaining elegant and modern.

Use this as the authoritative standard for UI/UX, theming, component specs, motion, and accessibility across the GroChain frontend.

---

## 🎨 Foundations

### Colors (Accessible, Culturally Resonant, Theming-Ready)

Semantic tokens (light theme shown). Use HSL for easier theming. All brand and semantic pairs must meet WCAG AA contrast at text sizes used.

```css
:root {
  /* Brand */
  --brand-h: 150; /* deep green hue */
  --brand-s: 100%;
  --brand-l: 20%;

  --color-primary: hsl(var(--brand-h) var(--brand-s) var(--brand-l));           /* #006837 */
  --color-primary-foreground: hsl(0 0% 100%);
  --color-primary-emphasis: hsl(var(--brand-h) 60% 35%);                        /* darker hover */
  --color-primary-muted: hsl(var(--brand-h) 45% 60%);                           /* #4caf50 */

  --color-accent: hsl(48 100% 50%);                                             /* #ffcc00 */
  --color-accent-foreground: hsl(210 15% 15%);

  /* Neutrals */
  --color-bg: hsl(0 0% 98%);                                                    /* #f9f9f9 */
  --color-surface: hsl(0 0% 100%);
  --color-elevated: hsl(0 0% 99%);
  --color-border: hsl(0 0% 88%);                                                /* #e0e0e0 */
  --color-text: hsl(0 0% 11%);                                                  /* #1c1c1c */
  --color-text-muted: hsl(0 0% 43%);                                            /* #6e6e6e */

  /* Status */
  --color-success: hsl(123 49% 34%);                                            /* #2e7d32 */
  --color-error: hsl(4 76% 57%);                                                /* #e53935 */
  --color-info: hsl(199 87% 48%);                                               /* #039be5 */
  --color-warning: hsl(40 93% 50%);

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 2px 6px rgba(0,0,0,0.10);
  --shadow-lg: 0 4px 12px rgba(0,0,0,0.15);

  /* Radii */
  --radius-xl: 12px; /* buttons/cards */
  --radius-lg: 10px; /* inputs */
  --radius-md: 8px;
  --radius-sm: 6px;
}

/* Dark theme */
[data-theme="dark"] {
  --color-bg: hsl(210 14% 12%);
  --color-surface: hsl(210 14% 14%);
  --color-elevated: hsl(210 14% 16%);
  --color-border: hsl(210 9% 26%);
  --color-text: hsl(0 0% 98%);
  --color-text-muted: hsl(0 0% 70%);

  --color-primary: hsl(var(--brand-h) 64% 35%);
  --color-primary-foreground: hsl(0 0% 98%);
  --color-accent: hsl(48 100% 46%);
}
```

Guidelines:
- Never use raw hex in components; consume semantic tokens.
- Maintain a minimum contrast ratio of 4.5:1 for body text and 3:1 for large text/icons.
- Provide a high-contrast theme variant if user enables “High Contrast” in settings.

### Typography (Legibility First)

- Headings: DM Sans (700)
- Body: Nunito (400–600)
- Fallback: system-ui, sans-serif
- Line-height: 1.5 for body, 1.2–1.35 for headings

Next.js font setup example:
```ts
// app/fonts.ts
import { DM_Sans, Nunito } from 'next/font/google'

export const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400','500','700'], variable: '--font-dm-sans' })
export const nunito = Nunito({ subsets: ['latin'], weight: ['400','600','700'], variable: '--font-nunito' })
```

Type scale (rem):
- h1: 2.25 (36px)
- h2: 1.75 (28px)
- h3: 1.375 (22px)
- body: 1 (16px)
- caption: 0.75 (12px)

### Grid & Spacing

- Base unit: 8px (use 4px for fine adjustments only)
- Spacing scale: 4, 8, 16, 24, 32, 48, 64
- Desktop: 12-column grid; Mobile: 4-column grid
- Content widths: sm 640px, md 768px, lg 1024px, xl 1280px

### Border Radius

- Buttons & cards: 12px
- Inputs: 8–10px
- Avatars: circular or 20px

### Elevation (Shadows)

- Use elevation for interactivity and focus; limit deep shadows on mobile to conserve power and reduce visual noise.

---

## 🧱 Components (Specs & States)

All components must provide: default, hover, active, focus-visible, disabled, loading, success, and error states. Keyboard and screen reader support is mandatory.

### Forms
- Input (text/email/phone/password)
- Textarea
- Select (with searchable dropdown)
- File/Image Upload with preview
- Radio/Checkbox Group
- Multi-step Form with progress

Input spec:
- Sizes: sm (36px), md (44px), lg (52px)
- Padding: 12–16px horizontal
- States: error border uses `--color-error`, success uses `--color-success`
- Labels: always visible; use helper text for validation feedback

### UI Primitives
- Button (primary, secondary, ghost, outline, destructive, link)
- Card (farmer/agency/product variants)
- Avatar with status dot
- Badge (verified/pending/failed)
- Modal/Dialog (focus trap, ESC to close)
- Toast (stackable, timeout, ARIA live region)
- Tabs/Accordion (Roving tabindex)
- Stepper
- Pagination (25/50/100 per page)

### Navigation
- Top Nav (logo, links, profile menu)
- Sidebar (collapsible; convert to Drawer on mobile)
- Bottom Nav (mobile primary actions)
- Breadcrumbs

### Data Display
- Data Table (sortable, filterable, paginated)
- Stats Blocks (orders, earnings, growth)
- Empty States with guidance
- Charts (orders, agent growth)
- Timeline (delivery progress)

### Domain Modules
- QR Code (product verification)
- Wallet Card (commissions)
- Order Timeline Tracker (Request → Accept → Verify → Deliver → Confirm → Payout)
- Disbursement Status Modal

---

## 💡 Patterns

### Authentication
- OTP login + Email/Phone fallback
- Email verification and password reset flows

### Dashboards (Role-based)
- Agency, Farmer, Admin views; RBAC gates navigation and data queries

### Transaction Lifecycle
- Request → Accept → Verify → Deliver → Confirm → Pay-out
- Each step visible as a status with timestamps; update via real-time events

### USSD Support UI
- Sync with SMS/USSD logs, show confirmations for non-smartphone users

### Offline-First PWA
- Offline banner, background sync for mutations, cached lists
- Skeletons and optimistic UI while syncing

---

## 📱 Mobile-First Rules

- Use responsive Tailwind modifiers (`sm`, `md`, `lg`, `xl`)
- Replace sidebar with Drawer on small screens
- Sticky bottom action bars for checkout/order flows
- Transform data tables into collapsible cards on mobile

---

## 🧪 Interaction & States

- Every interactive element must have visible focus (`outline-offset: 2px;`), keyboard support, and ARIA semantics.
- Motion: respect `prefers-reduced-motion`; provide non-animated equivalents.

---

## ♿ Accessibility & Internationalization

- Contrast: WCAG AA minimums; AAA for critical flows if feasible
- Forms: associate labels, describe errors with `aria-describedby`
- Navigation: skip links, logical tab order, roving tabindex in composite widgets
- i18n: RTL support, pluralization, dynamic content length; ensure truncation styles are resilient
- Language features integrate with `/api/languages` endpoints

---

## 🧰 Implementation Guide

### Tailwind Theme Mapping

Use CSS variables in theme to ensure runtime theming and parity with tokens above.

```js
// tailwind.config.js
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        elevated: 'var(--color-elevated)',
        border: 'var(--color-border)',
        text: 'var(--color-text)',
        muted: 'var(--color-text-muted)',
        primary: 'var(--color-primary)',
        primaryFg: 'var(--color-primary-foreground)',
        accent: 'var(--color-accent)',
        success: 'var(--color-success)',
        error: 'var(--color-error)',
        info: 'var(--color-info)',
        warning: 'var(--color-warning)'
      },
      borderRadius: {
        xl: 'var(--radius-xl)',
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)'
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)'
      },
      fontFamily: {
        heading: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        body: ['var(--font-nunito)', 'system-ui', 'sans-serif']
      }
    }
  }
}
```

### Button Spec & Example

Variants: `primary`, `secondary`, `ghost`, `outline`, `destructive`, `link`

Sizes: `sm` (32px), `md` (40px), `lg` (48px)

```tsx
// components/ui/Button.tsx
'use client'
import { motion } from 'framer-motion'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'link'
type Size = 'sm' | 'md' | 'lg'

export function Button({ as: Comp = 'button', variant = 'primary', size = 'md', className, ...props }: any) {
  const base = 'inline-flex items-center justify-center rounded-xl font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed'
  const sizes: Record<Size, string> = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base'
  }
  const variants: Record<Variant, string> = {
    primary: 'bg-primary text-primaryFg hover:bg-[color:var(--color-primary-emphasis)] focus-visible:outline-primary',
    secondary: 'bg-elevated text-text hover:bg-surface focus-visible:outline-border',
    ghost: 'bg-transparent text-text hover:bg-elevated focus-visible:outline-border',
    outline: 'border border-border bg-transparent text-text hover:bg-elevated focus-visible:outline-border',
    destructive: 'bg-[color:var(--color-error)] text-white hover:brightness-95 focus-visible:outline-[color:var(--color-error)]',
    link: 'bg-transparent text-primary underline-offset-4 hover:underline focus-visible:outline-primary'
  }
  return (
    <motion.button whileTap={{ scale: 0.98 }} className={clsx(base, sizes[size], variants[variant], className)} {...props} />
  )
}
```

### Motion Guidelines

- Durations: 150–250ms for micro, 250–350ms for page
- Easing: `cubic-bezier(0.2, 0.8, 0.2, 1)` for entrance; `ease-out` for exit
- Use layout transitions for cards/lists; keep subtle to preserve clarity

### Icons & Illustrations

- Icons: Lucide or Tabler, 20–24px at body size, 1.5–1.75 stroke
- Illustrations: StorySet/Open Peeps for onboarding and empty states (opt-in)

### Optional: shadcn/ui Integration

- You may scaffold accessible primitives quickly using shadcn/ui.
- Theming: map shadcn tokens to the CSS variables above (primary, background, foreground, border).
- Override via Tailwind `:root` variables to keep a single source of truth.
- Keep usage minimal and consistent; prefer composition over heavy overrides.

---

## 🔒 Research-Grade Quality

- Metrics: instrument key interactions (clicks, conversion steps, drop-offs)
- A/B testing: isolate variants via feature flags
- Usability: ensure core flows completeable with poor connectivity and sun glare (high contrast option)
- Performance: LCP < 2.5s on 3G; minimal CLS; low motion when `prefers-reduced-motion`

---

## 🔁 Theming & Uniqueness

- Unique identity via deep green primary, warm gold accent, rounded-xl cards, and subtle motion.
- Support org/thematic variants by adjusting `--brand-*` and derived tokens.
- Provide `data-theme="dark"` and `data-theme="high-contrast"` toggles in settings.

---

## ✅ Fit Check: Can We Use This?

Yes—with the adjustments above, this system is production-standard, accessible, and research-ready. It aligns with Next.js + Tailwind + Framer Motion, supports offline-first patterns, and uses DM Sans (headings) and Nunito (body) as requested.

---

## 📂 Where to Start

1) Add fonts via `app/fonts.ts` and apply `className={`${dmSans.variable} ${nunito.variable}`}` on `html`.

2) Add CSS variables to `app/globals.css` and wire Tailwind theme to variables.

3) Build primitives in `components/ui/*` following specs here (Button/Input/Card/Modal/Toast/Badge/Tabs/Stepper/Pagination).

4) Implement domain modules (QR, Wallet Card, Order Timeline) with real backend data.

5) Verify contrast, keyboard nav, and responsive behavior for each component.


