import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: 'farmer' | 'partner' | 'aggregator' | 'admin' | 'buyer';
        email?: string;
      };
    }
  }
}
