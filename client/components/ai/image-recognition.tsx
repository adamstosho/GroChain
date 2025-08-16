"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Upload, Scan, Leaf, Bug, AlertTriangle, CheckCircle, ArrowLeft } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import Link from "next/link"

interface AnalysisResult {
  id: string
  type: "disease" | "pest" | "nutrient" | "health"
  confidence: number
  title: string
  description: string
  severity: "low" | "medium" | "high"
  recommendations: string[]
  createdAt: string
}

const mockResults: AnalysisResult[] = [
  {
    id: "1",
    type: "disease",
    confidence: 87,
    title: "Early Blight Detected",
    description: "Signs of early blight fungal infection detected on tomato leaves. Immediate action recommended.",
    severity: "high",
    recommendations: [
      "Remove affected leaves immediately",
      "Apply copper-based fungicide",
      "Improve air circulation",
      "Avoid overhead watering",
    ],
    createdAt: "2025-01-16T10:30:00Z",
  },
  {
    id: "2",
    type: "pest",
    confidence: 92,
    title: "Aphid Infestation",
    description: "Aphid colonies detected on plant stems. Early intervention can prevent spread.",
    severity: "medium",
    recommendations: [
      "Spray with insecticidal soap",
      "Introduce beneficial insects",
      "Remove heavily infested areas",
      "Monitor weekly",
    ],
    createdAt: "2025-01-16T09:15:00Z",
  },
  {
    id: "3",
    type: "nutrient",
    confidence: 78,
    title: "Nitrogen Deficiency",
    description: "Yellowing leaves indicate possible nitrogen deficiency. Consider fertilizer application.",
    severity: "low",
    recommendations: [
      "Apply nitrogen-rich fertilizer",
      "Test soil pH levels",
      "Ensure proper drainage",
      "Monitor plant response",
    ],
    createdAt: "2025-01-15T16:45:00Z",
  },
]

// Mock user for layout
const mockUser = {
  id: "1",
  name: "John Farmer",
  email: "john@farm.com",
  role: "farmer",
  avatar: "/placeholder.svg",
}

export function ImageRecognition() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>(mockResults)
  const [activeTab, setActiveTab] = useState("analyze")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedImage) return

    setIsAnalyzing(true)

    try {
      const formData = new FormData()
      formData.append("image", selectedImage)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Mock analysis result
      const newResult: AnalysisResult = {
        id: Date.now().toString(),
        type: "health",
        confidence: 94,
        title: "Healthy Plant Detected",
        description: "Plant appears healthy with good leaf color and structure. Continue current care routine.",
        severity: "low",
        recommendations: [
          "Maintain current watering schedule",
          "Continue regular fertilization",
          "Monitor for any changes",
          "Ensure adequate sunlight",
        ],
        createdAt: new Date().toISOString(),
      }

      setAnalysisResults((prev) => [newResult, ...prev])
      setActiveTab("results")
    } catch (error) {
      console.error("Analysis error:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetAnalysis = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (cameraInputRef.current) cameraInputRef.current.value = ""
  }

  const getResultIcon = (type: AnalysisResult["type"]) => {
    switch (type) {
      case "disease":
        return <AlertTriangle className="w-5 h-5 text-destructive" />
      case "pest":
        return <Bug className="w-5 h-5 text-warning" />
      case "nutrient":
        return <Leaf className="w-5 h-5 text-info" />
      case "health":
        return <CheckCircle className="w-5 h-5 text-success" />
      default:
        return <Scan className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getSeverityBadge = (severity: AnalysisResult["severity"]) => {
    switch (severity) {
      case "high":
        return <Badge variant="destructive">High Severity</Badge>
      case "medium":
        return <Badge variant="secondary">Medium Severity</Badge>
      case "low":
        return <Badge variant="outline">Low Severity</Badge>
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  return (
    <DashboardLayout user={mockUser}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/ai">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to AI Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Image Recognition</h1>
            <p className="text-muted-foreground">AI-powered crop and plant health analysis</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analyze">Analyze Image</TabsTrigger>
            <TabsTrigger value="results">
              Analysis History
              {analysisResults.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {analysisResults.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Camera className="w-5 h-5 mr-2 text-primary" />
                    Upload Image
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!imagePreview ? (
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                        <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Take or Upload Photo</h3>
                        <p className="text-muted-foreground mb-4">
                          Capture or select an image of your crops for AI analysis
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                          <input
                            ref={cameraInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="camera-input"
                          />
                          <label htmlFor="camera-input">
                            <Button asChild>
                              <span>
                                <Camera className="w-4 h-4 mr-2" />
                                Take Photo
                              </span>
                            </Button>
                          </label>

                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="file-input"
                          />
                          <label htmlFor="file-input">
                            <Button variant="outline" asChild>
                              <span>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Image
                              </span>
                            </Button>
                          </label>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Selected crop"
                          className="w-full h-64 object-cover rounded-lg border"
                        />
                      </div>
                      <div className="flex justify-between">
                        <Button variant="outline" onClick={resetAnalysis}>
                          Choose Different Image
                        </Button>
                        <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                          {isAnalyzing ? (
                            <div className="flex items-center">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Analyzing...
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Scan className="w-4 h-4 mr-2" />
                              Analyze Image
                            </div>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Analysis Info */}
              <Card>
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-primary">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Capture or Upload</h4>
                        <p className="text-sm text-muted-foreground">
                          Take a clear photo of your crops or upload an existing image
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-primary">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium">AI Analysis</h4>
                        <p className="text-sm text-muted-foreground">
                          Our AI analyzes the image for diseases, pests, and health indicators
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-primary">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Get Recommendations</h4>
                        <p className="text-sm text-muted-foreground">
                          Receive actionable insights and treatment recommendations
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Best Practices</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Use good lighting and clear focus</li>
                      <li>• Include affected areas in the frame</li>
                      <li>• Take multiple angles if needed</li>
                      <li>• Avoid blurry or dark images</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {isAnalyzing && (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold">Analyzing Image</h3>
                      <p className="text-muted-foreground">
                        Our AI is examining your image for diseases, pests, and health indicators...
                      </p>
                    </div>
                    <Progress value={75} className="w-64 mx-auto" />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {analysisResults.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Scan className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Analysis Results</h3>
                  <p className="text-muted-foreground mb-4">Upload and analyze your first image to see results here</p>
                  <Button onClick={() => setActiveTab("analyze")}>
                    <Camera className="w-4 h-4 mr-2" />
                    Start Analysis
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {analysisResults.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="mt-1">{getResultIcon(result.type)}</div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-medium text-foreground">{result.title}</h4>
                                {getSeverityBadge(result.severity)}
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{result.description}</p>
                              <div className="flex items-center space-x-4 mb-4">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-muted-foreground">Confidence:</span>
                                  <div className="flex items-center space-x-2">
                                    <Progress value={result.confidence} className="w-16 h-2" />
                                    <span className="text-xs font-medium">{result.confidence}%</span>
                                  </div>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(result.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div>
                                <h5 className="font-medium text-sm mb-2">Recommendations:</h5>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {result.recommendations.map((rec, idx) => (
                                    <li key={idx} className="flex items-start">
                                      <span className="mr-2">•</span>
                                      <span>{rec}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
