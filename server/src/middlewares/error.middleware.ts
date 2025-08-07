import { Request, Response, NextFunction } from 'express';
import pino from 'pino';

const logger = pino();

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error(err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    code: err.status || 500,
  });
}
