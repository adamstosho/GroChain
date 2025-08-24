"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface SocialLoginProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  variant?: "default" | "outline"
  size?: "default" | "sm" | "lg"
  className?: string
}

export function SocialLogin({ 
  onSuccess, 
  onError, 
  variant = "outline", 
  size = "default",
  className = "" 
}: SocialLoginProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const router = useRouter()

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError("")

    try {
      // Initialize Google OAuth
      const googleAuth = await initializeGoogleAuth()
      
      if (googleAuth.success) {
        // Handle successful Google authentication
        const { user, token } = googleAuth.data
        
        // Log in the user with the Google credentials
        const loginSuccess = await login(user.email, token, "google")
        
        if (loginSuccess) {
          if (onSuccess) {
            onSuccess()
          } else {
            router.push("/dashboard")
          }
        } else {
          throw new Error("Failed to authenticate with Google")
        }
      } else {
        throw new Error(googleAuth.error || "Google authentication failed")
      }
    } catch (error) {
      console.error("Google login error:", error)
      const errorMessage = error instanceof Error ? error.message : "Google authentication failed"
      setError(errorMessage)
      if (onError) {
        onError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const initializeGoogleAuth = async () => {
    return new Promise<{ success: boolean; data?: any; error?: string }>((resolve) => {
      // Check if Google API is available
      if (typeof window !== "undefined" && (window as any).gapi) {
        const gapi = (window as any).gapi
        
        gapi.load('auth2', () => {
          gapi.auth2.init({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            scope: 'email profile'
          }).then((auth2: any) => {
            auth2.signIn().then((googleUser: any) => {
              const profile = googleUser.getBasicProfile()
              const idToken = googleUser.getAuthResponse().id_token
              
              resolve({
                success: true,
                data: {
                  user: {
                    id: profile.getId(),
                    email: profile.getEmail(),
                    name: profile.getName(),
                    picture: profile.getImageUrl()
                  },
                  token: idToken
                }
              })
            }).catch((error: any) => {
              resolve({
                success: false,
                error: "Google sign-in was cancelled or failed"
              })
            })
          }).catch((error: any) => {
            resolve({
              success: false,
              error: "Failed to initialize Google authentication"
            })
          })
        })
      } else {
        // Fallback to redirect method
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&` +
          `redirect_uri=${encodeURIComponent(window.location.origin + "/auth/google/callback")}&` +
          `scope=${encodeURIComponent("email profile")}&` +
          `response_type=code&` +
          `access_type=offline`
        
        window.location.href = googleAuthUrl
      }
    })
  }

  const handleFacebookLogin = async () => {
    setIsLoading(true)
    setError("")

    try {
      // Facebook login implementation
      // This would integrate with Facebook SDK
      setError("Facebook login is not yet implemented")
    } catch (error) {
      console.error("Facebook login error:", error)
      setError("Facebook authentication failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTwitterLogin = async () => {
    setIsLoading(true)
    setError("")

    try {
      // Twitter login implementation
      // This would integrate with Twitter OAuth
      setError("Twitter login is not yet implemented")
    } catch (error) {
      console.error("Twitter login error:", error)
      setError("Twitter authentication failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-3">
        {/* Google Login */}
        <Button
          variant={variant}
          size={size}
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Continue with Google
        </Button>

        {/* Facebook Login */}
        <Button
          variant={variant}
          size={size}
          onClick={handleFacebookLogin}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          )}
          Continue with Facebook
        </Button>

        {/* Twitter Login */}
        <Button
          variant={variant}
          size={size}
          onClick={handleTwitterLogin}
          disabled={isLoading}
          className="w-full bg-sky-500 hover:bg-sky-600 text-white border-sky-500"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
            </svg>
          )}
          Continue with Twitter
        </Button>
      </div>

      {/* Privacy Notice */}
      <p className="text-xs text-muted-foreground text-center">
        By continuing with social login, you agree to our{" "}
        <a href="/terms" className="text-primary hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </a>
      </p>
    </div>
  )
}

// Google OAuth Callback Handler
export function GoogleAuthCallback() {
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const error = urlParams.get('error')

        if (error) {
          setError("Google authentication was cancelled or failed")
          return
        }

        if (code) {
          // Exchange code for tokens
          const response = await fetch('/api/auth/google/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          })

          const data = await response.json()

          if (data.success) {
            // Log in the user
            const loginSuccess = await login(data.user.email, data.token, "google")
            
            if (loginSuccess) {
              router.push("/dashboard")
            } else {
              setError("Failed to authenticate with Google")
            }
          } else {
            setError(data.error || "Google authentication failed")
          }
        } else {
          setError("No authorization code received from Google")
        }
      } catch (error) {
        console.error("Google callback error:", error)
        setError("Failed to process Google authentication")
      } finally {
        setIsProcessing(false)
      }
    }

    handleCallback()
  }, [login, router])

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Processing Google authentication...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Authentication Failed</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => router.push("/login")}>
            Back to Login
          </Button>
        </div>
      </div>
    )
  }

  return null
}
