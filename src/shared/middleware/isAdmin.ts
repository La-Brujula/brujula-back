import { NextFunction, Request, Response } from 'express';
import { handleAsync } from '../utils/sendError';
import AuthenticationErrors from '@/services/authentication/AuthenticationErrors';

const isAdmin = handleAsync(async (req: Request, _: Response, next: NextFunction) => {
  if (req.user.role == 'admin') {
    return next();
  }

  throw AuthenticationErrors.insufficientPermissions;
});

export default isAdmin;
