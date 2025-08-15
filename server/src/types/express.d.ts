import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        partner?: string;
      };
    }
  }
}

// Also extend the Request type directly for better compatibility
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      email: string;
      role: string;
      partner?: string;
    };
  }
}

export {};
