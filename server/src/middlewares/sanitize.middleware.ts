import { Request, Response, NextFunction } from 'express';

function isPlainObject(value: unknown): value is Record<string, any> {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function sanitizeValue(value: any): any {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (isPlainObject(value)) {
    const sanitized: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      // Disallow keys that start with $ or contain a dot
      if (key.startsWith('$') || key.includes('.')) continue;
      sanitized[key] = sanitizeValue(val);
    }
    return sanitized;
  }
  return value;
}

export function sanitizeRequest(req: Request, _res: Response, next: NextFunction) {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
}




