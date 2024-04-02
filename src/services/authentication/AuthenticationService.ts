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
import { randomBytes } from 'crypto';
import { sendEmail } from '@/providers/Emailer';
import { ProfileRepository } from '@/repositories/ProfileRepository';

@Service()
export default class AuthenticationService {
  declare tokenSecret: string;
  constructor(
    @Inject('AccountRepository')
    private readonly authenticationRepository: AccountRepository,
    @Inject('ProfileRepository')
    private readonly profileRepository: ProfileRepository
  ) {
    this.tokenSecret = config.application.jwtSecret;

    if (!this.tokenSecret || this.tokenSecret.length == 0) {
      throw new Error(
        'AccountService | generateToken | JWT | was not provided in configuration'
      );
    }
  }

  public async addAccount(
    newAccount: IAuthenticationRequestBody
  ): Promise<ServiceResponse<IAuthenticationResponseBody>> {
    Logger.debug('AccountService | addAccount | Start');
    Logger.debug(
      'AccountService | addAccount | Checking if account already exists'
    );
    if (await this.userExists(newAccount.email)) {
      throw AuthenticationErrors.existingAccount;
    }

    Logger.debug('AccountService | addAccount | Hashing password');
    const hashedPassword = hashPassword(newAccount.email, newAccount.password);

    let profile = await this.getProfileIdIfExists(newAccount.email);

    if (profile === null) {
      profile = await this.profileRepository.create({
        email: newAccount.email,
        type: newAccount.type || 'fisica',
      });
    }

    Logger.debug('AccountService | addAccount | Creating account');
    const accountRecord = await this.authenticationRepository.create(
      {
        email: newAccount.email,
        password: hashedPassword,
        type: newAccount.type,
      },
      profile
    );
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
    const accountRecord = await this.authenticationRepository.findByEmail(
      userInput.email
    );
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

  public async deleteAccount(
    accountInfo: IAccountDTO
  ): Promise<ServiceResponse<boolean>> {
    Logger.debug('AccountService | deleteAccount | Start');
    Logger.debug('AccountService | deleteAccount | Checking if account exists');
    if (!(await this.userExists(accountInfo.email))) {
      throw AuthenticationErrors.accountDoesNotExist;
    }

    Logger.debug('AccountService | deleteAccount | Deleting account');
    const accountDeleted = await this.authenticationRepository.delete(
      accountInfo.email
    );
    const profileDeleted = await this.profileRepository.delete(
      accountInfo.ProfileId
    );
    if (!accountDeleted || !profileDeleted) {
      throw AuthenticationErrors.couldNotDeleteAccount;
    }
    Logger.debug('AccountService | deleteAccount | Deleted account');
    Logger.debug('AccountService | deleteAccount | Finished');
    return new ServiceResponse(accountDeleted, 202);
  }

  public async getUser(
    userEmail: string
  ): Promise<ServiceResponse<IAccountDTO>> {
    Logger.debug(`AccountService | getUser | Started`);
    Logger.debug('AccountService | getUser | Getting the user by email');
    const accountRecord =
      await this.authenticationRepository.findByEmail(userEmail);
    if (!accountRecord) {
      throw AuthenticationErrors.accountDoesNotExist;
    }
    Logger.debug('AccountService | getUser | Got a user');
    const account = AccountMapper.toDto(accountRecord);
    Logger.debug('AccountService | getUser | Finished');
    return ServiceResponse.ok(account);
  }

  public async createPasswordResetPin(email: string) {
    Logger.debug('AccountService | createPasswordResetPin | Started');
    Logger.debug('AccountService | createPasswordResetPin | Getting user');
    const user = await this.authenticationRepository.findByEmail(email);

    if (!user) throw AuthenticationErrors.accountDoesNotExist;

    Logger.debug(
      'AccountService | createPasswordResetPin | Checking a new pin can be created'
    );
    if (user.passwordRecoveryAttempts == 3)
      throw AuthenticationErrors.exceededPasswordResetAttempts;

    Logger.debug('AccountService | createPasswordResetPin | Creating pin');
    const pin = randomBytes(32).toString('hex');

    Logger.debug('AccountService | createPasswordResetPin | Updating user');
    await this.authenticationRepository.update(email, {
      passwordResetPin: pin,
      passwordResetPinExpirationTime: new Date(
        new Date().valueOf() + 15 * 60 * 1000
      ),
      passwordRecoveryAttempts: user.passwordRecoveryAttempts + 1,
    });

    await sendEmail(email, 'Reinicia tu contraseña', {
      template: 'passwordReset',
      context: {
        passwordResetToken: pin,
      },
    });
    Logger.debug('AccountService | createPasswordResetPin | Finished');
    return new ServiceResponse(true, 201);
  }

  private async userExists(userEmail: string) {
    const user = await this.authenticationRepository.findByEmail(userEmail);
    return !!user;
  }

  private async getProfileIdIfExists(userEmail: string) {
    return await this.profileRepository.findByEmail(userEmail);
  }

  public async changePassword(pin: string, password: string, email: string) {
    Logger.debug('AccountService | changePassword | Started');
    const user = await this.authenticationRepository.findByEmail(email);
    Logger.debug('AccountService | changePassword | Checking user exists');
    if (user === null) {
      throw AuthenticationErrors.accountDoesNotExist;
    }
    if (user.passwordResetPin === null) {
      throw AuthenticationErrors.wrongPasswordResetToken;
    }
    Logger.debug('AccountService | changePassword | Checking pins match');
    if (pin != user.passwordResetPin) {
      throw AuthenticationErrors.wrongPasswordResetToken;
    }

    Logger.debug(
      "AccountService | changePassword | Checking pin isn't expired"
    );
    if (user.passwordResetPinExpirationTime! < new Date()) {
      throw AuthenticationErrors.passwordResetTokenExpired;
    }

    Logger.debug('AccountService | changePassword | Updating user');
    const [userUpdate] = await this.authenticationRepository.update(email, {
      password: hashPassword(email, password),
      passwordRecoveryAttempts: 0,
      passwordResetPin: null,
      passwordResetPinExpirationTime: null,
    });

    if (userUpdate == 0) throw AuthenticationErrors.couldNotChangePassword;
    Logger.debug('AccountService | changePassword | Finished');
    return ServiceResponse.ok(userUpdate);
  }
}
