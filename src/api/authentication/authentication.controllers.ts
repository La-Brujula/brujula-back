import {
  IAccountDTO,
  IAuthenticationRequestBody,
  IAuthenticationResponseBody,
} from '@/models/authentication/authentication';
import { sendEmail } from '@/providers/Emailer';
import Logger from '@/providers/Logger';
import AuthenticationService from '@/services/authentication/AuthenticationService';
import { ServiceResponse } from '@/shared/classes/serviceResponse';
import { handleAsync } from '@/shared/utils/sendError';
import { sendResponse } from '@/shared/utils/sendResponse';
import { Request, Response } from 'express';
import { Service } from 'typedi';

@Service()
export default class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  public logIn = handleAsync(async (req: Request, res: Response) => {
    const userInput: IAuthenticationRequestBody = req.body;
    const accountsLoginResponse: ServiceResponse<IAuthenticationResponseBody> =
      await this.authService.logIn(userInput);
    if (!accountsLoginResponse.isSuccess) {
      sendResponse(res, accountsLoginResponse);
    }
    Logger.debug('AuthenticationController | LogIn | End');
    return sendResponse(res, accountsLoginResponse);
  });

  public signUp = handleAsync(async (req: Request, res: Response) => {
    Logger.debug('AuthenticationController | SignUp | Start');
    const userInput: IAuthenticationRequestBody = req.body;
    const accountsSignUpResponse: ServiceResponse<IAuthenticationResponseBody> =
      await this.authService.addAccount(userInput);
    if (!accountsSignUpResponse.isSuccess) {
      sendResponse(res, accountsSignUpResponse);
    }
    Logger.debug('AuthenticationController | SignUp | End');
    return sendResponse(res, accountsSignUpResponse);
  });

  public deleteAccount = handleAsync(async (req: Request, res: Response) => {
    Logger.debug('AuthenticationController | DeleteAccount | Start');
    const accountsDeleteAccountResponse: ServiceResponse<boolean> =
      await this.authService.deleteAccount(req.user);
    if (!accountsDeleteAccountResponse.isSuccess) {
      sendResponse(res, accountsDeleteAccountResponse);
    }
    Logger.debug('AuthenticationController | DeleteAccount | End');
    return sendResponse(res, accountsDeleteAccountResponse);
  });

  public sendPasswordReset = handleAsync(async (req: Request, res: Response) => {
    const accountsPasswordResetResponse = await this.authService.createPasswordResetPin(
      req.user.email
    );

    await sendEmail(req.user.email, 'Reinicia tu contraseña', {
      template: 'passwordReset',
      context: {
        passwordResetToken: accountsPasswordResetResponse.getValue(),
      },
    });
    return sendResponse(res, accountsPasswordResetResponse);
  });

  public resetPassword = handleAsync(async (req: Request, res: Response) => {
    const { password, code } = req.body;
    const accountsPasswordResetResponse = await this.authService.changePassword(
      code,
      password,
      req.user.email
    );

    return sendResponse(res, accountsPasswordResetResponse);
  });

  public me = handleAsync(async (req: Request, res: Response) => {
    Logger.debug('AuthenticationController | Me | Start');
    const accountMeResponse: ServiceResponse<IAccountDTO> = await this.authService.getUser(
      req.user.email
    );
    if (!accountMeResponse.isSuccess) {
      sendResponse(res, accountMeResponse);
    }
    Logger.debug('AuthenticationController | Me | End');
    return sendResponse(res, accountMeResponse);
  });
}
