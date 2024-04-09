import config from '@/config';
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
export default class ContactFormController {
  public sendContactEmail = handleAsync(async (req: Request, res: Response) => {
    const { subject, name, email, message } = req.body;
    sendEmail(config.api.contactEmail, 'CONTACTO ' + subject, {
      template: 'contact',
      context: {
        subject,
        name,
        email,
        message,
      },
    });
    const serviceResponse = ServiceResponse.ok(undefined, 201);
    return sendResponse(res, serviceResponse);
  });
}
