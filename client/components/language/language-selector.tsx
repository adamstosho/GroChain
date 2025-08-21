"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Globe, Check, ChevronDown } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { toast } from "sonner"

interface LanguageSelectorProps {
  variant?: "button" | "compact" | "menu"
  showLabel?: boolean
  className?: string
}

export function LanguageSelector({ 
  variant = "button", 
  showLabel = true, 
  className = "" 
}: LanguageSelectorProps) {
  const { currentLanguage, languages, setLanguage, loading } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const currentLang = languages.find(lang => lang.code === currentLanguage)

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await setLanguage(languageCode)
      const selectedLang = languages.find(lang => lang.code === languageCode)
      toast.success(`Language changed to ${selectedLang?.name || languageCode}`)
      setIsOpen(false)
    } catch (error) {
      toast.error("Failed to change language")
    }
  }

  if (variant === "compact") {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`gap-2 ${className}`}
            disabled={loading}
          >
            <Globe className="h-4 w-4" />
            <span className="text-sm font-medium">
              {currentLang?.flag} {currentLang?.code.toUpperCase()}
            </span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className="flex items-center justify-between gap-2 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{language.flag}</span>
                <span className="text-sm">{language.name}</span>
              </div>
              {currentLanguage === language.code && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (variant === "menu") {
    return (
      <div className={`space-y-2 ${className}`}>
        {showLabel && (
          <label className="text-sm font-medium text-foreground">
            Language
          </label>
        )}
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between"
              disabled={loading}
            >
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>{currentLang?.flag} {currentLang?.name}</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full">
            {languages.map((language) => (
              <DropdownMenuItem
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className="flex items-center justify-between gap-2 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{language.flag}</span>
                  <div>
                    <p className="text-sm font-medium">{language.name}</p>
                    <p className="text-xs text-muted-foreground">{language.nativeName}</p>
                  </div>
                </div>
                {currentLanguage === language.code && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && (
        <label className="text-sm font-medium text-foreground">
          Language / Ede / Harshe / Asụsụ
        </label>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {languages.map((language) => (
          <motion.div
            key={language.code}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant={currentLanguage === language.code ? "default" : "outline"}
              size="sm"
              className="w-full justify-start gap-2 h-auto p-3"
              onClick={() => handleLanguageChange(language.code)}
              disabled={loading}
            >
              <span className="text-lg">{language.flag}</span>
              <div className="text-left">
                <p className="text-sm font-medium">{language.name}</p>
                <p className="text-xs opacity-75">{language.nativeName}</p>
              </div>
              {language.isDefault && (
                <Badge variant="secondary" className="ml-auto">
                  Default
                </Badge>
              )}
            </Button>
          </motion.div>
        ))}
      </div>
      
      {languages.length === 0 && !loading && (
        <div className="text-center py-4 text-muted-foreground">
          <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No languages available</p>
        </div>
      )}
    </div>
  )
}

export default LanguageSelector
