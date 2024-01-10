import config from '@/config';
import {
  IAuthenticationRequestBody,
  IAuthenticationResponseBody,
  IAccount,
  IAccountDTO,
  IJwtToken,
} from '@/models/authentication/authentication';
import { AuthenticationRepository } from '@/repositories/AuthenticationRepository';
import { ServiceResponse } from '@/shared/classes/serviceResponse';
import { randomBytes, createHash } from 'crypto';
import { Inject, Service } from 'typedi';
import jwt from 'jsonwebtoken';
import { AccountMapper } from '@/models/authentication/authenticationMapper';
import AuthenticationErrors from './AuthenticationErrors';
import Logger from '@/providers/Logger';

function hashPassword(username: string, password: string) {
  return createHash('sha256').update(username).update(password).digest('hex');
}

@Service()
export default class AuthenticationService {
  declare tokenSecret: string;
  constructor(
    @Inject('AccountRepository') private readonly authenticationRepository: AuthenticationRepository
    // @Inject('SendGridService') private readonly sendGridService: SendGridService
  ) {
    this.tokenSecret = config.application.jwt_secret;

    if (!this.tokenSecret || this.tokenSecret.length == 0) {
      throw new Error('AccountService | generateToken | JWT | was not provided in configuration');
    }
  }

  public async addAccount(
    newAccount: IAuthenticationRequestBody
  ): Promise<ServiceResponse<IAuthenticationResponseBody>> {
    Logger.debug('AccountService | addAccount | Start');
    if (await this.userExists(newAccount.email)) {
      throw AuthenticationErrors.existingAccount;
    }

    const hashedPassword = hashPassword(newAccount.email, newAccount.password);

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

    const inputHash = hashPassword(userInput.email, userInput.password);
    if (inputHash != userRecord.password) {
      throw AuthenticationErrors.wrongCredentials;
    }

    Logger.debug('AccountService | signIn | Password is valid!');
    const user: IAccountDTO = AccountMapper.toDto(userRecord);
    const token = this.generateToken(userRecord);

    Logger.debug(`AccountService | signIn | Finished`);
    return ServiceResponse.ok({ user, token });
  }

  private async userExists(userEmail: string) {
    const user = await this.authenticationRepository.findByEmail(userEmail);
    return !!user;
  }

  private generateToken(user: IAccount): string {
    try {
      Logger.debug(`AccountService | generateToken | Start | Sign JWT for userId: ${user.email}`);
      const token = jwt.sign(
        {
          email: user.email,
          role: user.role,
        } as IJwtToken,
        this.tokenSecret,
        {
          expiresIn: '1h',
        }
      );

      Logger.debug(`AccountService | generateToken | End | Sign JWT for userId: ${user.email}`);
      return token;
    } catch (err: any) {
      Logger.error(`AccountService | generateToken | Error: %s`, err.message);
      throw err;
    }
  }

  private decodeToken(token: string) {
    try {
      const decodedToken = jwt.verify(token, this.tokenSecret);
      if (typeof decodedToken == 'string') throw Error();
    } catch (err: any) {
      Logger.error(`AccountService | generateToken | Error: %s`, err.message);
      throw err;
    }
  }
}
