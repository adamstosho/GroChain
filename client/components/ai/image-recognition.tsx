"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Progress } from "@/components/ui/Progress"
import { 
  Camera, 
  Upload, 
  Download, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Brain,
  Leaf,
  Bug,
  Droplets,
  Sun,
  Thermometer,
  Loader2,
  RefreshCw,
  FileImage,
  Shield,
  TrendingUp,
  BarChart3,
  Zap
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface ImageAnalysis {
  id: string
  imageUrl: string
  fileName: string
  uploadedAt: string
  analysisType: 'crop_health' | 'disease_detection' | 'pest_identification' | 'growth_stage' | 'quality_assessment'
  status: 'processing' | 'completed' | 'failed'
  results: {
    cropType?: string
    healthScore?: number
    diseaseDetected?: string[]
    pestsIdentified?: string[]
    growthStage?: string
    qualityGrade?: string
    recommendations?: string[]
    confidence: number
    riskLevel: 'low' | 'medium' | 'high'
  }
  metadata: {
    fileSize: number
    dimensions: {
      width: number
      height: number
    }
    location?: {
      lat: number
      lng: number
    }
  }
}

interface AnalysisStats {
  totalAnalyses: number
  completed: number
  processing: number
  failed: number
  averageConfidence: number
  topCrops: Array<{
    name: string
    count: number
    averageHealth: number
  }>
  commonIssues: Array<{
    issue: string
    frequency: number
    severity: 'low' | 'medium' | 'high'
  }>
}

export function ImageRecognition() {
  const { user } = useAuth()
  const [analyses, setAnalyses] = useState<ImageAnalysis[]>([])
  const [stats, setStats] = useState<AnalysisStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analysisType, setAnalysisType] = useState<string>("")
  const [selectedAnalysis, setSelectedAnalysis] = useState<ImageAnalysis | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file)
        toast.success(`Selected: ${file.name}`)
      } else {
        toast.error("Please select an image file")
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !analysisType) {
      toast.error("Please select a file and analysis type")
      return
    }

    try {
      setUploading(true)
      
      const formData = new FormData()
      formData.append('image', selectedFile)
      formData.append('analysisType', analysisType)
      
      const response = await api.post("/api/ai/image-recognition/analyze", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.success) {
        toast.success("Image uploaded successfully! Analysis in progress...")
        setSelectedFile(null)
        setAnalysisType("")
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        // Refresh analyses list
        fetchAnalyses()
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload image")
    } finally {
      setUploading(false)
    }
  }

  const fetchAnalyses = async () => {
    try {
      setLoading(true)
      
      // TODO: Replace with actual API calls when backend endpoints are implemented
      // const [analysesRes, statsRes] = await Promise.all([
      //   api.get("/api/ai/image-recognition/analyses"),
      //   api.get("/api/ai/image-recognition/stats")
      // ])

      // For now, use mock data
      const mockAnalyses: ImageAnalysis[] = [
        {
          id: "analysis_001",
          imageUrl: "/placeholder-image.jpg",
          fileName: "tomato_plant_001.jpg",
          uploadedAt: "2025-01-15T10:30:00Z",
          analysisType: "crop_health",
          status: "completed",
          results: {
            cropType: "Tomato",
            healthScore: 85,
            diseaseDetected: [],
            pestsIdentified: [],
            growthStage: "Flowering",
            qualityGrade: "A",
            recommendations: ["Continue current care routine", "Monitor for early blight"],
            confidence: 92,
            riskLevel: "low"
          },
          metadata: {
            fileSize: 2048576,
            dimensions: { width: 1920, height: 1080 },
            location: { lat: 6.5244, lng: 3.3792 }
          }
        }
      ]
      
      const mockStats = {
        totalAnalyses: 45,
        completed: 42,
        processing: 2,
        failed: 1,
        averageConfidence: 87.5,
        topCrops: ["Tomato", "Cassava", "Yam"],
        riskDistribution: { low: 35, medium: 8, high: 2 }
      }

      setAnalyses(mockAnalyses)
      setStats(mockStats)
    } catch (error) {
      console.error("Analyses fetch error:", error)
      toast.error("Failed to load analyses")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      processing: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800"
    }
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"
  }

  const getRiskBadge = (risk: string) => {
    const variants = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800"
    }
    return variants[risk as keyof typeof variants] || "bg-gray-100 text-gray-800"
  }

  const getAnalysisTypeIcon = (type: string) => {
    const icons = {
      crop_health: Leaf,
      disease_detection: Bug,
      pest_identification: Bug,
      growth_stage: TrendingUp,
      quality_assessment: BarChart3
    }
    return icons[type as keyof typeof icons] || Brain
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Image Recognition & Analysis</h1>
            <p className="text-muted-foreground">
              AI-powered image analysis for crop health, disease detection, and quality assessment
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={fetchAnalyses} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Upload Image for Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="image">Select Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    ref={fileInputRef}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Supported formats: JPG, PNG, WebP (Max 10MB)
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="analysis-type">Analysis Type</Label>
                  <Select value={analysisType} onValueChange={setAnalysisType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select analysis type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crop_health">Crop Health Assessment</SelectItem>
                      <SelectItem value="disease_detection">Disease Detection</SelectItem>
                      <SelectItem value="pest_identification">Pest Identification</SelectItem>
                      <SelectItem value="growth_stage">Growth Stage Analysis</SelectItem>
                      <SelectItem value="quality_assessment">Quality Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {selectedFile && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileImage className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <Button 
                onClick={handleUpload} 
                disabled={!selectedFile || !analysisType || uploading}
                className="w-full"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {uploading ? "Uploading..." : "Upload & Analyze"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalAnalyses}</p>
                    <p className="text-sm text-muted-foreground">Total Analyses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.completed}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.averageConfidence}%</p>
                    <p className="text-sm text-muted-foreground">Avg Confidence</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.failed}</p>
                    <p className="text-sm text-muted-foreground">Failed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Analyses */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Image Analyses</CardTitle>
          </CardHeader>
          <CardContent>
            {analyses.length === 0 ? (
              <div className="text-center py-8">
                <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-2">No image analyses yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload your first image to get started with AI-powered analysis
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {analyses.map((analysis) => {
                  const TypeIcon = getAnalysisTypeIcon(analysis.analysisType)
                  return (
                    <div
                      key={analysis.id}
                      className="p-4 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedAnalysis(analysis)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <TypeIcon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium capitalize">
                              {analysis.analysisType.replace('_', ' ')}
                            </h4>
                            <p className="text-sm text-muted-foreground">{analysis.fileName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusBadge(analysis.status)}>
                            {analysis.status}
                          </Badge>
                          {analysis.status === 'completed' && (
                            <Badge className={getRiskBadge(analysis.results.riskLevel)}>
                              {analysis.results.riskLevel} risk
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {analysis.status === 'completed' && analysis.results && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {analysis.results.cropType && (
                            <div>
                              <p className="text-muted-foreground">Crop Type</p>
                              <p className="font-medium">{analysis.results.cropType}</p>
                            </div>
                          )}
                          {analysis.results.healthScore && (
                            <div>
                              <p className="text-muted-foreground">Health Score</p>
                              <p className={`font-medium ${getHealthScoreColor(analysis.results.healthScore)}`}>
                                {analysis.results.healthScore}%
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-muted-foreground">Confidence</p>
                            <p className="font-medium">{analysis.results.confidence}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Uploaded</p>
                            <p className="font-medium">{new Date(analysis.uploadedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Details Modal */}
        {selectedAnalysis && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Analysis Details</h3>
                <Button variant="outline" size="sm" onClick={() => setSelectedAnalysis(null)}>
                  Close
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Image Preview */}
                <div>
                  <Label className="text-sm text-muted-foreground">Image</Label>
                  <div className="mt-2 p-4 bg-muted/30 rounded-lg">
                    <img 
                      src={selectedAnalysis.imageUrl} 
                      alt={selectedAnalysis.fileName}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">File Name:</span>
                      <span>{selectedAnalysis.fileName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">File Size:</span>
                      <span>{(selectedAnalysis.metadata.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dimensions:</span>
                      <span>{selectedAnalysis.metadata.dimensions.width} × {selectedAnalysis.metadata.dimensions.height}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uploaded:</span>
                      <span>{new Date(selectedAnalysis.uploadedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                {/* Analysis Results */}
                <div>
                  <Label className="text-sm text-muted-foreground">Analysis Results</Label>
                  <div className="mt-2 space-y-4">
                    {selectedAnalysis.status === 'completed' && selectedAnalysis.results ? (
                      <>
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <h4 className="font-medium mb-2">Summary</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {selectedAnalysis.results.cropType && (
                              <div>
                                <p className="text-muted-foreground">Crop Type</p>
                                <p className="font-medium">{selectedAnalysis.results.cropType}</p>
                              </div>
                            )}
                            {selectedAnalysis.results.healthScore && (
                              <div>
                                <p className="text-muted-foreground">Health Score</p>
                                <p className={`font-medium ${getHealthScoreColor(selectedAnalysis.results.healthScore)}`}>
                                  {selectedAnalysis.results.healthScore}%
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-muted-foreground">Confidence</p>
                              <p className="font-medium">{selectedAnalysis.results.confidence}%</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Risk Level</p>
                              <Badge className={getRiskBadge(selectedAnalysis.results.riskLevel)}>
                                {selectedAnalysis.results.riskLevel}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        {selectedAnalysis.results.diseaseDetected && selectedAnalysis.results.diseaseDetected.length > 0 && (
                          <div className="p-4 bg-red-50 rounded-lg">
                            <h4 className="font-medium mb-2 text-red-800">Diseases Detected</h4>
                            <ul className="space-y-1 text-sm text-red-700">
                              {selectedAnalysis.results.diseaseDetected.map((disease, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <Bug className="w-4 h-4" />
                                  {disease}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {selectedAnalysis.results.pestsIdentified && selectedAnalysis.results.pestsIdentified.length > 0 && (
                          <div className="p-4 bg-orange-50 rounded-lg">
                            <h4 className="font-medium mb-2 text-orange-800">Pests Identified</h4>
                            <ul className="space-y-1 text-sm text-orange-700">
                              {selectedAnalysis.results.pestsIdentified.map((pest, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <Bug className="w-4 h-4" />
                                  {pest}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {selectedAnalysis.results.recommendations && selectedAnalysis.results.recommendations.length > 0 && (
                          <div className="p-4 bg-green-50 rounded-lg">
                            <h4 className="font-medium mb-2 text-green-800">Recommendations</h4>
                            <ul className="space-y-1 text-sm text-green-700">
                              {selectedAnalysis.results.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    ) : selectedAnalysis.status === 'processing' ? (
                      <div className="p-4 bg-blue-50 rounded-lg text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
                        <p className="text-blue-800">Analysis in progress...</p>
                      </div>
                    ) : (
                      <div className="p-4 bg-red-50 rounded-lg text-center">
                        <XCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
                        <p className="text-red-800">Analysis failed</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
