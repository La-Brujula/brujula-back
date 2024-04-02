import Logger from '@/providers/Logger';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { sendResponse } from './sendResponse';
import { ServiceResponse } from '../classes/serviceResponse';

export function handleAsync(asyncFunction: RequestHandler) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await asyncFunction(req, res, next);
    } catch (error: any) {
      if (res.headersSent) {
        Logger.log('error', error);
        Logger.log('error', 'Headers had been already sent');
        return;
      }
      if (!!error.errorCode) {
        Logger.log('warn', error);
        const serviceResponse = new ServiceResponse<null>(
          false,
          error.httpCode,
          error.message,
          undefined,
          error.errorCode
        );
        return sendResponse(res, serviceResponse);
      } else {
        Logger.log('error', error);
        console.error(error);

        return sendResponse(res, ServiceResponse.fail(error));
      }
    }
  };
}
