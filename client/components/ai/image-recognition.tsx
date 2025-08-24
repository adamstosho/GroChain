"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Camera, 
  Upload, 
  Image, 
  Brain, 
  Target, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Download,
  RefreshCw
} from "lucide-react"

interface RecognitionResult {
  id: string
  imageUrl: string
  predictions: {
    label: string
    confidence: number
    boundingBox?: {
      x: number
      y: number
      width: number
      height: number
    }
  }[]
  status: 'processing' | 'completed' | 'failed'
  timestamp: string
  processingTime: number
}

const ImageRecognition = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [results, setResults] = useState<RecognitionResult[]>([])
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageSelect(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageSelect(e.dataTransfer.files[0])
    }
  }

  const processImage = async () => {
    if (!selectedImage) return

    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      const mockResult: RecognitionResult = {
        id: Date.now().toString(),
        imageUrl: previewUrl!,
        predictions: [
          {
            label: "Healthy Tomato Plant",
            confidence: 94.2,
            boundingBox: { x: 50, y: 30, width: 200, height: 150 }
          },
          {
            label: "Mature Leaves",
            confidence: 87.6,
            boundingBox: { x: 100, y: 80, width: 120, height: 80 }
          }
        ],
        status: 'completed',
        timestamp: new Date().toISOString(),
        processingTime: 2.3
      }

      setResults(prev => [mockResult, ...prev])
      setLoading(false)
    }, 2000)
  }

  const clearImage = () => {
    setSelectedImage(null)
    setPreviewUrl(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Image Recognition</h1>
          <p className="text-muted-foreground">AI-powered crop analysis and disease detection</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Image
          </Button>
          <Button variant="outline" onClick={() => setResults([])}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear History
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Image Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {previewUrl ? (
                <div className="space-y-4">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-w-full h-auto max-h-64 mx-auto rounded-lg"
                  />
                  <div className="flex gap-2 justify-center">
                    <Button onClick={processImage} disabled={loading}>
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Brain className="w-4 h-4 mr-2" />
                      )}
                      Analyze Image
                    </Button>
                    <Button variant="outline" onClick={clearImage}>
                      Clear
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Image className="w-16 h-16 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-lg font-medium">Drop an image here or click to browse</p>
                    <p className="text-sm text-muted-foreground">
                      Supports JPG, PNG, GIF up to 10MB
                    </p>
                  </div>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Camera className="w-4 h-4 mr-2" />
                    Choose Image
                  </Button>
                </div>
              )}
            </div>

            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Upload an image to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result) => (
                  <div key={result.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={
                          result.status === 'completed' ? 'bg-green-100 text-green-800' :
                          result.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {result.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {result.status === 'processing' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                          {result.status === 'failed' && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {result.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {result.processingTime}s
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {result.predictions.map((prediction, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary" />
                            <span className="font-medium">{prediction.label}</span>
                          </div>
                          <Badge variant="secondary">
                            {prediction.confidence}%
                          </Badge>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Download className="w-3 h-3 mr-1" />
                        Export
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Target className="w-3 h-3 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Features Info */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <Brain className="w-12 h-12 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold">Crop Disease Detection</h3>
              <p className="text-sm text-muted-foreground">
                Identify common plant diseases and pests
              </p>
            </div>
            <div className="text-center">
              <Target className="w-12 h-12 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold">Growth Stage Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Determine crop maturity and optimal harvest time
              </p>
            </div>
            <div className="text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold">Quality Assessment</h3>
              <p className="text-sm text-muted-foreground">
                Evaluate crop quality and market readiness
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { ImageRecognition }
