import {
  IAuthenticationRequestBody,
  IAuthenticationResponseBody,
} from '@/models/authentication/authentication';
import Logger from '@/providers/Logger';
import AuthenticationService from '@/services/authentication/AuthenticationService';
import { ServiceResponse } from '@/shared/classes/serviceResponse';
import { handleAsync } from '@/shared/utils/sendError';
import { Request, Response } from 'express';
import { Inject, Service } from 'typedi';

@Service()
export default class AuthenticationController {
  constructor(
    private readonly authService: AuthenticationService
    // @Inject('SendGridService') private readonly sendGridService: SendGridService
  ) {}

  public logIn = handleAsync(async (req: Request, res: Response) => {
    const userInput: IAuthenticationRequestBody = req.body;
    const userLoginResponse: ServiceResponse<IAuthenticationResponseBody> =
      await this.authService.logIn(userInput);
    if (!userLoginResponse.isSuccess) {
      res.status(userLoginResponse.error!.httpCode).json(userLoginResponse);
    }
    Logger.debug('AuthenticationController | LogIn | End');
    return res.status(200).json(userLoginResponse);
  });

  public signUp = handleAsync(async (req: Request, res: Response) => {
    Logger.debug('AuthenticationController | SignUp | Start');
    const userInput: IAuthenticationRequestBody = req.body;
    const userSignUpResponse: ServiceResponse<IAuthenticationResponseBody> =
      await this.authService.addAccount(userInput);
    if (!userSignUpResponse.isSuccess) {
      res.status(userSignUpResponse.error!.httpCode).json(userSignUpResponse);
    }
    Logger.debug('AuthenticationController | SignUp | End');
    return res.status(200).json(userSignUpResponse);
  });
}
