export const ACCOUNT_ROLES = ['user', 'editor', 'manager', 'admin'] as const;
export type AccountRoleType = (typeof ACCOUNT_ROLES)[number];

export const ACCOUNT_CONTACT_METHODS = ['email', 'whatsapp'] as const;
export type AccountContactMethod = (typeof ACCOUNT_CONTACT_METHODS)[number];

export interface IAccount {
  email: string;
  password: string;
  role: AccountRoleType;
  passwordResetPinExpirationTime?: Date;
  passwordResetPin?: string;
  passwordRecoveryAttempts: number;
  ProfileId: string;
  emailVerificationPinExpirationTime?: Date;
  emailVerificationPin?: string;
  referal?: string;
  contactMethod: AccountContactMethod;
  jobNotifications: boolean;
}

export interface IUpdateAccount {
  password?: string;
  role?: AccountRoleType;
  passwordResetPinExpirationTime?: Date | null;
  passwordResetPin?: string | null;
  passwordRecoveryAttempts?: number;
  emailVerificationPinExpirationTime?: Date;
  emailVerificationPin?: string;
  contactMethod?: AccountContactMethod;
  jobNotifications: boolean;
}

export interface IAccountDTO {
  email: string;
  role: AccountRoleType;
  ProfileId: string;
  contactMethod?: AccountContactMethod;
  jobNotifications?: boolean;
}

export interface IAuthenticationRequestBody {
  email: string;
  password: string;
  type?: 'moral' | 'fisica';
}
export interface ISignupRequestBody {
  email: string;
  password: string;
  type?: 'moral' | 'fisica';
  referal?: string;
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

export interface IUpdateAccountRequest {
  contactMethod?: AccountContactMethod;
  jobNotifications: boolean;
}

export interface IJwtToken {
  email: string;
  role: string;
  ProfileId: string;
  exp: number;
  iat: number;
}
