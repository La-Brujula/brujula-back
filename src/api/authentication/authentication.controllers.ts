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
    Logger.verbose(req.id + ' | ' + 'AuthenticationController | LogIn | Start');
    const accountsLoginResponse: ServiceResponse<IAuthenticationResponseBody> =
      await this.authService.logIn(userInput);
    if (!accountsLoginResponse.isSuccess) {
      sendResponse(res, accountsLoginResponse);
    }
    Logger.verbose(req.id + ' | ' + 'AuthenticationController | LogIn | End');
    return sendResponse(res, accountsLoginResponse);
  });

  public signUp = handleAsync(async (req: Request, res: Response) => {
    Logger.verbose(
      req.id + ' | ' + 'AuthenticationController | SignUp | Start'
    );
    const userInput: IAuthenticationRequestBody = req.body;
    const accountsSignUpResponse: ServiceResponse<IAuthenticationResponseBody> =
      await this.authService.addAccount(userInput);
    Logger.verbose(req.id + ' | ' + 'AuthenticationController | SignUp | End');
    return sendResponse(res, accountsSignUpResponse);
  });

  public deleteAccount = handleAsync(async (req: Request, res: Response) => {
    Logger.verbose(
      req.id + ' | ' + 'AuthenticationController | DeleteAccount | Start'
    );
    const accountsDeleteAccountResponse: ServiceResponse<boolean> =
      await this.authService.deleteAccount(req.user);
    Logger.verbose(
      req.id + ' | ' + 'AuthenticationController | DeleteAccount | End'
    );
    return sendResponse(res, accountsDeleteAccountResponse);
  });

  public sendPasswordReset = handleAsync(
    async (req: Request, res: Response) => {
      const { email } = req.body;
      const accountsPasswordResetResponse =
        await this.authService.createPasswordResetPin(email);

      return sendResponse(res, accountsPasswordResetResponse);
    }
  );

  public resetPassword = handleAsync(async (req: Request, res: Response) => {
    const { email, password, code } = req.body;
    const accountsPasswordResetResponse = await this.authService.changePassword(
      code,
      password,
      email
    );

    return sendResponse(res, accountsPasswordResetResponse);
  });

  public me = handleAsync(async (req: Request, res: Response) => {
    Logger.verbose(req.id + ' | ' + 'AuthenticationController | Me | Start');
    const accountMeResponse: ServiceResponse<IAccountDTO> =
      await this.authService.getUser(req.user.email);
    Logger.verbose(req.id + ' | ' + 'AuthenticationController | Me | End');
    return sendResponse(res, accountMeResponse);
  });
}
