import Logger from '@/providers/Logger';
import { NextFunction, Request, RequestHandler, Response } from 'express';

export function handleAsync(asyncFunction: RequestHandler) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await asyncFunction(req, res, next);
    } catch (error: any) {
      if (!!error.errorCode) {
        Logger.log('warn', error);
        return res.status(error.httpCode).json(error.toJson());
      } else {
        Logger.log('error', error);
        return res.status(500).json(error);
      }
    }
  };
}
