import type React from "react"
import type { Metadata } from "next"
import { DM_Sans, Nunito } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { DatadogSuppressor } from "@/components/datadog-suppressor"

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
})

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
})

export const metadata: Metadata = {
  title: "GroChain - Building Trust in Nigeria's Food Chain",
  description:
    "Digital agricultural platform connecting farmers, buyers, and agencies through transparent supply chain management with QR code traceability.",
  generator: "GroChain Platform",
  keywords: ["agriculture", "farming", "supply chain", "Nigeria", "food security", "traceability"],
  authors: [{ name: "GroChain Team" }],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "GroChain - Digital Agriculture Platform",
    description: "Building trust in Nigeria's food chain through transparent digital platform",
    type: "website",
    locale: "en_US",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Paystack Payment Script */}
        <script src="https://js.paystack.co/v1/inline.js"></script>
      </head>
      <body className={`font-sans ${dmSans.variable} ${nunito.variable} antialiased`}>
        <DatadogSuppressor />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
