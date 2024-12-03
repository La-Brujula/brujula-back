import Logger from '@/providers/Logger';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const zodValidationHandler: (
  zodSchema: AnyZodObject
) => RequestHandler =
  (zodSchema) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      Logger.verbose('Zod: Validating schema');
      const { body, params, query } = req;
      const result = await zodSchema.parseAsync({ body, params, query });

      req.body = result.body;
      req.params = result.params;
      req.query = result.query;
      Logger.verbose('Zod: Validation success');
      next();
      return;
    } catch (e) {
      Logger.verbose('Zod: Validation error');
      res.status(400).json({
        isSuccess: false,
        error: { errorCode: 'SE01', message: (e as ZodError).issues },
      });
    }
  };
