import { Request, Response, NextFunction, RequestHandler } from 'express';
import Joi from 'joi';

// This function is replaced by the enhanced version below

export const validateParams = (schema: Joi.ObjectSchema): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.params);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid parameters',
        details: error.details.map(detail => detail.message),
      });
    }
    // Avoid reassigning req.params (read-only in some Express versions). Merge instead.
    Object.assign(req.params as any, value);
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid query parameters',
        details: error.details.map(detail => detail.message),
      });
    }
    // Avoid reassigning req.query (read-only getter in Express 5). Merge instead.
    Object.assign(req.query as any, value);
    next();
  };
};

export const validateRequest = (schema?: Joi.ObjectSchema, source: 'body' | 'query' | 'params' = 'body'): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    // If no schema provided, just pass through
    if (!schema) {
      return next();
    }
    
    const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
    const { error, value } = schema.validate(data);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        details: error.details.map(detail => detail.message),
      });
    }
    
    if (source === 'body') {
      Object.assign(req.body as any, value);
    } else if (source === 'query') {
      Object.assign(req.query as any, value);
    } else {
      Object.assign(req.params as any, value);
    }
    next();
  };
};

// Create a no-op middleware for when no validation is needed
export const noValidation: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  next();
};

export const validateAnalyticsFilters = (filters: any) => {
  const errors: string[] = [];
  
  if (filters.startDate && filters.endDate) {
    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      errors.push('Invalid date format');
    } else if (startDate >= endDate) {
      errors.push('Start date must be before end date');
    }
  }
  
  if (filters.period && !['daily', 'weekly', 'monthly', 'quarterly', 'yearly'].includes(filters.period)) {
    errors.push('Invalid period value');
  }
  
  if (filters.region && (typeof filters.region !== 'string' || filters.region.length < 2 || filters.region.length > 100)) {
    errors.push('Invalid region value');
  }
  
  if (filters.partnerId && !/^[0-9a-fA-F]{24}$/.test(filters.partnerId)) {
    errors.push('Invalid partner ID format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
