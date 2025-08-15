import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
    partner?: string;
  };
}

export interface OptionalAuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    partner?: string;
  };
}

