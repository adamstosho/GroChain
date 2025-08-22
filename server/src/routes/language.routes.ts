import { Router } from 'express';
import { LanguageController } from '../controllers/language.controller';
import { detectLanguage, addLanguageInfo, validateLanguage } from '../middlewares/language.middleware';

const router = Router();

// Apply language detection to all language routes
router.use(detectLanguage);
router.use(addLanguageInfo);

// Get supported languages
router.get('/', LanguageController.getSupportedLanguages);

// Get translations for specific keys
router.post('/translations', LanguageController.getTranslations);

// Get all translations for a specific language
router.get('/translations/:language', validateLanguage, LanguageController.getAllTranslationsForLanguage);

// Get language information
router.get('/:language', validateLanguage, LanguageController.getLanguageInfo);

// Update user language preference (requires authentication)
router.put('/preference', LanguageController.updateLanguagePreference);

// Get language statistics
router.get('/stats', LanguageController.getLanguageStats);

// NEW ENDPOINTS - Language Advanced Features
router.get(
  '/language-pairs',
  (req, res) => {
    // TODO: Implement language pairs controller
    res.json({
      success: true,
      data: {
        pairs: [
          { source: "en", target: "fr", name: "English to French" },
          { source: "en", target: "es", name: "English to Spanish" },
          { source: "en", target: "ar", name: "English to Arabic" }
        ]
      }
    });
  }
);

router.get(
  '/translation-memory',
  (req, res) => {
    // TODO: Implement translation memory controller
    res.json({
      success: true,
      data: {
        memory: [
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
      }
    });
  }
);

router.post(
  '/translate',
  (req, res) => {
    // TODO: Implement translation controller
    const { text, sourceLanguage, targetLanguage } = req.body;
    
    // Mock translation logic
    const mockTranslations: { [key: string]: string } = {
      "en-fr": "Bienvenue sur GroChain",
      "en-es": "Bienvenido a GroChain",
      "en-ar": "مرحباً بك في GroChain",
      "fr-en": "Welcome to GroChain",
      "es-en": "Welcome to GroChain",
      "ar-en": "Welcome to GroChain"
    };
    
    const translationKey = `${sourceLanguage}-${targetLanguage}`;
    const translatedText = mockTranslations[translationKey] || text;
    
    res.json({
      success: true,
      data: {
        translatedText,
        confidence: 85
      }
    });
  }
);

router.post(
  '/detect',
  (req, res) => {
    // TODO: Implement language detection controller
    const { text } = req.body;
    
    // Mock language detection logic
    const detectedLang = text.toLowerCase().includes("bonjour") ? "fr" : 
                        text.toLowerCase().includes("hola") ? "es" : 
                        text.toLowerCase().includes("مرحبا") ? "ar" : "en";
    
    res.json({
      success: true,
      data: {
        detectedLanguage: detectedLang
      }
    });
  }
);

export default router;

