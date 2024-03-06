import config from '@/config';
import { IErrorReport } from '@/models/errorReporting/errorReport';
import { sendEmail } from '@/providers/Emailer';
import { ServiceResponse } from '@/shared/classes/serviceResponse';
import { handleAsync } from '@/shared/utils/sendError';
import { sendResponse } from '@/shared/utils/sendResponse';
import { Request, Response } from 'express';
import { Service } from 'typedi';

@Service()
export default class ErrorReportingController {
  public reportError = handleAsync(async (req: Request, res: Response) => {
    const error: IErrorReport = req.body;
    await sendEmail(config.api.errorReportingEmail, `Error: ${error.name}`, {
      template: 'errorReport',
      context: error,
    });
    return sendResponse(res, ServiceResponse.ok('Sent'));
  });
}
