import { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  logger.error('Unhandled server error.', { path: req.path, method: req.method });
  res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: 'Resource not found.' });
}
