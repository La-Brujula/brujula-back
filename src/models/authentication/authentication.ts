export type AccountRoleTypes = 'user' | 'editor' | 'manager' | 'admin';

export interface IAccount {
  email: string;
  password: string;
  role: AccountRoleTypes;
  passwordResetPinExpirationTime?: Date;
  passwordResetPin?: string;
  passwordRecoveryAttempts: number;
  ProfileId: string;
}

export interface IUpdateAccount {
  password?: string;
  role?: AccountRoleTypes;
  passwordResetPinExpirationTime?: Date | null;
  passwordResetPin?: string | null;
  passwordRecoveryAttempts?: number;
}

export interface IAccountDTO {
  email: string;
  role: AccountRoleTypes;
  ProfileId: string;
}

export interface IAuthenticationRequestBody {
  email: string;
  password: string;
  type?: 'moral' | 'fisica';
}

export interface IAuthenticationResponseBody {
  account: IAccountDTO;
  token: string;
}

export interface IResetPasswordRequestBody {
  email: string;
}

export interface IChangePasswordRequestBody {
  password: string;
  resetPin: string;
}

export interface IJwtToken {
  email: string;
  role: string;
  ProfileId: string;
  exp: number;
  iat: number;
}
