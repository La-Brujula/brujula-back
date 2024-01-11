export interface IAccount {
  email: string;
  password: string;
  role: string;
  passwordResetPinExpirationTime?: Date;
  passwordResetPin?: string;
  passwordRecoveryAttempts?: number;
}

export interface IAccountDTO {
  email: string;
  role: string;
}

export interface IAuthenticationRequestBody {
  email: string;
  password: string;
}

export interface IAuthenticationResponseBody {
  account: IAccountDTO;
  token: string;
}

export interface IResetPasswordRequestBody {
  email: string;
}

export interface IChangePasswordRequestBody {
  email: string;
  password: string;
  resetPin: string;
}

export interface IJwtToken {
  email: string;
  role: string;
  exp: number;
  iat: number;
}
