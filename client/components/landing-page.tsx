"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Leaf, QrCode, Shield, Users, TrendingUp, Smartphone, Star, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const features = [
  {
    icon: Leaf,
    title: "Farmer Onboarding",
    description: "Easy registration process with agency support and location mapping",
    benefits: ["Offline-first registration", "Identity verification", "Farm location mapping"],
  },
  {
    icon: QrCode,
    title: "QR Code Traceability",
    description: "Generate unique QR codes for each product to ensure full traceability from farm to table",
    benefits: ["Instant QR generation", "Public verification", "Product history tracking"],
  },
  {
    icon: Shield,
    title: "Digital Trust",
    description: "Build consumer confidence through verified farmer profiles and transparent product records",
    benefits: ["Verified farmer badges", "Transparent product records", "Buyer protection"],
  },
  {
    icon: Users,
    title: "Agency Support",
    description: "Comprehensive tools to onboard farmers and provide ongoing support for platform usage",
    benefits: ["Farmer training programs", "Technical assistance", "Offline sync support"],
  },
  {
    icon: Smartphone,
    title: "Mobile-First Design",
    description: "Optimized for mobile devices with offline capabilities for areas with limited connectivity",
    benefits: ["Works offline", "Low data usage", "Progressive Web App"],
  },
  {
    icon: TrendingUp,
    title: "Market Analytics",
    description: "Real-time insights into market trends, product demand, and supply chain optimization",
    benefits: ["Real-time market data", "Price tracking", "Supply chain insights"],
  },
]

const testimonials = [
  {
    name: "Adunni Adebayo",
    role: "Tomato Farmer, Lagos",
    content:
      "GroChain has transformed how I sell my produce. Buyers now trust my products because they can verify everything with a simple scan.",
    rating: 5,
    avatar: "/nigerian-woman-farmer.png",
  },
  {
    name: "Choma Ezeh",
    role: "Vegetable Buyer, Abuja",
    content:
      "As a buyer, I love knowing exactly where my food comes from. The transparency gives me confidence in the quality and freshness.",
    rating: 5,
    avatar: "/nigerian-man-buyer.png",
  },
  {
    name: "Ibrahim Okafor",
    role: "Agency Partner, Kano",
    content:
      "GroChain's agency program makes it easy for us to onboard farmers and provide ongoing support. The offline features are a game-changer.",
    rating: 5,
    avatar: "/placeholder-rx35j.png",
  },
]

export function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(0)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-heading font-bold text-foreground">GroChain</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
              <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/verify">
                <Button variant="outline" size="sm">
                  Verify QR
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                🌾 Over 10,000 farmers registered
              </Badge>

              <h1 className="text-4xl lg:text-6xl font-heading font-bold text-foreground mb-6">
                Building Trust in <span className="text-primary">Nigeria's</span> Food Chain
              </h1>

              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                GroChain connects farmers, buyers, and agencies through a transparent digital platform. Verify authentic
                Nigerian produce with QR codes, support local farmers, and ensure food quality.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/verify">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                    Verify Products
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8">
                <Image
                  src="/nigerian-farmers-qr.png"
                  alt="Verified Products"
                  width={600}
                  height={400}
                  className="rounded-xl shadow-lg"
                />
                <div className="absolute -top-4 -right-4 bg-success text-white px-4 py-2 rounded-lg shadow-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Verified Products</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4">Platform Features</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive tools designed specifically for Nigeria's agricultural ecosystem
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-heading font-semibold text-foreground mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground mb-4">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-success mr-2 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-6">About GroChain</h2>
              <p className="text-lg text-muted-foreground mb-6">
                GroChain is Nigeria's first comprehensive digital trust platform for agriculture. We're bridging the gap
                between traditional farming practices and modern technology to create a more transparent, efficient, and
                trustworthy food supply chain.
              </p>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">10K+</div>
                  <div className="text-sm text-muted-foreground">Pan-Nigerian Coverage</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Working with local agencies across all 36 states to onboard farmers and build trust in every
                    community.
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">100%</div>
                  <div className="text-sm text-muted-foreground">Community-Driven</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Built by Nigerians, for Nigerians. Our platform respects local customs and brings modern solutions
                    to age-old challenges.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Image
                src="/nigerian-agriculture.png"
                alt="About GroChain"
                width={600}
                height={500}
                className="rounded-xl shadow-lg"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4">What Our Users Say</h2>
            <p className="text-xl text-muted-foreground">
              Real experiences from farmers, buyers, and agencies across Nigeria
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-accent fill-current" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
                    <div className="flex items-center">
                      <Image
                        src={testimonial.avatar || "/placeholder.svg"}
                        alt={testimonial.name}
                        width={40}
                        height={40}
                        className="rounded-full mr-3"
                      />
                      <div>
                        <div className="font-medium text-foreground">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-6">
              Ready to Join Nigeria's Digital Agriculture Revolution?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Whether you're a farmer, buyer, or agency, GroChain has the tools you need to build trust and grow your
              business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Your Journey
                </Button>
              </Link>
              <Link href="/verify">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                  Try QR Verification
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-heading font-bold text-foreground">GroChain</span>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                Building trust in Nigeria's agricultural supply chain through transparency and blockchain technology.
              </p>
              <p className="text-sm text-muted-foreground">© 2025 GroChain. Building trust in Nigerian agriculture.</p>
            </div>

            <div>
              <h3 className="font-heading font-semibold text-foreground mb-4">Platform</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/farmers" className="text-muted-foreground hover:text-foreground transition-colors">
                    For Farmers
                  </Link>
                </li>
                <li>
                  <Link href="/buyers" className="text-muted-foreground hover:text-foreground transition-colors">
                    For Buyers
                  </Link>
                </li>
                <li>
                  <Link href="/agencies" className="text-muted-foreground hover:text-foreground transition-colors">
                    For Agencies
                  </Link>
                </li>
                <li>
                  <Link href="/api-access" className="text-muted-foreground hover:text-foreground transition-colors">
                    API Access
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-heading font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/training" className="text-muted-foreground hover:text-foreground transition-colors">
                    Training Videos
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact Support
                  </Link>
                </li>
                <li>
                  <a
                    href="tel:+2348001GROCHAIN"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    +234 800 GROCHAIN
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
