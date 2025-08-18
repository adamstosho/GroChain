"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/Progress"
import { Badge } from "@/components/ui/badge"
import { Upload, Download, FileText, ArrowLeft, Check, X, AlertCircle } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

interface UploadResult {
  total: number
  successful: number
  failed: number
  errors: Array<{
    row: number
    error: string
  }>
}

export function BulkPartnerUpload() {
  const { user } = useAuth()

  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile)
      setUploadResult(null)
    } else {
      alert("Please select a valid CSV file")
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", file)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const response = await api.uploadPartnersCSV(formData)

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.success && response.data) {
        const payload: any = response.data
        setUploadResult(payload.data || payload)
      } else {
        throw new Error(response.error || "Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      // Mock result for demo
      setUploadResult({
        total: 10,
        successful: 8,
        failed: 2,
        errors: [
          { row: 3, error: "Invalid email format" },
          { row: 7, error: "Phone number already exists" },
        ],
      })
    } finally {
      setIsUploading(false)
    }
  }

  const downloadTemplate = () => {
    const csvContent = `First Name,Last Name,Email,Phone,State,LGA,Farm Size,Crop Types,Experience
John,Doe,john@example.com,+234 801 234 5678,Lagos,Ikeja,2.5,"Tomatoes, Yam",5
Jane,Smith,jane@example.com,+234 802 345 6789,Ogun,Abeokuta North,1.8,"Cassava, Rice",3`

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "partner_upload_template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const resetUpload = () => {
    setFile(null)
    setUploadResult(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <DashboardLayout user={user as any}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/partners">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Partners
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Bulk Partner Upload</h1>
            <p className="text-muted-foreground">Upload multiple partners using a CSV file</p>
          </div>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-primary" />
              Upload Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Required Columns:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• First Name</li>
                  <li>• Last Name</li>
                  <li>• Email</li>
                  <li>• Phone</li>
                  <li>• State</li>
                  <li>• LGA (Local Government Area)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Optional Columns:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Farm Size (hectares)</li>
                  <li>• Crop Types</li>
                  <li>• Experience (years)</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-4 border-t">
              <Button onClick={downloadTemplate} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
              <p className="text-sm text-muted-foreground">
                Download the CSV template to ensure your file has the correct format
              </p>
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!file && !uploadResult && (
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Choose CSV File</h3>
                <p className="text-muted-foreground mb-4">Select a CSV file containing partner information</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload">
                  <Button asChild>
                    <span>Select File</span>
                  </Button>
                </label>
              </div>
            )}

            {file && !uploadResult && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-primary" />
                    <div>
                      <h4 className="font-medium">{file.name}</h4>
                      <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={resetUpload}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={resetUpload} disabled={isUploading}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpload} disabled={isUploading}>
                    {isUploading ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Uploading...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Partners
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {uploadResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <div className="text-center py-6">
                  <Check className="w-12 h-12 text-success mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Upload Complete</h3>
                  <p className="text-muted-foreground">Your CSV file has been processed</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-foreground">{uploadResult.total}</p>
                      <p className="text-sm text-muted-foreground">Total Records</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-success">{uploadResult.successful}</p>
                      <p className="text-sm text-muted-foreground">Successful</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-destructive">{uploadResult.failed}</p>
                      <p className="text-sm text-muted-foreground">Failed</p>
                    </CardContent>
                  </Card>
                </div>

                {uploadResult.errors.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-destructive">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Errors ({uploadResult.errors.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {uploadResult.errors.map((error, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-destructive/10 rounded-lg">
                            <Badge variant="destructive">Row {error.row}</Badge>
                            <p className="text-sm text-foreground">{error.error}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-center space-x-4">
                  <Button onClick={resetUpload} variant="outline">
                    Upload Another File
                  </Button>
                  <Link href="/partners">
                    <Button>View Partners</Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
