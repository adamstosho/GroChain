"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"
import { Leaf, Shield, Users, TrendingUp, Globe } from "lucide-react"

interface AuthLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
  showFeatures?: boolean
}

const features = [
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Bank-grade security with end-to-end encryption"
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Join thousands of farmers building trust together"
  },
  {
    icon: TrendingUp,
    title: "Growth Focused",
    description: "Tools and insights to scale your agricultural business"
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Connect with buyers and partners worldwide"
  }
]

export function AuthLayout({ 
  children, 
  title = "Welcome to GroChain",
  subtitle = "Nigeria's premier digital agriculture platform",
  showFeatures = true 
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Features/Branding */}
      {showFeatures && (
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-lg mx-auto"
          >
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">GroChain</h1>
                <p className="text-sm text-muted-foreground">Digital Agriculture Platform</p>
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              <div>
                <h2 className="text-4xl font-bold text-foreground mb-4 leading-tight">
                  {title}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {subtitle}
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 gap-4 mt-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start space-x-3 p-4 rounded-lg bg-background/50 border border-border/50"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/50">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">10K+</div>
                  <div className="text-xs text-muted-foreground">Active Farmers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">₦500M+</div>
                  <div className="text-xs text-muted-foreground">Total Transactions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">95%</div>
                  <div className="text-xs text-muted-foreground">Satisfaction Rate</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Right Side - Auth Form */}
      <div className={`flex-1 flex items-center justify-center p-4 ${showFeatures ? 'lg:w-1/2' : 'w-full'}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>

      {/* Mobile Features Banner */}
      {showFeatures && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent p-4">
          <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Secure</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Community</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Growth</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
