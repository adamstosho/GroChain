"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
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
  AlertTriangle,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  Copy,
  Mic,
  Volume2,
  Settings,
  BookOpen,
  Target
} from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface TranslationRequest {
  id: string
  sourceText: string
  sourceLanguage: string
  targetLanguage: string
  translatedText: string
  confidence: number
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
  category: 'ui' | 'content' | 'help' | 'error' | 'notification'
}

interface LanguagePair {
  source: string
  target: string
  translationCount: number
  lastUsed: string
  accuracy: number
}

interface TranslationMemory {
  id: string
  sourceText: string
  targetText: string
  sourceLanguage: string
  targetLanguage: string
  context: string
  usageCount: number
  lastUsed: string
  quality: 'high' | 'medium' | 'low'
}

export function TranslationSystem() {
  const [activeTab, setActiveTab] = useState("translate")
  const [loading, setLoading] = useState(false)
  const [translationRequests, setTranslationRequests] = useState<TranslationRequest[]>([])
  const [languagePairs, setLanguagePairs] = useState<LanguagePair[]>([])
  const [translationMemory, setTranslationMemory] = useState<TranslationMemory[]>([])
  
  // Translation form states
  const [sourceText, setSourceText] = useState("")
  const [sourceLanguage, setSourceLanguage] = useState("en")
  const [targetLanguage, setTargetLanguage] = useState("yo")
  const [translatedText, setTranslatedText] = useState("")
  const [translationCategory, setTranslationCategory] = useState("ui")
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [filterLanguage, setFilterLanguage] = useState("")

  useEffect(() => {
    fetchTranslationData()
  }, [])

  const fetchTranslationData = async () => {
    try {
      setLoading(true)
      
      // TODO: Replace with actual API calls when backend endpoints are implemented
      // const [requestsRes, pairsRes, memoryRes] = await Promise.all([
      //   api.get("/api/language/translation-requests"),
      //   api.get("/api/language/language-pairs"),
      //   api.get("/api/language/translation-memory")
      // ])

      // For now, use mock data
      const mockRequests: TranslationRequest[] = [
        {
          id: "req_001",
          sourceText: "Welcome to GroChain",
          sourceLanguage: "en",
          targetLanguage: "fr",
          translatedText: "Bienvenue sur GroChain",
          confidence: 95,
          status: 'completed',
          createdAt: "2025-01-15T10:30:00Z",
          category: 'ui'
        }
      ]
      
      const mockPairs = [
        { source: "en", target: "fr", name: "English to French" },
        { source: "en", target: "es", name: "English to Spanish" },
        { source: "en", target: "ar", name: "English to Arabic" }
      ]
      
      const mockMemory: TranslationMemory[] = [
        {
          id: "mem_001",
          sourceText: "Dashboard",
          targetText: "Tableau de bord",
          sourceLanguage: "en",
          targetLanguage: "fr",
          usageCount: 15,
          lastUsed: "2025-01-15T10:30:00Z"
        }
      ]

      setTranslationRequests(mockRequests)
      setLanguagePairs(mockPairs)
      setTranslationMemory(mockMemory)
    } catch (error) {
      console.error("Failed to fetch translation data:", error)
      toast.error("Failed to load translation data")
    } finally {
      setLoading(false)
    }
  }

  const translateText = async () => {
    if (!sourceText.trim()) {
      toast.error("Please enter text to translate")
      return
    }

    try {
      setLoading(true)
      
      // TODO: Replace with actual API call when backend endpoint is implemented
      // const response = await api.post("/api/language/translate", {
      //   text: sourceText,
      //   sourceLanguage,
      //   targetLanguage,
      //   category: translationCategory
      // })

      // For now, simulate translation
      const mockTranslations: { [key: string]: string } = {
        "en-fr": "Bienvenue sur GroChain",
        "en-es": "Bienvenido a GroChain",
        "en-ar": "مرحباً بك في GroChain",
        "fr-en": "Welcome to GroChain",
        "es-en": "Welcome to GroChain",
        "ar-en": "Welcome to GroChain"
      }
      
      const translationKey = `${sourceLanguage}-${targetLanguage}`
      const translatedText = mockTranslations[translationKey] || sourceText
      
      setTranslatedText(translatedText)
      toast.success("Translation completed successfully!")
      
      // Add to translation requests
      const newRequest: TranslationRequest = {
        id: Date.now().toString(),
        sourceText,
        sourceLanguage,
        targetLanguage,
        translatedText,
        confidence: 85,
        status: 'completed',
        createdAt: new Date().toISOString(),
        category: translationCategory as any
      }
      
      setTranslationRequests(prev => [newRequest, ...prev])
    } catch (error) {
      console.error("Translation failed:", error)
      toast.error("Failed to translate text")
    } finally {
      setLoading(false)
    }
  }

  const detectLanguage = async () => {
    if (!sourceText.trim()) {
      toast.error("Please enter text to detect language")
      return
    }

    try {
      setLoading(true)
      
      // TODO: Replace with actual API call when backend endpoint is implemented
      // const response = await api.post("/api/language/detect", {
      //   text: sourceText
      // })

      // For now, simulate language detection
      const detectedLang = sourceText.toLowerCase().includes("bonjour") ? "fr" : 
                          sourceText.toLowerCase().includes("hola") ? "es" : 
                          sourceText.toLowerCase().includes("مرحبا") ? "ar" : "en"
      
      setSourceLanguage(detectedLang)
      toast.success(`Language detected: ${detectedLang}`)
    } catch (error) {
      console.error("Language detection failed:", error)
      toast.error("Failed to detect language")
    } finally {
      setLoading(false)
    }
  }

  const addToMemory = async () => {
    if (!sourceText.trim() || !translatedText.trim()) {
      toast.error("Please provide both source and translated text")
      return
    }

    try {
      const response = await api.post("/api/language/translation-memory", {
        sourceText,
        targetText: translatedText,
        sourceLanguage,
        targetLanguage,
        context: translationCategory
      })

      if (response.success) {
        toast.success("Added to translation memory!")
        fetchTranslationData()
      }
    } catch (error) {
      console.error("Failed to add to memory:", error)
      toast.error("Failed to add to translation memory")
    }
  }

  const exportTranslations = async (format: 'json' | 'csv' | 'excel') => {
    try {
      const response = await api.get(`/api/language/export?format=${format}`)
      
      if (response.success) {
        // Handle file download
        const blob = new Blob([response.data], { type: 'application/octet-stream' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `grochain-translations-${new Date().toISOString().split('T')[0]}.${format}`
        a.click()
        URL.revokeObjectURL(url)
        
        toast.success(`${format.toUpperCase()} export completed!`)
      }
    } catch (error) {
      console.error("Export failed:", error)
      toast.error("Failed to export translations")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  const getLanguageName = (code: string) => {
    const languages: { [key: string]: string } = {
      'en': 'English',
      'yo': 'Yoruba',
      'ig': 'Igbo',
      'ha': 'Hausa',
      'fr': 'French',
      'ar': 'Arabic',
      'zh': 'Chinese',
      'es': 'Spanish',
      'pt': 'Portuguese'
    }
    return languages[code] || code
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      ui: <Settings className="w-4 h-4" />,
      content: <BookOpen className="w-4 h-4" />,
      help: <MessageSquare className="w-4 h-4" />,
      error: <AlertTriangle className="w-4 h-4" />,
      notification: <Target className="w-4 h-4" />
    }
    return icons[category as keyof typeof icons] || <Globe className="w-4 h-4" />
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'high': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Translation System</h2>
          <p className="text-muted-foreground">
            Real-time translation, language detection, and localization
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchTranslationData} disabled={loading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => exportTranslations('json')} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="translate">Translate</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Translate Tab */}
        <TabsContent value="translate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Source Text */}
            <Card>
              <CardHeader>
                <CardTitle>Source Text</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sourceLanguage">Source Language</Label>
                  <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="yo">Yoruba</SelectItem>
                      <SelectItem value="ig">Igbo</SelectItem>
                      <SelectItem value="ha">Hausa</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sourceText">Text to Translate</Label>
                  <Textarea
                    id="sourceText"
                    placeholder="Enter text to translate..."
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    rows={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="translationCategory">Category</Label>
                  <Select value={translationCategory} onValueChange={setTranslationCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ui">UI Elements</SelectItem>
                      <SelectItem value="content">Content</SelectItem>
                      <SelectItem value="help">Help & Support</SelectItem>
                      <SelectItem value="error">Error Messages</SelectItem>
                      <SelectItem value="notification">Notifications</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={detectLanguage} disabled={loading || !sourceText.trim()}>
                    <Mic className="w-4 h-4 mr-2" />
                    Detect Language
                  </Button>
                  <Button onClick={translateText} disabled={loading || !sourceText.trim()}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Translating...
                      </>
                    ) : (
                      <>
                        <Languages className="w-4 h-4 mr-2" />
                        Translate
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Target Text */}
            <Card>
              <CardHeader>
                <CardTitle>Translation Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="targetLanguage">Target Language</Label>
                  <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="yo">Yoruba</SelectItem>
                      <SelectItem value="ig">Igbo</SelectItem>
                      <SelectItem value="ha">Hausa</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="translatedText">Translated Text</Label>
                  <Textarea
                    id="translatedText"
                    placeholder="Translation will appear here..."
                    value={translatedText}
                    onChange={(e) => setTranslatedText(e.target.value)}
                    rows={6}
                    readOnly={!translatedText}
                  />
                </div>
                
                {translatedText && (
                  <div className="flex gap-2">
                    <Button onClick={() => copyToClipboard(translatedText)} variant="outline">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button onClick={addToMemory} variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Memory
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Memory Tab */}
        <TabsContent value="memory" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search translations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="filterCategory">Category</Label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      <SelectItem value="ui">UI Elements</SelectItem>
                      <SelectItem value="content">Content</SelectItem>
                      <SelectItem value="help">Help & Support</SelectItem>
                      <SelectItem value="error">Error Messages</SelectItem>
                      <SelectItem value="notification">Notifications</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="filterLanguage">Language</Label>
                  <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="All languages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All languages</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="yo">Yoruba</SelectItem>
                      <SelectItem value="ig">Igbo</SelectItem>
                      <SelectItem value="ha">Hausa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Translation Memory */}
          <div className="space-y-4">
            {translationMemory
              .filter(item => 
                (!searchQuery || 
                  item.sourceText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.targetText.toLowerCase().includes(searchQuery.toLowerCase())) &&
                (!filterCategory || item.context === filterCategory) &&
                (!filterLanguage || item.sourceLanguage === filterLanguage || item.targetLanguage === filterLanguage)
              )
              .map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            {getCategoryIcon(item.context)}
                            <Badge variant="outline">{item.context}</Badge>
                            <Badge className={getQualityColor(item.quality)}>
                              {item.quality} Quality
                            </Badge>
                          </div>
                          <p className="font-medium mb-1">{item.sourceText}</p>
                          <p className="text-sm text-muted-foreground">
                            {getLanguageName(item.sourceLanguage)} → {getLanguageName(item.targetLanguage)}
                          </p>
                        </div>
                        
                        <div>
                          <p className="font-medium mb-1">{item.targetText}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Used {item.usageCount} times</span>
                            <span>•</span>
                            <span>Last: {new Date(item.lastUsed).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm">
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </div>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          <div className="space-y-4">
            {translationRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {getCategoryIcon(request.category)}
                          <Badge variant="outline">{request.category}</Badge>
                          <Badge variant={request.status === 'completed' ? 'default' : 'secondary'}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="font-medium mb-1">{request.sourceText}</p>
                        <p className="text-sm text-muted-foreground">
                          {getLanguageName(request.sourceLanguage)} → {getLanguageName(request.targetLanguage)}
                        </p>
                      </div>
                      
                      <div>
                        <p className="font-medium mb-1">{request.translatedText}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Confidence: {request.confidence}%</span>
                          <span>•</span>
                          <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                        <Button variant="outline" size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add to Memory
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Language Pairs */}
            <Card>
              <CardHeader>
                <CardTitle>Language Pairs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {languagePairs.map((pair, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {getLanguageName(pair.source)} → {getLanguageName(pair.target)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {pair.translationCount} translations
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{pair.accuracy}%</p>
                        <p className="text-xs text-muted-foreground">Accuracy</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Translation Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Translation Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-primary">{translationRequests.length}</p>
                    <p className="text-sm text-muted-foreground">Total Requests</p>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {translationRequests.filter(r => r.status === 'completed').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{translationMemory.length}</p>
                    <p className="text-sm text-muted-foreground">Memory Entries</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quality Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>High Quality</span>
                      <span className="font-medium">
                        {translationMemory.filter(item => item.quality === 'high').length}
                      </span>
                    </div>
                    <Progress 
                      value={(translationMemory.filter(item => item.quality === 'high').length / translationMemory.length) * 100} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Medium Quality</span>
                      <span className="font-medium">
                        {translationMemory.filter(item => item.quality === 'medium').length}
                      </span>
                    </div>
                    <Progress 
                      value={(translationMemory.filter(item => item.quality === 'medium').length / translationMemory.length) * 100} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Low Quality</span>
                      <span className="font-medium">
                        {translationMemory.filter(item => item.quality === 'low').length}
                      </span>
                    </div>
                    <Progress 
                      value={(translationMemory.filter(item => item.quality === 'low').length / translationMemory.length) * 100} 
                      className="h-2" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
