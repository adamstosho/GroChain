"use client"

import { useMemo } from "react"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"

interface PasswordStrengthIndicatorProps {
  password: string
  showDetails?: boolean
  className?: string
}

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
  icon: typeof CheckCircle2
}

const requirements: PasswordRequirement[] = [
  {
    label: "At least 8 characters",
    test: (password) => password.length >= 8,
    icon: CheckCircle2
  },
  {
    label: "Contains lowercase letter",
    test: (password) => /(?=.*[a-z])/.test(password),
    icon: CheckCircle2
  },
  {
    label: "Contains uppercase letter",
    test: (password) => /(?=.*[A-Z])/.test(password),
    icon: CheckCircle2
  },
  {
    label: "Contains number",
    test: (password) => /(?=.*\d)/.test(password),
    icon: CheckCircle2
  },
  {
    label: "Contains special character",
    test: (password) => /(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password),
    icon: CheckCircle2
  }
]

export function PasswordStrengthIndicator({ 
  password, 
  showDetails = true, 
  className = "" 
}: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" }
    
    let score = 0
    requirements.forEach(req => {
      if (req.test(password)) score++
    })
    
    // Additional scoring for length and complexity
    if (password.length >= 12) score++
    if (password.length >= 16) score++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++
    
    if (score <= 2) return { score, label: "Weak", color: "text-red-500" }
    if (score <= 4) return { score, label: "Fair", color: "text-orange-500" }
    if (score <= 6) return { score, label: "Good", color: "text-yellow-500" }
    if (score <= 8) return { score, label: "Strong", color: "text-green-500" }
    return { score, label: "Very Strong", color: "text-emerald-500" }
  }, [password])

  const progressPercentage = useMemo(() => {
    if (!password) return 0
    return Math.min((strength.score / 8) * 100, 100)
  }, [password, strength.score])

  const getProgressColor = () => {
    if (strength.score <= 2) return "bg-red-500"
    if (strength.score <= 4) return "bg-orange-500"
    if (strength.score <= 6) return "bg-yellow-500"
    if (strength.score <= 8) return "bg-green-500"
    return "bg-emerald-500"
  }

  if (!password) return null

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Password Strength:</span>
          <span className={`font-medium ${strength.color}`}>
            {strength.label}
          </span>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ease-in-out ${getProgressColor()}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Weak</span>
          <span>Strong</span>
        </div>
      </div>

      {/* Requirements List */}
      {showDetails && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Password Requirements:
          </p>
          <div className="grid grid-cols-1 gap-2 text-xs">
            {requirements.map((req, index) => {
              const isMet = req.test(password)
              const Icon = isMet ? CheckCircle2 : XCircle
              
              return (
                <div 
                  key={index}
                  className={`flex items-center space-x-2 ${
                    isMet ? "text-green-600" : "text-red-500"
                  }`}
                >
                  <Icon className="w-3 h-3 flex-shrink-0" />
                  <span>{req.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Additional Tips */}
      {password.length > 0 && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Tips for a strong password:</p>
              <ul className="space-y-1">
                <li>• Use a mix of letters, numbers, and symbols</li>
                <li>• Avoid common words or personal information</li>
                <li>• Consider using a passphrase for better security</li>
                <li>• Use different passwords for different accounts</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
