import { Request, Response } from 'express';
import { TranslationService } from '../services/translation.service';
import { logger } from '../index';
import Joi from 'joi';

export class LanguageController {
  /**
   * Get supported languages
   * GET /api/languages
   */
  static async getSupportedLanguages(req: Request, res: Response) {
    try {
      const languages = TranslationService.getSupportedLanguages();
      const defaultLanguage = TranslationService.getDefaultLanguage();

      const languageDetails = languages.map(lang => ({
        code: lang,
        name: this.getLanguageName(lang),
        nativeName: this.getNativeLanguageName(lang),
        isDefault: lang === defaultLanguage,
        flag: this.getLanguageFlag(lang)
      }));

      return res.status(200).json({
        status: 'success',
        data: {
          languages: languageDetails,
          defaultLanguage,
          totalLanguages: languages.length
        }
      });

    } catch (error) {
      logger.error('Failed to get supported languages: %s', (error as Error).message);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get supported languages'
      });
    }
  }

  /**
   * Get translations for specific keys
   * POST /api/languages/translations
   */
  static async getTranslations(req: Request, res: Response) {
    try {
      const { error, value } = Joi.object({
        keys: Joi.array().items(Joi.string()).required(),
        language: Joi.string().optional()
      }).validate(req.body);

      if (error) {
        return res.status(400).json({
          status: 'error',
          message: error.details[0].message
        });
      }

      const { keys, language } = value;
      const targetLanguage = language || req.language || 'en';

      // Validate language
      if (!TranslationService.isLanguageSupported(targetLanguage)) {
        return res.status(400).json({
          status: 'error',
          message: 'Unsupported language',
          supportedLanguages: TranslationService.getSupportedLanguages()
        });
      }

      // Get translations for requested keys
      const translations: Record<string, string> = {};
      keys.forEach((key: string) => {
        translations[key] = TranslationService.translate(key as any, targetLanguage);
      });

      return res.status(200).json({
        status: 'success',
        data: {
          language: targetLanguage,
          translations,
          totalKeys: Object.keys(translations).length
        }
      });

    } catch (error) {
      logger.error('Failed to get translations: %s', (error as Error).message);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get translations'
      });
    }
  }

  /**
   * Get all translations for a specific language
   * GET /api/languages/translations/:language
   */
  static async getAllTranslationsForLanguage(req: Request, res: Response) {
    try {
      const { language } = req.params;

      if (!TranslationService.isLanguageSupported(language)) {
        return res.status(400).json({
          status: 'error',
          message: 'Unsupported language',
          supportedLanguages: TranslationService.getSupportedLanguages()
        });
      }

      // Get all translation keys
      const allKeys: string[] = [
        'welcome', 'login', 'register', 'logout', 'email', 'password', 'phone',
        'forgot_password', 'reset_password', 'verify_email', 'success', 'error',
        'loading', 'save', 'cancel', 'edit', 'delete', 'view', 'create', 'update',
        'dashboard', 'harvest', 'marketplace', 'orders', 'payments', 'analytics',
        'settings', 'profile', 'harvest_logged', 'crop_type', 'quantity', 'date',
        'location', 'batch_id', 'qr_code', 'product', 'price', 'seller', 'buy_now',
        'add_to_cart', 'out_of_stock', 'order_placed', 'order_confirmed',
        'order_shipped', 'order_delivered', 'order_cancelled', 'payment_successful',
        'payment_failed', 'payment_pending', 'amount', 'currency', 'notification',
        'message', 'alert', 'info', 'warning', 'something_went_wrong', 'try_again',
        'network_error', 'server_error', 'validation_error', 'data_saved',
        'data_updated', 'data_deleted', 'operation_successful', 'required_field',
        'invalid_email', 'password_too_short', 'phone_invalid', 'offline_mode',
        'sync_pending', 'sync_completed', 'sync_failed', 'data_queued'
      ];

      // Get translations for all keys
      const translations: Record<string, string> = {};
      allKeys.forEach(key => {
        translations[key] = TranslationService.translate(key as any, language);
      });

      return res.status(200).json({
        status: 'success',
        data: {
          language,
          translations,
          totalKeys: Object.keys(translations).length,
          languageInfo: {
            name: this.getLanguageName(language),
            nativeName: this.getNativeLanguageName(language),
            flag: this.getLanguageFlag(language)
          }
        }
      });

    } catch (error) {
      logger.error('Failed to get all translations: %s', (error as Error).message);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get translations'
      });
    }
  }

  /**
   * Get language information
   * GET /api/languages/:language
   */
  static async getLanguageInfo(req: Request, res: Response) {
    try {
      const { language } = req.params;

      if (!TranslationService.isLanguageSupported(language)) {
        return res.status(400).json({
          status: 'error',
          message: 'Unsupported language',
          supportedLanguages: TranslationService.getSupportedLanguages()
        });
      }

      const languageInfo = {
        code: language,
        name: this.getLanguageName(language),
        nativeName: this.getNativeLanguageName(language),
        flag: this.getLanguageFlag(language),
        isDefault: language === TranslationService.getDefaultLanguage(),
        direction: 'ltr', // All supported languages are left-to-right
        dateFormat: this.getDateFormat(language),
        numberFormat: this.getNumberFormat(language),
        currency: this.getCurrency(language)
      };

      return res.status(200).json({
        status: 'success',
        data: languageInfo
      });

    } catch (error) {
      logger.error('Failed to get language info: %s', (error as Error).message);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get language information'
      });
    }
  }

  /**
   * Update user language preference
   * PUT /api/languages/preference
   */
  static async updateLanguagePreference(req: Request, res: Response) {
    try {
      const { error, value } = Joi.object({
        language: Joi.string().required(),
        userId: Joi.string().required()
      }).validate(req.body);

      if (error) {
        return res.status(400).json({
          status: 'error',
          message: error.details[0].message
        });
      }

      const { language, userId } = value;

      if (!TranslationService.isLanguageSupported(language)) {
        return res.status(400).json({
          status: 'error',
          message: 'Unsupported language',
          supportedLanguages: TranslationService.getSupportedLanguages()
        });
      }

      // In a real implementation, this would update the user's language preference in the database
      // For now, just log the preference change
      logger.info(`User ${userId} language preference updated to ${language}`);

      return res.status(200).json({
        status: 'success',
        message: 'Language preference updated successfully',
        data: {
          userId,
          language,
          updatedAt: new Date()
        }
      });

    } catch (error) {
      logger.error('Failed to update language preference: %s', (error as Error).message);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to update language preference'
      });
    }
  }

  /**
   * Get language statistics
   * GET /api/languages/stats
   */
  static async getLanguageStats(req: Request, res: Response) {
    try {
      const languages = TranslationService.getSupportedLanguages();
      
      // In a real implementation, this would query user language preferences from the database
      // For now, return placeholder statistics
      const stats = {
        totalLanguages: languages.length,
        mostUsedLanguage: 'en',
        languageDistribution: languages.map(lang => ({
          language: lang,
          users: Math.floor(Math.random() * 1000) + 100, // Placeholder data
          percentage: Math.floor(Math.random() * 30) + 10 // Placeholder data
        })),
        recentChanges: [],
        lastUpdated: new Date()
      };

      return res.status(200).json({
        status: 'success',
        data: stats
      });

    } catch (error) {
      logger.error('Failed to get language stats: %s', (error as Error).message);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get language statistics'
      });
    }
  }

  // Helper methods for language information
  private static getLanguageName(code: string): string {
    const names: Record<string, string> = {
      'en': 'English',
      'yo': 'Yoruba',
      'ha': 'Hausa',
      'ig': 'Igbo'
    };
    return names[code] || code;
  }

  private static getNativeLanguageName(code: string): string {
    const nativeNames: Record<string, string> = {
      'en': 'English',
      'yo': 'Yorùbá',
      'ha': 'Hausa',
      'ig': 'Igbo'
    };
    return nativeNames[code] || code;
  }

  private static getLanguageFlag(code: string): string {
    const flags: Record<string, string> = {
      'en': '🇺🇸',
      'yo': '🇳🇬',
      'ha': '🇳🇬',
      'ig': '🇳🇬'
    };
    return flags[code] || '🌍';
  }

  private static getDateFormat(code: string): string {
    const formats: Record<string, string> = {
      'en': 'MM/DD/YYYY',
      'yo': 'DD/MM/YYYY',
      'ha': 'DD/MM/YYYY',
      'ig': 'DD/MM/YYYY'
    };
    return formats[code] || 'MM/DD/YYYY';
  }

  private static getNumberFormat(code: string): string {
    const formats: Record<string, string> = {
      'en': '1,234.56',
      'yo': '1,234.56',
      'ha': '1,234.56',
      'ig': '1,234.56'
    };
    return formats[code] || '1,234.56';
  }

  private static getCurrency(code: string): string {
    const currencies: Record<string, string> = {
      'en': 'NGN',
      'yo': 'NGN',
      'ha': 'NGN',
      'ig': 'NGN'
    };
    return currencies[code] || 'NGN';
  }
}
