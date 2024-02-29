import { NextFunction, Request, Response } from 'express';
import { handleAsync } from '../utils/sendError';
import AuthenticationErrors from '@/services/authentication/AuthenticationErrors';
import { decodeToken } from '../utils/jwtUtils';
import config from '@/config';
import Container from 'typedi';
import Database from '@/database/Database';
import { ServiceError } from '../classes/serviceError';
import Account from '@/database/schemas/Account';

const authenticateRequest = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get the Authorization header and ensure it's not empty
    const authHeader = req.headers.authorization;
    if (!authHeader) throw AuthenticationErrors.notLoggedIn;

    const [prefix, token] = authHeader.split(' ');
    // Check the right prefix is used
    if (prefix != 'Bearer' || !token) throw AuthenticationErrors.badToken;

    // Get user from token
    const decodedToken = await decodeToken(
      token,
      config.application.jwtSecret
    ).catch((err) => {
      throw new ServiceError('AE05', err, 401);
    });

    const accountRepo = (
      Container.get('Database') as Database
    ).sequelize.getRepository(Account);

    const accountRecord = await accountRepo.findByPk(decodedToken.email, {
      attributes: ['email', 'role', 'ProfileId'],
    });

    if (accountRecord === null) {
      throw new ServiceError('AE01', 'Account does not exist', 403);
    }

    // Attach the user to the request
    req.user = {
      email: accountRecord.email,
      role: accountRecord.role,
      ProfileId: accountRecord.ProfileId,
    };

    next();
  }
);

export default authenticateRequest;
