import { Request, Response, NextFunction } from 'express';
import { TranslationService } from '../services/translation.service';

// Extend Express Request interface to include language
declare global {
  namespace Express {
    interface Request {
      language: string;
      userLanguage: string;
    }
  }
}

/**
 * Language detection middleware
 * Detects user language from headers, query params, or user preferences
 * Sets req.language and req.userLanguage for use in controllers
 */
export const detectLanguage = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Priority order for language detection:
    // 1. Query parameter (explicit user choice)
    // 2. User preference from database (if authenticated)
    // 3. Accept-Language header
    // 4. Default language

    let detectedLanguage = process.env.DEFAULT_LANGUAGE || 'en';
    const supportedLanguages = TranslationService.getSupportedLanguages();

    // 1. Check query parameter first (highest priority)
    if (req.query.lang && typeof req.query.lang === 'string') {
      const queryLang = req.query.lang.toLowerCase();
      if (TranslationService.isLanguageSupported(queryLang)) {
        detectedLanguage = queryLang;
      }
    }
    // 2. Check Accept-Language header
    else if (req.headers['accept-language']) {
      const acceptLanguage = req.headers['accept-language'];
      const preferredLanguage = parseAcceptLanguage(acceptLanguage, supportedLanguages);
      if (preferredLanguage) {
        detectedLanguage = preferredLanguage;
      }
    }

    // Set language on request object
    req.language = detectedLanguage;
    req.userLanguage = detectedLanguage;

    // Add language info to response headers for frontend
    res.setHeader('X-App-Language', detectedLanguage);
    res.setHeader('X-Supported-Languages', supportedLanguages.join(','));

    next();
  } catch (error) {
    // Fallback to default language if detection fails
    req.language = process.env.DEFAULT_LANGUAGE || 'en';
    req.userLanguage = process.env.DEFAULT_LANGUAGE || 'en';
    next();
  }
};

/**
 * Parse Accept-Language header and find best supported language
 * @param acceptLanguage - Accept-Language header value
 * @param supportedLanguages - Array of supported language codes
 * @returns Best matching language code or null
 */
function parseAcceptLanguage(acceptLanguage: string, supportedLanguages: string[]): string | null {
  try {
    // Parse Accept-Language header (e.g., "en-US,en;q=0.9,yo;q=0.8")
    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const [code, quality] = lang.trim().split(';q=');
        return {
          code: code.split('-')[0].toLowerCase(), // Extract primary language code
          quality: quality ? parseFloat(quality) : 1.0
        };
      })
      .sort((a, b) => b.quality - a.quality); // Sort by quality (highest first)

    // Find first supported language
    for (const lang of languages) {
      if (supportedLanguages.includes(lang.code)) {
        return lang.code;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Language validation middleware
 * Ensures requested language is supported
 */
export const validateLanguage = (req: Request, res: Response, next: NextFunction) => {
  const requestedLang = req.query.lang || req.headers['accept-language'];
  
  if (requestedLang && !TranslationService.isLanguageSupported(requestedLang as string)) {
    return res.status(400).json({
      status: 'error',
      message: 'Unsupported language',
      supportedLanguages: TranslationService.getSupportedLanguages(),
      defaultLanguage: TranslationService.getDefaultLanguage()
    });
  }

  next();
};

/**
 * Force language middleware (for testing or admin purposes)
 * Overrides all other language detection
 */
export const forceLanguage = (language: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (TranslationService.isLanguageSupported(language)) {
      req.language = language;
      req.userLanguage = language;
      res.setHeader('X-App-Language', language);
    }
    next();
  };
};

/**
 * Language info middleware
 * Adds language information to response
 */
export const addLanguageInfo = (req: Request, res: Response, next: NextFunction) => {
  // Add language info to response locals for use in templates
  res.locals.language = req.language;
  res.locals.supportedLanguages = TranslationService.getSupportedLanguages();
  res.locals.defaultLanguage = TranslationService.getDefaultLanguage();
  
  next();
};

