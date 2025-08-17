"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/Alert"
import { AlertCircle, RefreshCcw, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface RegistrationErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface RegistrationErrorBoundaryProps {
  children: React.ReactNode
  role?: string
}

export class RegistrationErrorBoundary extends React.Component<
  RegistrationErrorBoundaryProps, 
  RegistrationErrorBoundaryState
> {
  constructor(props: RegistrationErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): RegistrationErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Registration form error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
                <CardTitle className="text-xl">Registration Form Error</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    We encountered an error while loading the registration form. This might be due to a temporary issue.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <Button onClick={this.resetError} className="w-full" variant="default">
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  
                  <Link href="/register">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Role Selection
                    </Button>
                  </Link>
                  
                  <Link href="/">
                    <Button variant="ghost" className="w-full">
                      <Home className="w-4 h-4 mr-2" />
                      Go to Home
                    </Button>
                  </Link>
                </div>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="text-xs text-muted-foreground border rounded p-3">
                    <summary className="cursor-pointer font-medium mb-2">
                      Error Details (Development)
                    </summary>
                    <div className="space-y-2">
                      <div>
                        <strong>Error:</strong> {this.state.error.message}
                      </div>
                      {this.state.errorInfo && (
                        <div>
                          <strong>Stack:</strong>
                          <pre className="mt-1 p-2 bg-muted rounded overflow-auto text-xs">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for handling registration-specific errors
export function useRegistrationErrorHandler() {
  return (error: Error, context?: string) => {
    console.error(`Registration error in ${context || 'unknown context'}:`, error)
    
    // You can add error reporting logic here
    // Example: send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service like Sentry
      // captureException(error, { tags: { context: 'registration' } })
    }
  }
}
