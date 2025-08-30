"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useToast } from "@/hooks/use-toast"
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Users, 
  ArrowLeft,
  Eye,
  EyeOff,
  Trash2
} from "lucide-react"
import Link from "next/link"

interface FarmerData {
  name: string
  email: string
  phone: string
  location: string
  [key: string]: string
}

interface ValidationResult {
  valid: FarmerData[]
  errors: string[]
  totalRows: number
}

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<FarmerData[]>([])
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const { toast } = useToast()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0]
    if (uploadedFile && uploadedFile.type === "text/csv") {
      setFile(uploadedFile)
      processCSV(uploadedFile)
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      })
    }
  }, [toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  })

  const processCSV = async (file: File) => {
    try {
      const text = await file.text()
      const lines = text.split(/\r?\n/).filter(Boolean)
      const headers = lines[0].split(',').map(h => h.trim())
      
      const data: FarmerData[] = lines.slice(1).map((line, index) => {
        const values = line.split(',')
        const row: FarmerData = {}
        headers.forEach((header, i) => {
          row[header] = values[i]?.trim() || ''
        })
        return row
      })

      setCsvData(data)
      validateData(data)
    } catch (error) {
      toast({
        title: "Error processing CSV",
        description: "Please check your file format",
        variant: "destructive",
      })
    }
  }

  const validateData = (data: FarmerData[]) => {
    const errors: string[] = []
    const valid: FarmerData[] = []

    data.forEach((row, index) => {
      const rowNumber = index + 2 // +2 because we start from line 2 (after header)

      if (!row.name || row.name.trim() === '') {
        errors.push(`Row ${rowNumber}: Name is required`)
        return
      }

      if (!row.email || row.email.trim() === '') {
        errors.push(`Row ${rowNumber}: Email is required`)
        return
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(row.email)) {
        errors.push(`Row ${rowNumber}: Invalid email format`)
        return
      }

      if (!row.phone || row.phone.trim() === '') {
        errors.push(`Row ${rowNumber}: Phone is required`)
        return
      }

      // Basic phone validation (Nigerian format)
      const phoneRegex = /^(\+234|0)[789][01]\d{8}$/
      if (!phoneRegex.test(row.phone.replace(/\s/g, ''))) {
        errors.push(`Row ${rowNumber}: Invalid phone format (use +234 or 0 followed by 10 digits)`)
        return
      }

      if (!row.location || row.location.trim() === '') {
        errors.push(`Row ${rowNumber}: Location is required`)
        return
      }

      valid.push(row)
    })

    setValidationResult({
      valid,
      errors,
      totalRows: data.length
    })
  }

  const handleUpload = async () => {
    if (!validationResult || validationResult.valid.length === 0) {
      toast({
        title: "No valid data to upload",
        description: "Please fix validation errors first",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(0)

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 10
        })
      }, 200)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      clearInterval(interval)
      setUploadProgress(100)

      toast({
        title: "Upload successful!",
        description: `${validationResult.valid.length} farmers have been onboarded`,
      })

      // Reset form
      setFile(null)
      setCsvData([])
      setValidationResult(null)
      setUploadProgress(0)
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const downloadTemplate = () => {
    const template = `name,email,phone,location
John Doe,john@farmer.com,+2348012345678,Lagos
Jane Smith,jane@farmer.com,+2348012345679,Abuja
Mike Johnson,mike@farmer.com,+2348012345680,Kano`
    
    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'farmer_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const removeFile = () => {
    setFile(null)
    setCsvData([])
    setValidationResult(null)
    setUploadProgress(0)
  }

  return (
    <DashboardLayout pageTitle="Bulk Farmer Upload">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/farmers">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Farmers
                </Link>
              </Button>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Bulk Farmer Upload</h1>
            <p className="text-muted-foreground">Upload multiple farmers at once using CSV format</p>
          </div>
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upload Section */}
          <div className="space-y-6">
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Upload CSV File</CardTitle>
                <CardDescription>
                  Drag and drop your CSV file or click to browse
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!file ? (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-primary/50"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    {isDragActive ? (
                      <p className="text-primary font-medium">Drop the CSV file here</p>
                    ) : (
                      <div>
                        <p className="font-medium">Drop your CSV file here</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          or click to select a file
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-4">
                      Supports .csv files up to 10MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={removeFile}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {validationResult && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Validation Results</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPreview(!showPreview)}
                          >
                            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {showPreview ? "Hide" : "Show"} Preview
                          </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="text-center p-2 bg-green-50 rounded">
                            <div className="font-bold text-green-600">{validationResult.valid.length}</div>
                            <div className="text-green-600">Valid</div>
                          </div>
                          <div className="text-center p-2 bg-red-50 rounded">
                            <div className="font-bold text-red-600">{validationResult.errors.length}</div>
                            <div className="text-red-600">Errors</div>
                          </div>
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="font-bold text-blue-600">{validationResult.totalRows}</div>
                            <div className="text-blue-600">Total</div>
                          </div>
                        </div>

                        {validationResult.errors.length > 0 && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              Please fix the validation errors before uploading
                            </AlertDescription>
                          </Alert>
                        )}

                        {validationResult.valid.length > 0 && (
                          <Button 
                            onClick={handleUpload} 
                            disabled={isUploading || validationResult.errors.length > 0}
                            className="w-full"
                          >
                            {isUploading ? "Uploading..." : `Upload ${validationResult.valid.length} Farmers`}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upload Progress */}
            {isUploading && (
              <Card>
                <CardHeader>
                  <CardTitle>Upload Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      {uploadProgress}% complete
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            {/* CSV Template */}
            <Card>
              <CardHeader>
                <CardTitle>CSV Template</CardTitle>
                <CardDescription>
                  Your CSV should follow this format with these required columns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2 text-sm font-medium bg-muted p-2 rounded">
                    <span>name</span>
                    <span>email</span>
                    <span>phone</span>
                    <span>location</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-sm bg-muted/50 p-2 rounded">
                    <span>John Doe</span>
                    <span>john@farmer.com</span>
                    <span>+2348012345678</span>
                    <span>Lagos</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-sm bg-muted/50 p-2 rounded">
                    <span>Jane Smith</span>
                    <span>jane@farmer.com</span>
                    <span>+2348012345679</span>
                    <span>Abuja</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Validation Errors */}
            {validationResult && validationResult.errors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span>Validation Errors</span>
                  </CardTitle>
                  <CardDescription>
                    Please fix these errors before uploading
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {validationResult.errors.map((error, index) => (
                      <div key={index} className="flex items-start space-x-2 text-sm">
                        <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span className="text-red-700">{error}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Data Preview */}
            {showPreview && validationResult && validationResult.valid.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Data Preview</span>
                  </CardTitle>
                  <CardDescription>
                    Preview of valid data that will be uploaded
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {validationResult.valid.slice(0, 5).map((row, index) => (
                      <div key={index} className="p-2 border rounded text-sm">
                        <div className="font-medium">{row.name}</div>
                        <div className="text-muted-foreground">
                          {row.email} • {row.phone} • {row.location}
                        </div>
                      </div>
                    ))}
                    {validationResult.valid.length > 5 && (
                      <p className="text-sm text-muted-foreground text-center">
                        ... and {validationResult.valid.length - 5} more
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-medium">Required Fields</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• <strong>name:</strong> Full name of the farmer</li>
                  <li>• <strong>email:</strong> Valid email address</li>
                  <li>• <strong>phone:</strong> Nigerian phone number (+234 or 0)</li>
                  <li>• <strong>location:</strong> City or region</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Tips</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Use the template as a starting point</li>
                  <li>• Ensure all required fields are filled</li>
                  <li>• Check phone numbers follow Nigerian format</li>
                  <li>• Maximum file size: 10MB</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
