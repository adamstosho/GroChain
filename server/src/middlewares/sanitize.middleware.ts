import { Request, Response, NextFunction } from 'express';

function isPlainObject(value: unknown): value is Record<string, any> {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function sanitizeInPlace(value: any): any {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) {
      value[i] = sanitizeInPlace(value[i]);
    }
    return value;
  }
  if (isPlainObject(value)) {
    for (const key of Object.keys(value)) {
      // Disallow keys that start with $ or contain a dot
      if (key.startsWith('$') || key.includes('.')) {
        delete value[key];
        continue;
      }
      value[key] = sanitizeInPlace(value[key]);
    }
    return value;
  }
  return value;
}

export function sanitizeRequest(req: Request, _res: Response, next: NextFunction) {
  if (req.body && (isPlainObject(req.body) || Array.isArray(req.body))) {
    sanitizeInPlace(req.body);
  }
  // Do not reassign req.query or req.params (getter-only in Express 5); mutate instead
  if (req.query && (isPlainObject(req.query) || Array.isArray(req.query))) {
    sanitizeInPlace(req.query);
  }
  if (req.params && (isPlainObject(req.params) || Array.isArray(req.params))) {
    sanitizeInPlace(req.params);
  }
  next();
}

