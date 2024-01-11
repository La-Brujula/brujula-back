import { NextFunction, Request, Response } from 'express';
import { handleAsync } from '../utils/sendError';
import AuthenticationErrors from '@/services/authentication/AuthenticationErrors';
import { decodeToken } from '../utils/jwtUtils';
import config from '@/config';

const authenticateRequest = handleAsync((req: Request, res: Response, next: NextFunction) => {
  // Get the Authorization header and ensure it's not empty
  const authHeader = req.headers.authorization;
  if (!authHeader) throw AuthenticationErrors.notLoggedIn;

  const [prefix, token] = authHeader.split(' ');
  // Check the right prefix is used
  if (prefix != 'Bearer' || !token) throw AuthenticationErrors.badToken;

  // Get user from token
  const decodedToken = decodeToken(token, config.application.jwt_secret);

  // Attach the user to the request
  req.user = { email: decodedToken.email, role: decodedToken.role };

  next();
});

export default authenticateRequest;
