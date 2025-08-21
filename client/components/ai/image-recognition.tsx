"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/Progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Camera, Upload, Scan, Leaf, Bug, AlertTriangle, CheckCircle, ArrowLeft, RefreshCw, Filter, Download, Trash2, Eye } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { toast } from "sonner"
import Link from "next/link"

interface AnalysisResult {
  _id: string
  type: "disease" | "pest" | "quality" | "growth" | "nutrient"
  confidence: number
  title: string
  description: string
  severity: "low" | "medium" | "high"
  recommendations: string[]
  createdAt: string
  cropType: string
  analysisType: string
  status: "pending" | "completed" | "failed"
  imageUrl?: string
  fieldId?: string
  location?: {
    latitude: number
    longitude: number
  }
  weather?: {
    temperature?: number
    humidity?: number
    rainfall?: number
  }
}

interface CropType {
  name: string
  value: string
  description: string
}

const cropTypes: CropType[] = [
  { name: "Tomatoes", value: "tomatoes", description: "Tomato plants and fruits" },
  { name: "Yam", value: "yam", description: "Yam tubers and vines" },
  { name: "Cassava", value: "cassava", description: "Cassava roots and leaves" },
  { name: "Maize", value: "maize", description: "Corn plants and ears" },
  { name: "Rice", value: "rice", description: "Rice plants and grains" },
  { name: "Beans", value: "beans", description: "Bean plants and pods" },
  { name: "Pepper", value: "pepper", description: "Pepper plants and fruits" },
  { name: "Other", value: "other", description: "Other crop types" }
]

export function ImageRecognition() {
  const { user } = useAuth()
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [activeTab, setActiveTab] = useState("analyze")
  const [loading, setLoading] = useState(false)
  const [selectedCropType, setSelectedCropType] = useState("tomatoes")
  const [analysisType, setAnalysisType] = useState("disease")
  const [fieldId, setFieldId] = useState("")
  const [filterCropType, setFilterCropType] = useState("all")
  const [filterRisk, setFilterRisk] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Fetch analysis history on component mount
  useEffect(() => {
    fetchAnalysisHistory()
  }, [])

  const fetchAnalysisHistory = async () => {
    try {
      setLoading(true)
      const resp = await api.get("/api/image-recognition/analyses")
      if (resp.success && resp.data) {
        setAnalysisResults(resp.data.analyses || [])
      }
    } catch (error) {
      console.error("Failed to fetch analysis history:", error)
      toast.error("Failed to load analysis history")
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalysesByCropType = async (cropType: string) => {
    try {
      setLoading(true)
      const resp = await api.get(`/api/image-recognition/analyses/crop/${cropType}`)
      if (resp.success && resp.data) {
        setAnalysisResults(resp.data.analyses || [])
      }
    } catch (error) {
      console.error("Failed to fetch analyses by crop type:", error)
      toast.error("Failed to load crop-specific analyses")
    } finally {
      setLoading(false)
    }
  }

  const fetchHighRiskAnalyses = async () => {
    try {
      setLoading(true)
      const resp = await api.get("/api/image-recognition/analyses/risk/high")
      if (resp.success && resp.data) {
        setAnalysisResults(resp.data.analyses || [])
      }
    } catch (error) {
      console.error("Failed to fetch high-risk analyses:", error)
      toast.error("Failed to load high-risk analyses")
    } finally {
      setLoading(false)
    }
  }

  const updateAnalysisStatus = async (analysisId: string, status: string) => {
    try {
      const resp = await api.put(`/api/image-recognition/analyses/${analysisId}/status`, { status })
      if (resp.success) {
        toast.success("Analysis status updated successfully")
        fetchAnalysisHistory() // Refresh the list
      }
    } catch (error) {
      console.error("Failed to update analysis status:", error)
      toast.error("Failed to update analysis status")
    }
  }

  const addRecommendation = async (analysisId: string, recommendation: string) => {
    try {
      const resp = await api.post(`/api/image-recognition/analyses/${analysisId}/recommendations`, { recommendation })
      if (resp.success) {
        toast.success("Recommendation added successfully")
        fetchAnalysisHistory() // Refresh the list
      }
    } catch (error) {
      console.error("Failed to add recommendation:", error)
      toast.error("Failed to add recommendation")
    }
  }

  const deleteAnalysis = async (analysisId: string) => {
    try {
      const resp = await api.delete(`/api/image-recognition/analyses/${analysisId}`)
      if (resp.success) {
        toast.success("Analysis deleted successfully")
        fetchAnalysisHistory() // Refresh the list
      }
    } catch (error) {
      console.error("Failed to delete analysis:", error)
      toast.error("Failed to delete analysis")
    }
  }

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
    if (!selectedImage || !selectedCropType || !analysisType) {
      toast.error("Please select an image, crop type, and analysis type")
      return
    }

    setIsAnalyzing(true)

    try {
      const formData = new FormData()
      formData.append("image", selectedImage)
      formData.append("cropType", selectedCropType)
      formData.append("analysisType", analysisType)
      
      if (fieldId) {
        formData.append("fieldId", fieldId)
      }

      // Add location if available (you can get this from user's profile or GPS)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          formData.append("latitude", position.coords.latitude.toString())
          formData.append("longitude", position.coords.longitude.toString())
        })
      }

      const resp = await api.post("/api/image-recognition/analyze", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (resp.success && resp.data) {
        toast.success("Image analysis completed successfully")
        setActiveTab("results")
        fetchAnalysisHistory() // Refresh the list
        resetAnalysis()
      } else {
        toast.error("Image analysis failed")
      }
    } catch (error) {
      console.error("Analysis error:", error)
      toast.error("Failed to analyze image")
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
    <DashboardLayout user={user as any}>
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analyze">Analyze Image</TabsTrigger>
            <TabsTrigger value="results">
              Analysis History
              {analysisResults.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {analysisResults.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
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
                      {/* Analysis Configuration */}
                      <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                        <h4 className="font-medium">Analysis Configuration</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="crop-type">Crop Type</Label>
                            <Select value={selectedCropType} onValueChange={setSelectedCropType}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {cropTypes.map((crop) => (
                                  <SelectItem key={crop.value} value={crop.value}>
                                    {crop.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="analysis-type">Analysis Type</Label>
                            <Select value={analysisType} onValueChange={setAnalysisType}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="disease">Disease Detection</SelectItem>
                                <SelectItem value="pest">Pest Detection</SelectItem>
                                <SelectItem value="quality">Quality Assessment</SelectItem>
                                <SelectItem value="growth">Growth Analysis</SelectItem>
                                <SelectItem value="nutrient">Nutrient Analysis</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="field-id">Field ID (Optional)</Label>
                            <Input
                              id="field-id"
                              placeholder="e.g., Field A, Plot 1"
                              value={fieldId}
                              onChange={(e) => setFieldId(e.target.value)}
                            />
                          </div>
                        </div>
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
            {/* Filters and Actions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Analysis History</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchAnalysisHistory}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                    <Button variant="outline" size="sm" onClick={fetchHighRiskAnalyses}>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      High Risk
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="filter-crop">Filter by Crop</Label>
                    <Select value={filterCropType} onValueChange={(value) => {
                      setFilterCropType(value)
                      if (value === "all") {
                        fetchAnalysisHistory()
                      } else {
                        fetchAnalysesByCropType(value)
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Crops</SelectItem>
                        {cropTypes.map((crop) => (
                          <SelectItem key={crop.value} value={crop.value}>
                            {crop.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="filter-risk">Filter by Risk</Label>
                    <Select value={filterRisk} onValueChange={setFilterRisk}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Risk Levels</SelectItem>
                        <SelectItem value="high">High Risk</SelectItem>
                        <SelectItem value="medium">Medium Risk</SelectItem>
                        <SelectItem value="low">Low Risk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="filter-status">Filter by Status</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading analysis results...</p>
                </CardContent>
              </Card>
            ) : analysisResults.length === 0 ? (
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
                    key={result._id}
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
                                <Badge variant="outline" className="ml-2">
                                  {result.cropType}
                                </Badge>
                                <Badge variant={result.status === 'completed' ? 'default' : 
                                               result.status === 'pending' ? 'secondary' : 'destructive'}>
                                  {result.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{result.description}</p>
                              
                              {/* Additional Info */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Analysis Type:</span>
                                  <span className="ml-2 font-medium capitalize">{result.analysisType}</span>
                                </div>
                                {result.fieldId && (
                                  <div>
                                    <span className="text-muted-foreground">Field:</span>
                                    <span className="ml-2 font-medium">{result.fieldId}</span>
                                  </div>
                                )}
                                {result.location && (
                                  <div>
                                    <span className="text-muted-foreground">Location:</span>
                                    <span className="ml-2 font-medium">
                                      {result.location.latitude.toFixed(4)}, {result.location.longitude.toFixed(4)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
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
                          <div className="flex flex-col gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateAnalysisStatus(result._id, 'completed')}
                              disabled={result.status === 'completed'}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark Complete
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deleteAnalysis(result._id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Leaf className="w-5 h-5 mr-2 text-success" />
                    Crop Health Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-success">
                        {analysisResults.filter(r => r.severity === 'low').length}
                      </div>
                      <p className="text-sm text-muted-foreground">Healthy Plants</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-warning">
                        {analysisResults.filter(r => r.severity === 'medium').length}
                      </div>
                      <p className="text-sm text-muted-foreground">Medium Risk</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-destructive">
                        {analysisResults.filter(r => r.severity === 'high').length}
                      </div>
                      <p className="text-sm text-muted-foreground">High Risk</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bug className="w-5 h-5 mr-2 text-warning" />
                    Issue Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['disease', 'pest', 'nutrient', 'quality', 'growth'].map((type) => {
                      const count = analysisResults.filter(r => r.type === type).length
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{type}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-destructive" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-destructive">
                        {analysisResults.filter(r => r.severity === 'high').length}
                      </div>
                      <p className="text-sm text-muted-foreground">High Priority Issues</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={fetchHighRiskAnalyses}
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      View High Risk
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Scan className="w-5 h-5 mr-2 text-primary" />
                    Analysis Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {analysisResults.length}
                      </div>
                      <p className="text-sm text-muted-foreground">Total Analyses</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success">
                        {analysisResults.filter(r => r.status === 'completed').length}
                      </div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-warning">
                        {analysisResults.filter(r => r.status === 'pending').length}
                      </div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Camera className="w-5 h-5 mr-2 text-info" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysisResults.slice(0, 3).map((result) => (
                      <div key={result._id} className="flex items-center justify-between text-sm">
                        <span className="truncate">{result.title}</span>
                        <span className="text-muted-foreground">
                          {new Date(result.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-success" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setActiveTab("analyze")}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      New Analysis
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={fetchAnalysisHistory}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
