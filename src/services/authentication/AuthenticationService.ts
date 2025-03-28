import config from '@/config';
import {
  IAuthenticationRequestBody,
  IAuthenticationResponseBody,
  IAccountDTO,
  ISignupRequestBody,
  IUpdateAccount,
  IAccount,
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
import { Transaction } from 'sequelize';
import Database from '@/database/Database';

@Service()
export default class AuthenticationService {
  declare tokenSecret: string;
  constructor(
    @Inject('AccountRepository')
    private readonly authenticationRepository: AccountRepository,
    @Inject('ProfileRepository')
    private readonly profileRepository: ProfileRepository,
    @Inject('Database')
    private readonly database: Database
  ) {
    this.tokenSecret = config.application.jwtSecret;

    if (!this.tokenSecret || this.tokenSecret.length == 0) {
      throw new Error(
        'AccountService | generateToken | JWT | was not provided in configuration'
      );
    }
  }

  public async addAccount(
    newAccount: ISignupRequestBody
  ): Promise<ServiceResponse<IAuthenticationResponseBody>> {
    Logger.verbose('AccountService | addAccount | Start');
    Logger.verbose(
      'AccountService | addAccount | Checking if account already exists'
    );

    const tx = await this.database.sequelize.transaction();

    if (await this.userExists(newAccount.email)) {
      throw AuthenticationErrors.existingAccount;
    }

    tx.afterCommit(() => {
      this.sendVerificationEmail(newAccount.email);
    });

    Logger.verbose('AccountService | addAccount | Hashing password');
    const hashedPassword = hashPassword(newAccount.email, newAccount.password);

    let profile = await this.getProfileIdIfExists(newAccount.email);

    if (profile === null) {
      profile = await this.profileRepository.create(
        {
          email: newAccount.email,
          type: newAccount.type || 'fisica',
        },
        tx
      );
    }

    Logger.verbose('AccountService | addAccount | Creating account');
    const accountRecord = await this.authenticationRepository.create(
      {
        email: newAccount.email,
        password: hashedPassword,
        type: newAccount.type,
        referal: newAccount.referal,
      },
      profile,
      tx
    );
    Logger.verbose('AccountService | addAccount | Created account');

    const account: IAccountDTO = AccountMapper.toDto(accountRecord);
    Logger.verbose('AccountService | addAccount | Generating token');
    const token = generateToken(accountRecord, this.tokenSecret);

    tx.commit();

    Logger.verbose('AccountService | addAccount | Finished');
    return ServiceResponse.ok({ account, token });
  }

  public async logIn(
    userInput: IAuthenticationRequestBody
  ): Promise<ServiceResponse<IAuthenticationResponseBody>> {
    Logger.verbose(`AccountService | signIn | Started`);
    const accountRecord = await this.authenticationRepository.findByEmail(
      userInput.email
    );
    if (accountRecord === null) {
      throw AuthenticationErrors.accountDoesNotExist;
    }

    Logger.verbose('AccountService | signIn | Checking password');

    const inputHash = hashPassword(userInput.email, userInput.password);
    if (inputHash != accountRecord.password) {
      throw AuthenticationErrors.wrongCredentials;
    }

    Logger.verbose('AccountService | signIn | Password is valid!');
    const token = generateToken(accountRecord, this.tokenSecret);
    const account: IAccountDTO = AccountMapper.toDto(accountRecord);

    Logger.verbose(`AccountService | signIn | Finished`);
    return ServiceResponse.ok({ account, token });
  }

  public async deleteAccount(
    accountInfo: IAccountDTO
  ): Promise<ServiceResponse<boolean>> {
    Logger.verbose('AccountService | deleteAccount | Start');
    Logger.verbose(
      'AccountService | deleteAccount | Checking if account exists'
    );

    const tx = await this.database.sequelize.transaction();

    if (!(await this.userExists(accountInfo.email))) {
      throw AuthenticationErrors.accountDoesNotExist;
    }

    Logger.verbose('AccountService | deleteAccount | Deleting account');
    const accountDeleted = await this.authenticationRepository.delete(
      accountInfo.email,
      tx
    );
    const profileDeleted = await this.profileRepository.delete(
      accountInfo.ProfileId,
      tx
    );
    if (!accountDeleted || !profileDeleted) {
      throw AuthenticationErrors.couldNotDeleteAccount;
    }
    Logger.verbose('AccountService | deleteAccount | Deleted account');
    Logger.verbose('AccountService | deleteAccount | Finished');

    tx.commit();
    return new ServiceResponse(accountDeleted, 202);
  }
  public async updateAccount(
    email: string,
    newAccountInfo: IUpdateAccount
  ): Promise<ServiceResponse<boolean>> {
    Logger.verbose('AccountService | updateAccount | Start');
    Logger.verbose(
      'AccountService | updateAccount | Checking if account exists'
    );

    const tx = await this.database.sequelize.transaction();
    const account = await this.authenticationRepository.findByEmail(email);
    if (!account) {
      throw AuthenticationErrors.accountDoesNotExist;
    }

    Logger.verbose('AccountService | updateAccount | Updating account');
    await this.authenticationRepository.update(email, newAccountInfo, tx);

    const updatedAccount =
      await this.authenticationRepository.findByEmail(email);
    if (!account) {
      throw AuthenticationErrors.accountDoesNotExist;
    }
    Logger.verbose('AccountService | updateAccount | Updated account');
    Logger.verbose('AccountService | updateAccount | Finished');

    tx.commit();
    return ServiceResponse.ok(updatedAccount, 200);
  }

  public async getUser(
    userEmail: string
  ): Promise<ServiceResponse<IAccountDTO>> {
    Logger.verbose(`AccountService | getUser | Started`);
    Logger.verbose('AccountService | getUser | Getting the user by email');
    const accountRecord =
      await this.authenticationRepository.findByEmail(userEmail);
    if (!accountRecord) {
      throw AuthenticationErrors.accountDoesNotExist;
    }
    Logger.verbose('AccountService | getUser | Got a user');
    const account = AccountMapper.toDto(accountRecord);
    Logger.verbose('AccountService | getUser | Finished');
    return ServiceResponse.ok(account);
  }

  public async createPasswordResetPin(email: string) {
    Logger.verbose('AccountService | createPasswordResetPin | Started');
    Logger.verbose('AccountService | createPasswordResetPin | Getting user');

    const tx = await this.database.sequelize.transaction();

    const user = await this.authenticationRepository.findByEmail(email);

    if (!user) {
      throw AuthenticationErrors.accountDoesNotExist;
    }

    Logger.verbose(
      'AccountService | createPasswordResetPin | Checking a new pin can be created'
    );
    if (user.passwordRecoveryAttempts == 3)
      throw AuthenticationErrors.exceededPasswordResetAttempts;

    Logger.verbose('AccountService | createPasswordResetPin | Creating pin');
    const pin = randomBytes(32).toString('hex');

    Logger.verbose('AccountService | createPasswordResetPin | Updating user');
    await this.authenticationRepository.update(
      email,
      {
        passwordResetPin: pin,
        passwordResetPinExpirationTime: new Date(
          new Date().valueOf() + 45 * 60 * 1000
        ),
        passwordRecoveryAttempts: user.passwordRecoveryAttempts + 1,
      },
      tx
    );

    const passwordResetLink = `${config.application.frontend_url}/auth/new-password?code=${pin}&email=${email}`;

    tx.afterCommit(() => {
      sendEmail(email, 'Reinicia tu contraseña', {
        template: 'passwordReset',
        context: {
          passwordResetLink: passwordResetLink,
        },
      });
    });

    tx.commit();
    Logger.verbose('AccountService | createPasswordResetPin | Finished');
    return new ServiceResponse(true, 201);
  }

  public async sendMigrateAccountEmail(email: string) {
    Logger.verbose('AccountService | sendMigrateAccountEmail | Started');
    Logger.verbose('AccountService | sendMigrateAccountEmail | Getting user');

    const tx = await this.database.sequelize.transaction();

    const user = await this.authenticationRepository.findByEmail(email);

    if (!user) {
      throw AuthenticationErrors.accountDoesNotExist;
    }

    Logger.verbose('AccountService | sendMigrateAccountEmail | Creating pin');
    const pin = randomBytes(32).toString('hex');

    Logger.verbose('AccountService | sendMigrateAccountEmail | Updating user');
    await this.authenticationRepository.update(
      email,
      {
        passwordResetPin: pin,
        passwordResetPinExpirationTime: new Date(
          new Date().valueOf() + 7 * 24 * 60 * 60 * 1000
        ),
      },
      tx
    );

    const passwordResetLink = `${config.application.frontend_url}/auth/new-password?code=${pin}&email=${email}`;

    tx.afterCommit(() => {
      sendEmail(email, 'Te damos la bienvenida a La Brújula 2024', {
        template: 'migrationNotice',
        context: {
          passwordResetLink: passwordResetLink,
        },
      });
    });

    tx.commit();
    Logger.verbose('AccountService | sendMigrateAccountEmail | Finished');
    return new ServiceResponse(true, 201);
  }

  public async sendVerificationEmail(email: string) {
    Logger.verbose('AccountService | sendVerificationEmail | Started');

    const tx = await this.database.sequelize.transaction();

    const profile = await this.authenticationRepository.findByEmail(email, tx);
    if (profile === null) {
      throw AuthenticationErrors.accountDoesNotExist;
    }

    Logger.verbose('AccountService | sendVerificationEmail | Creating pin');
    const pin = randomBytes(32).toString('hex');

    Logger.verbose('AccountService | sendVerificationEmail | Updating user');
    await this.authenticationRepository.update(
      email,
      {
        emailVerificationPin: pin,
        emailVerificationPinExpirationTime: new Date(
          new Date().valueOf() + 60 * 60 * 1000
        ),
      },
      tx
    );

    const verifyEmailLink = `${config.application.frontend_url}/auth/verify-email?code=${pin}`;

    tx.afterCommit(() => {
      sendEmail(email, 'Verifica tu correo de La Brújula', {
        template: 'emailVerification',
        context: {
          verifyEmailLink: verifyEmailLink,
        },
      });
    });

    await tx.commit();
    Logger.verbose('AccountService | sendVerificationEmail | Finished');
    return new ServiceResponse(true, 201, undefined, verifyEmailLink);
  }

  public async verifyEmail(code: string) {
    Logger.verbose('AccountService | verifyEmail | Started');
    Logger.verbose('AccountService | verifyEmail | Creating pin');

    const transaction = await this.database.sequelize.transaction();

    const account = await this.authenticationRepository.findByVerificationCode(
      code,
      transaction
    );
    if (account === null) {
      throw AuthenticationErrors.cantVerifyCodeExpiration;
    }

    const expirationTimestamp =
      account?.emailVerificationPinExpirationTime?.valueOf();

    if (expirationTimestamp === undefined) {
      throw AuthenticationErrors.cantVerifyCodeExpiration;
    }
    if (expirationTimestamp < new Date().valueOf()) {
      throw AuthenticationErrors.emailVerificationExpired;
    }

    Logger.verbose('AccountService | verifyEmail | Updating user');
    await this.authenticationRepository.update(
      account.email,
      {
        emailVerificationPin: undefined,
        emailVerificationPinExpirationTime: undefined,
      },
      transaction
    );
    await this.profileRepository.update(
      account.ProfileId,
      {
        verified: true,
      },
      transaction
    );
    Logger.verbose('AccountService | verifyEmail | Finished');

    await transaction.commit();
    return new ServiceResponse(true, 200);
  }

  private async userExists(userEmail: string) {
    const user = await this.authenticationRepository.existsByEmail(userEmail);
    return !!user;
  }

  private async getProfileIdIfExists(userEmail: string) {
    return await this.profileRepository.findByEmail(userEmail);
  }

  public async changePassword(pin: string, password: string, email: string) {
    Logger.verbose('AccountService | changePassword | Started');
    const user = await this.authenticationRepository.findByEmail(email);
    Logger.verbose('AccountService | changePassword | Checking user exists');
    if (user === null) {
      throw AuthenticationErrors.accountDoesNotExist;
    }
    if (user.passwordResetPin === null) {
      throw AuthenticationErrors.wrongPasswordResetToken;
    }
    Logger.verbose('AccountService | changePassword | Checking pins match');
    if (pin != user.passwordResetPin) {
      throw AuthenticationErrors.wrongPasswordResetToken;
    }

    Logger.verbose(
      "AccountService | changePassword | Checking pin isn't expired"
    );
    if (user.passwordResetPinExpirationTime! < new Date()) {
      throw AuthenticationErrors.passwordResetTokenExpired;
    }

    Logger.verbose('AccountService | changePassword | Updating user');
    const [userUpdate] = await this.authenticationRepository.update(email, {
      password: hashPassword(email, password),
      passwordRecoveryAttempts: 0,
      passwordResetPin: null,
      passwordResetPinExpirationTime: null,
    });

    if (userUpdate == 0) throw AuthenticationErrors.couldNotChangePassword;
    Logger.verbose('AccountService | changePassword | Finished');
    const account: IAccountDTO = AccountMapper.toDto(user);
    const token = generateToken(user, this.tokenSecret);

    return ServiceResponse.ok({ account, token });
  }
}
