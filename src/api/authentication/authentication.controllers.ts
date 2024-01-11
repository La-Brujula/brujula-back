import {
  IAccountDTO,
  IAuthenticationRequestBody,
  IAuthenticationResponseBody,
} from '@/models/authentication/authentication';
import Logger from '@/providers/Logger';
import AuthenticationService from '@/services/authentication/AuthenticationService';
import { ServiceResponse } from '@/shared/classes/serviceResponse';
import { handleAsync } from '@/shared/utils/sendError';
import { Request, Response } from 'express';
import { Service } from 'typedi';

@Service()
export default class AuthenticationController {
  constructor(
    private readonly authService: AuthenticationService
    // @Inject('SendGridService') private readonly sendGridService: SendGridService
  ) {}

  public logIn = handleAsync(async (req: Request, res: Response) => {
    const userInput: IAuthenticationRequestBody = req.body;
    const accountsLoginResponse: ServiceResponse<IAuthenticationResponseBody> =
      await this.authService.logIn(userInput);
    if (!accountsLoginResponse.isSuccess) {
      res.status(accountsLoginResponse.error!.httpCode).json(accountsLoginResponse);
    }
    Logger.debug('AuthenticationController | LogIn | End');
    return res.status(200).json(accountsLoginResponse);
  });

  public signUp = handleAsync(async (req: Request, res: Response) => {
    Logger.debug('AuthenticationController | SignUp | Start');
    const userInput: IAuthenticationRequestBody = req.body;
    const accountsSignUpResponse: ServiceResponse<IAuthenticationResponseBody> =
      await this.authService.addAccount(userInput);
    if (!accountsSignUpResponse.isSuccess) {
      res.status(accountsSignUpResponse.error!.httpCode).json(accountsSignUpResponse);
    }
    Logger.debug('AuthenticationController | SignUp | End');
    return res.status(201).json(accountsSignUpResponse);
  });

  public deleteAccount = handleAsync(async (req: Request, res: Response) => {
    Logger.debug('AuthenticationController | DeleteAccount | Start');
    const accountsDeleteAccountResponse: ServiceResponse<boolean> =
      await this.authService.deleteAccount(req.user);
    if (!accountsDeleteAccountResponse.isSuccess) {
      res.status(accountsDeleteAccountResponse.error!.httpCode).json(accountsDeleteAccountResponse);
    }
    Logger.debug('AuthenticationController | DeleteAccount | End');
    return res.status(202).json(accountsDeleteAccountResponse);
  });

  public me = handleAsync(async (req: Request, res: Response) => {
    Logger.debug('AuthenticationController | Me | Start');
    const accountMeResponse: ServiceResponse<IAccountDTO> = await this.authService.getUser(
      req.user.email
    );
    if (!accountMeResponse.isSuccess) {
      res.status(accountMeResponse.error!.httpCode).json(accountMeResponse);
    }
    Logger.debug('AuthenticationController | Me | End');
    return res.status(200).json(accountMeResponse);
  });
}
