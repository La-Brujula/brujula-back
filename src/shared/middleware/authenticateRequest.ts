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
    const authHeader = req.headers.authorization;
    if (!authHeader) throw AuthenticationErrors.notLoggedIn;

    const [prefix, token] = authHeader.split(' ');

    if (prefix != 'Bearer' || !token) throw AuthenticationErrors.badToken;

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

    req.user = {
      email: accountRecord.email,
      role: accountRecord.role,
      ProfileId: accountRecord.ProfileId,
    };

    next();
  }
);

export default authenticateRequest;
