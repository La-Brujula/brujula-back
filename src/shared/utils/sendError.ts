import Logger from '@/providers/Logger';
import { NextFunction, Request, RequestHandler, Response } from 'express';

export function handleAsync(asyncFunction: RequestHandler) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await asyncFunction(req, res, next);
    } catch (error: any) {
      let logType;
      if (!!error.errorCode) {
        logType = 'warn';
        res.status(error.httpCode).json(error.toJson());
      } else {
        logType = 'error';
        res.status(500).json(error);
      }
      Logger.log(logType || 'error', error);
      return;
    }
  };
}
