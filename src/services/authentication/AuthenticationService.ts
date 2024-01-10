import config from '@/config';
import {
  IAuthenticationRequestBody,
  IAuthenticationResponseBody,
  IAccount,
  IAccountDTO,
} from '@/models/authentication/authentication';
import { AuthenticationRepository } from '@/repositories/AuthenticationRepository';
import { ServiceResponse } from '@/shared/classes/serviceResponse';
import argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { Inject, Service } from 'typedi';
import jwt from 'jsonwebtoken';
import { handleAsync } from '@/shared/utils/sendError';
import { AccountMapper } from '@/models/authentication/authenticationMapper';
import AuthenticationErrors from './AuthenticationErrors';
import Logger from '@/providers/Logger';

@Service()
export default class AuthenticationService {
  constructor(
    @Inject('AccountRepository') private readonly authenticationRepository: AuthenticationRepository
    // @Inject('SendGridService') private readonly sendGridService: SendGridService
  ) {}

  public async addAccount(
    newAccount: IAuthenticationRequestBody
  ): Promise<ServiceResponse<IAuthenticationResponseBody>> {
    Logger.debug('AccountService | addAccount | Start');
    if (await this.userExists(newAccount.email)) {
      throw AuthenticationErrors.existingAccount;
    }

    const salt = randomBytes(32);
    const hashedPassword = await argon2.hash(newAccount.password, { salt });

    Logger.debug('AccountService | addAccount | Creating account');
    const userRecord = await this.authenticationRepository.create({
      email: newAccount.email,
      password: hashedPassword,
    });
    Logger.debug('AccountService | addAccount | Created account');

    const user: IAccountDTO = AccountMapper.toDto(userRecord);
    const token = this.generateToken(userRecord);

    Logger.debug('AccountService | addAccount | Finished');
    return ServiceResponse.ok({ user, token });
  }

  public async logIn(
    userInput: IAuthenticationRequestBody
  ): Promise<ServiceResponse<IAuthenticationResponseBody>> {
    Logger.debug(`AccountService | signIn | Started`);
    const userRecord = await this.authenticationRepository.findByEmail(userInput.email);
    if (!userRecord) {
      throw AuthenticationErrors.accountDoesNotExist;
    }

    Logger.debug('AccountService | signIn | Checking password');

    const validPassword = await argon2.verify(userRecord.password, userInput.password);
    if (!validPassword) {
      throw AuthenticationErrors.wrongCredentials;
    }

    Logger.debug('AccountService | signIn | Password is valid!');
    const user: IAccountDTO = AccountMapper.toDto(userRecord);
    const token = this.generateToken(userRecord);

    Logger.debug(`AccountServuce | signIn | Finished`);
    return ServiceResponse.ok({ user, token });
  }

  private async userExists(userEmail: string) {
    const user = await this.authenticationRepository.findByEmail(userEmail);
    return !!user;
  }

  private generateToken(user: IAccount): string {
    try {
      Logger.info(`AccountService | generateToken | Start | Sign JWT for userId: ${user.email}`);
      const today = new Date();
      const exp = new Date(today.valueOf() + 1000 * 60 * 30);

      const tokenSecret = config.application.jwt_secret;

      if (!tokenSecret || tokenSecret.length == 0) {
        throw new Error('AccountService | generateToken | JWT | was not provided in configuration');
      }
      const token = jwt.sign(
        {
          email: user.email,
          role: user.role,
          exp: exp.getTime() / 1000,
        },
        tokenSecret
      );

      Logger.debug(`AccountService | generateToken | End | Sign JWT for userId: ${user.email}`);
      return token;
    } catch (err: any) {
      Logger.error(`AccountService | generateToken | Error: %s`, err.message);
      throw err;
    }
  }
}
