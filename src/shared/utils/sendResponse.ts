import { Response } from 'express';
import { ServiceResponse } from '../classes/serviceResponse';

export function sendResponse(res: Response, serviceRes: ServiceResponse<any>) {
  res.status(serviceRes.httpStatus).json(serviceRes.toJson());
  return;
}
