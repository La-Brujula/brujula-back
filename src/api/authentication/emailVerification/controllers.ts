import Logger from '@/providers/Logger';
import AuthenticationService from '@/services/authentication/AuthenticationService';
import { handleAsync } from '@/shared/utils/sendError';
import { sendResponse } from '@/shared/utils/sendResponse';
import { Request, Response } from 'express';
import { Service } from 'typedi';

@Service()
export default class EmailVerificationController {
  constructor(private readonly authService: AuthenticationService) {}

  public sendVerificationEmail = handleAsync(
    async (req: Request, res: Response) => {
      Logger.verbose(
        `${req.id} | AuthenticationController | SendEmailVerification | Start`
      );
      const email = req.user.email;
      const sendVerificationEmailResponse =
        await this.authService.sendVerificationEmail(email);
      if (!sendVerificationEmailResponse.isSuccess) {
        sendResponse(res, sendVerificationEmailResponse);
      }
      Logger.verbose(
        `${req.id} | AuthenticationController | SendEmailVerification | End`
      );
      return sendResponse(res, sendVerificationEmailResponse);
    }
  );

  public verifyEmail = handleAsync(async (req: Request, res: Response) => {
    Logger.verbose(
      req.id + ' | AuthenticationController | VerifyEmail | Start'
    );
    const { code, email } = req.body as { code: string; email: string };
    const verifyEmailResponse = await this.authService.verifyEmail(email, code);
    Logger.verbose(req.id + ' | AuthenticationController | VerifyEmail | End');
    return sendResponse(res, verifyEmailResponse);
  });
}
