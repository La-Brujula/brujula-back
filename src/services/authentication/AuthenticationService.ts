import config from '@/config';
import {
  IAuthenticationRequestBody,
  IAuthenticationResponseBody,
  IAccountDTO,
} from '@/models/authentication/authentication';
import { AccountRepository } from '@/repositories/AuthenticationRepository';
import { ServiceResponse } from '@/shared/classes/serviceResponse';
import { Inject, Service } from 'typedi';
import { AccountMapper } from '@/models/authentication/authenticationMapper';
import AuthenticationErrors from './AuthenticationErrors';
import Logger from '@/providers/Logger';
import { generateToken, hashPassword } from '@/shared/utils/jwtUtils';

@Service()
export default class AuthenticationService {
  declare tokenSecret: string;
  constructor(
    @Inject('AccountRepository') private readonly authenticationRepository: AccountRepository
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
    Logger.debug('AccountService | addAccount | Checking if account already exists');
    if (await this.userExists(newAccount.email)) {
      throw AuthenticationErrors.existingAccount;
    }

    Logger.debug('AccountService | addAccount | Hashing password');
    const hashedPassword = hashPassword(newAccount.email, newAccount.password);

    Logger.debug('AccountService | addAccount | Creating account');
    const accountRecord = await this.authenticationRepository.create({
      email: newAccount.email,
      password: hashedPassword,
    });
    Logger.debug('AccountService | addAccount | Created account');

    const account: IAccountDTO = AccountMapper.toDto(accountRecord);
    Logger.debug('AccountService | addAccount | Generating token');
    const token = generateToken(accountRecord, this.tokenSecret);

    Logger.debug('AccountService | addAccount | Finished');
    return ServiceResponse.ok({ account, token });
  }

  public async logIn(
    userInput: IAuthenticationRequestBody
  ): Promise<ServiceResponse<IAuthenticationResponseBody>> {
    Logger.debug(`AccountService | signIn | Started`);
    const accountRecord = await this.authenticationRepository.findByEmail(userInput.email);
    if (!accountRecord) {
      throw AuthenticationErrors.accountDoesNotExist;
    }

    Logger.debug('AccountService | signIn | Checking password');

    const inputHash = hashPassword(userInput.email, userInput.password);
    if (inputHash != accountRecord.password) {
      throw AuthenticationErrors.wrongCredentials;
    }

    Logger.debug('AccountService | signIn | Password is valid!');
    const account: IAccountDTO = AccountMapper.toDto(accountRecord);
    const token = generateToken(accountRecord, this.tokenSecret);

    Logger.debug(`AccountService | signIn | Finished`);
    return ServiceResponse.ok({ account, token });
  }

  public async deleteAccount(accountInfo: IAccountDTO): Promise<ServiceResponse<boolean>> {
    Logger.debug('AccountService | deleteAccount | Start');
    Logger.debug('AccountService | deleteAccount | Checking if account exists');
    if (!(await this.userExists(accountInfo.email))) {
      throw AuthenticationErrors.accountDoesNotExist;
    }

    Logger.debug('AccountService | deleteAccount | Deleting account');
    const accountDeleted = await this.authenticationRepository.delete(accountInfo.email);
    if (!accountDeleted) {
      throw AuthenticationErrors.couldNotDeleteAccount;
    }
    Logger.debug('AccountService | deleteAccount | Deleted account');
    Logger.debug('AccountService | deleteAccount | Finished');
    return ServiceResponse.ok(accountDeleted);
  }

  public async getUser(userEmail: string): Promise<ServiceResponse<IAccountDTO>> {
    Logger.debug(`AccountService | getUser | Started`);
    const accountRecord = await this.authenticationRepository.findByEmail(userEmail);
    if (!accountRecord) {
      throw AuthenticationErrors.accountDoesNotExist;
    }
    const account: IAccountDTO = AccountMapper.toDto(accountRecord);
    return ServiceResponse.ok(account);
  }

  private async userExists(userEmail: string) {
    const user = await this.authenticationRepository.findByEmail(userEmail);
    return !!user;
  }
}
