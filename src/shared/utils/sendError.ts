import Logger from '@/providers/Logger';
import { NextFunction, Request, RequestHandler, Response } from 'express';

export function handleAsync(
  asyncFunction: RequestHandler,
  {
    handleError,
    logType,
  }: {
    handleError?: Function;
    logType?: string;
  } = {}
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await asyncFunction(req, res, next);
    } catch (error) {
      if (!!handleError) {
        handleError(error);
        return;
      }

      Logger.log(logType || 'error', error);
    }
  };
}
