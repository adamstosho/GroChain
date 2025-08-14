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

export default router;

