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
  user: IAccountDTO;
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
