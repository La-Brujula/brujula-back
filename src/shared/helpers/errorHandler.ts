import { NextFunction, Request, Response } from 'express';

export class ErrorHandler extends Error {
  public statusCode: number;
  public message: string;

  constructor(statusCode: number = 500, message: string, ...params: any) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ErrorHandler);
    }

    this.statusCode = statusCode;
    this.message = message || 'Error';
  }
}

export const handleError = (err: ErrorHandler, req: Request, res: Response, _: NextFunction) => {
  const { statusCode, message } = err;
  res.status(statusCode).json({ error: message });
};
