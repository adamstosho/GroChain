"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from './api'

interface Language {
  code: string
  name: string
  nativeName: string
  isDefault: boolean
  flag: string
}

interface LanguageContextType {
  currentLanguage: string
  languages: Language[]
  translations: Record<string, string>
  setLanguage: (language: string) => void
  translate: (key: string) => string
  loading: boolean
  error: string | null
  refreshLanguages: () => Promise<void>
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState('en')
  const [languages, setLanguages] = useState<Language[]>([])
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load saved language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('grochain_language')
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage)
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split('-')[0]
      setCurrentLanguage(browserLang === 'yo' || browserLang === 'ha' || browserLang === 'ig' ? browserLang : 'en')
    }
  }, [])

  // Load supported languages on mount
  useEffect(() => {
    refreshLanguages()
  }, [])

  // Load translations when language changes
  useEffect(() => {
    if (currentLanguage) {
      loadTranslations(currentLanguage)
    }
  }, [currentLanguage])

  const refreshLanguages = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.getSupportedLanguages()
      if (response.success && response.data) {
        const languagesData = response.data.languages || []
        setLanguages(languagesData)
      }
    } catch (err) {
      console.error('Failed to load languages:', err)
      setError('Failed to load languages')
      // Set fallback languages
      setLanguages([
        { code: 'en', name: 'English', nativeName: 'English', isDefault: true, flag: '🇺🇸' },
        { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', isDefault: false, flag: '🇳🇬' },
        { code: 'ha', name: 'Hausa', nativeName: 'Hausa', isDefault: false, flag: '🇳🇬' },
        { code: 'ig', name: 'Igbo', nativeName: 'Igbo', isDefault: false, flag: '🇳🇬' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const loadTranslations = async (languageCode: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.getTranslations(languageCode)
      if (response.success && response.data) {
        setTranslations(response.data.translations || {})
      }
    } catch (err) {
      console.error('Failed to load translations:', err)
      setError('Failed to load translations')
      setTranslations({})
    } finally {
      setLoading(false)
    }
  }

  const setLanguage = async (language: string) => {
    try {
      // Save to localStorage
      localStorage.setItem('grochain_language', language)
      
      // Update current language
      setCurrentLanguage(language)
      
      // Update user preference in backend (if user is logged in)
      // This is optional and won't block the language change
      try {
        await api.updateLanguagePreference({ language })
      } catch (err) {
        console.warn('Failed to update language preference in backend:', err)
      }
    } catch (err) {
      console.error('Failed to set language:', err)
      setError('Failed to change language')
    }
  }

  const translate = (key: string): string => {
    return translations[key] || key
  }

  const value: LanguageContextType = {
    currentLanguage,
    languages,
    translations,
    setLanguage,
    translate,
    loading,
    error,
    refreshLanguages
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export { LanguageContext }
