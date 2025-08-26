import { Hero } from "@/components/sections/hero"
import { Features } from "@/components/sections/features"
import { About } from "@/components/sections/about"
import { Testimonials } from "@/components/sections/testimonials"
import { CTA } from "@/components/sections/cta"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <About />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
