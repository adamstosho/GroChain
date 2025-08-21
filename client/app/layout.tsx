import type React from "react"
import type { Metadata, Viewport } from "next"
import { dmSans, nunito } from "./fonts"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"
import { WebSocketProvider } from "@/lib/websocket-context"
import { LanguageProvider } from "@/lib/language-context"
import { SocketProvider } from "@/components/realtime/socket-provider"
import InstallPrompt from "@/components/pwa/install-prompt"
import OfflineIndicator from "@/components/pwa/offline-indicator"
import PWAProvider from "@/components/pwa/pwa-provider"
import { NotificationProvider } from "@/components/notifications/notification-context"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"
import { cookies } from "next/headers"

export const metadata: Metadata = {
  title: "GroChain - Digital Trust Platform for Nigeria's Agriculture",
  description:
    "Building trust in Nigeria's food chain through transparent digital platform. Verify authentic Nigerian produce with QR codes, support local farmers, and ensure food quality.",
  generator: "GroChain",
  manifest: "/manifest.json",
  keywords: ["agriculture", "Nigeria", "food verification", "farmers", "QR codes", "digital trust"],
  authors: [{ name: "GroChain" }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GroChain",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "GroChain",
    title: "GroChain - Digital Trust Platform for Nigeria's Agriculture",
    description: "Building trust in Nigeria's food chain through transparent digital platform.",
  },
  twitter: {
    card: "summary",
    title: "GroChain - Digital Trust Platform for Nigeria's Agriculture",
    description: "Building trust in Nigeria's food chain through transparent digital platform.",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#006837" },
    { media: "(prefers-color-scheme: dark)", color: "#4caf50" },
  ],
}

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // SSR hint: check auth cookie presence; client will finalize session
  const cookieStore = cookies()
  const _auth = cookieStore.get('auth_token')?.value
  return (
    <html lang="en" className={`${dmSans.variable} ${nunito.variable} antialiased`}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GroChain" />
        <meta name="msapplication-TileColor" content="#006837" />
        <meta name="msapplication-tap-highlight" content="no" />

        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="mask-icon" href="/icon-192.png" color="#006837" />
      </head>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
          <ErrorBoundary>
            <LanguageProvider>
              <AuthProvider>
                <WebSocketProvider>
                  <NotificationProvider>
                    <SocketProvider>
                      <PWAProvider>
                        {children}
                        <InstallPrompt />
                        <OfflineIndicator />
                        <Toaster richColors position="top-right" />
                      </PWAProvider>
                    </SocketProvider>
                  </NotificationProvider>
                </WebSocketProvider>
              </AuthProvider>
            </LanguageProvider>
            </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
