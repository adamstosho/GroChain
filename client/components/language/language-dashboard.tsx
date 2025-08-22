"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { 
  Globe, 
  Languages, 
  MessageSquare, 
  Download, 
  Upload, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  Filter
} from "lucide-react"
import { api } from "@/lib/api"
import { TranslationSystem } from "./translation-system"

interface Language {
  code: string
  name: string
  nativeName: string
  isActive: boolean
  isDefault: boolean
  completionPercentage: number
  lastUpdated: string
}

interface Translation {
  key: string
  english: string
  translation: string
  language: string
  status: 'translated' | 'pending' | 'needs_review'
  lastUpdated: string
}

export function LanguageDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [languages, setLanguages] = useState<Language[]>([])
  const [translations, setTranslations] = useState<Translation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("")

  useEffect(() => {
    fetchLanguageData()
  }, [])

  useEffect(() => {
    if (selectedLanguage) {
      fetchTranslations(selectedLanguage)
    }
  }, [selectedLanguage])

  const fetchLanguageData = async () => {
    try {
      setLoading(true)
      setError("")
      
      // Get supported languages from backend
      const response = await api.getSupportedLanguages()
      if (response.success && response.data) {
        const languagesData = response.data.languages || []
        
        // Transform backend data to match frontend interface
        const transformedLanguages: Language[] = languagesData.map((lang: any) => ({
          code: lang.code,
          name: lang.name,
          nativeName: lang.nativeName,
          isActive: true, // All languages are active by default
          isDefault: lang.isDefault,
          completionPercentage: 100, // Assume complete for now
          lastUpdated: new Date().toISOString()
        }))
        
        setLanguages(transformedLanguages)
        if (transformedLanguages.length > 0) {
          setSelectedLanguage(transformedLanguages[0].code)
        }
      } else {
        // Fallback to basic language structure
        setLanguages([
          {
            code: "en",
            name: "English", 
            nativeName: "English",
            isActive: true,
            isDefault: true,
            completionPercentage: 100,
            lastUpdated: new Date().toISOString()
          }
        ])
        setSelectedLanguage("en")
      }
    } catch (error) {
      console.error("Language fetch error:", error)
      setError("Failed to load language data")
      // Set fallback data on error
      setLanguages([
        {
          code: "en",
          name: "English", 
          nativeName: "English",
          isActive: true,
          isDefault: true,
          completionPercentage: 100,
          lastUpdated: new Date().toISOString()
        }
      ])
      setSelectedLanguage("en")
    } finally {
      setLoading(false)
    }
  }

  const fetchTranslations = async (languageCode: string) => {
    try {
      // TODO: Replace with actual API call when backend endpoint is implemented
      // const response = await api.getTranslations(languageCode)
      
      // For now, use mock data
      const mockTranslations: Translation[] = [
        {
          key: "welcome",
          english: "Welcome",
          translation: languageCode === "fr" ? "Bienvenue" : "Welcome",
          language: languageCode,
          status: 'translated' as const,
          lastUpdated: new Date().toISOString()
        },
        {
          key: "dashboard",
          english: "Dashboard",
          translation: languageCode === "fr" ? "Tableau de bord" : "Dashboard",
          language: languageCode,
          status: 'translated' as const,
          lastUpdated: new Date().toISOString()
        }
      ]
      
      setTranslations(mockTranslations)
    } catch (error) {
      console.error("Translations fetch error:", error)
      setError("Failed to load translations")
      setTranslations([])
    }
  }

  const handleLanguageToggle = async (languageCode: string, isActive: boolean) => {
    try {
      // Mock API call - replace with actual implementation
      setLanguages(prev => prev.map(lang => 
        lang.code === languageCode ? { ...lang, isActive } : lang
      ))
    } catch (error) {
      console.error("Language toggle error:", error)
      setError("Failed to update language status")
    }
  }

  const handleTranslationUpdate = async (key: string, translation: string) => {
    try {
      // Mock API call - replace with actual implementation
      setTranslations(prev => prev.map(trans => 
        trans.key === key ? { ...trans, translation, status: 'translated', lastUpdated: new Date().toISOString() } : trans
      ))
    } catch (error) {
      console.error("Translation update error:", error)
      setError("Failed to update translation")
    }
  }

  const handleExportTranslations = async (languageCode: string) => {
    try {
      // Mock export functionality - replace with actual implementation
      const language = languages.find(lang => lang.code === languageCode)
      const languageTranslations = translations.filter(trans => trans.language === languageCode)
      
      const exportData = {
        language: language?.name,
        code: languageCode,
        translations: languageTranslations,
        exportedAt: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `grochain-translations-${languageCode}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export error:", error)
      setError("Failed to export translations")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'translated':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'needs_review':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'translated':
        return <CheckCircle className="w-4 h-4" />
      case 'pending':
        return <AlertCircle className="w-4 h-4" />
      case 'needs_review':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Language Management
          </h1>
          <p className="text-muted-foreground">
            Manage multiple languages and translations for GroChain
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Language
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </motion.div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="translations">Translations</TabsTrigger>
          <TabsTrigger value="translate">Translate</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Language Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Languages</p>
                      <p className="text-2xl font-bold text-foreground">{languages.length}</p>
                    </div>
                    <Globe className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Languages</p>
                      <p className="text-2xl font-bold text-foreground">
                        {languages.filter(lang => lang.isActive).length}
                      </p>
                    </div>
                    <Languages className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg. Completion</p>
                      <p className="text-2xl font-bold text-foreground">
                        {Math.round(languages.reduce((sum, lang) => sum + lang.completionPercentage, 0) / languages.length)}%
                      </p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Keys</p>
                      <p className="text-2xl font-bold text-foreground">
                        {translations.length > 0 ? new Set(translations.map(t => t.key)).size : 0}
                      </p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Language List */}
          <Card>
            <CardHeader>
              <CardTitle>Supported Languages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {languages.map((language, index) => (
                  <motion.div
                    key={language.code}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Globe className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{language.name}</h4>
                        <p className="text-sm text-muted-foreground">{language.nativeName}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                          <span>Code: {language.code.toUpperCase()}</span>
                          {language.isDefault && (
                            <Badge variant="default">Default</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium text-foreground">{language.completionPercentage}%</p>
                        <p className="text-sm text-muted-foreground">Complete</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant={language.isActive ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleLanguageToggle(language.code, !language.isActive)}
                        >
                          {language.isActive ? "Active" : "Inactive"}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExportTranslations(language.code)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="translations" className="space-y-6">
          {/* Language Selection and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Translation Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <Label htmlFor="language-select">Select Language</Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(language => (
                        <SelectItem key={language.code} value={language.code}>
                          {language.name} ({language.nativeName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="search">Search Keys</Label>
                  <Input
                    id="search"
                    placeholder="Search translation keys..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="status-filter">Filter by Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="translated">Translated</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="needs_review">Needs Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Translations List */}
              {selectedLanguage && (
                <div className="space-y-4">
                  {translations
                    .filter(trans => 
                      trans.language === selectedLanguage &&
                      (searchQuery === "" || trans.key.toLowerCase().includes(searchQuery.toLowerCase())) &&
                      (filterStatus === "" || trans.status === filterStatus)
                    )
                    .map((translation, index) => (
                      <motion.div
                        key={translation.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Translation Key</Label>
                            <p className="text-sm text-muted-foreground mt-1">{translation.key}</p>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium">English (Source)</Label>
                            <p className="text-sm text-foreground mt-1">{translation.english}</p>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium">Translation</Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <Input
                                value={translation.translation}
                                onChange={(e) => handleTranslationUpdate(translation.key, e.target.value)}
                                placeholder="Enter translation..."
                                className="text-sm"
                              />
                              <Badge className={getStatusColor(translation.status)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(translation.status)}
                                  {translation.status.replace('_', ' ')}
                                </div>
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                          <span className="text-xs text-muted-foreground">
                            Last updated: {new Date(translation.lastUpdated).toLocaleDateString()}
                          </span>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark Complete
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="translate" className="space-y-4">
          <TranslationSystem />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Language Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Default Language</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Set the default language for new users and system messages.
                  </p>
                  <Select value={languages.find(l => l.isDefault)?.code || "en"}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Select default language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(language => (
                        <SelectItem key={language.code} value={language.code}>
                          {language.name} ({language.nativeName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Auto-Translation</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enable automatic translation for new content using AI services.
                  </p>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="auto-translate" className="rounded" />
                    <Label htmlFor="auto-translate">Enable AI-powered auto-translation</Label>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Translation Quality</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure quality thresholds and review processes.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quality-threshold">Quality Threshold (%)</Label>
                      <Input
                        id="quality-threshold"
                        type="number"
                        min="0"
                        max="100"
                        defaultValue="80"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quality-threshold">Auto-Review Threshold (%)</Label>
                      <Input
                        id="review-threshold"
                        type="number"
                        min="0"
                        max="100"
                        defaultValue="90"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Settings
                  </Button>
                  <Button variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset to Defaults
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
