import { NextFunction, Request, Response } from 'express';
import { matchedData, validationResult } from 'express-validator';

export default function handleValidationErrors(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const result = validationResult(req);

  if (result.isEmpty()) {
    req.body = matchedData(req);
    return next();
  }
  res.status(400).json({
    isSuccess: false,
    error: { errorCode: 'SE01', message: result.array() },
  });
}
