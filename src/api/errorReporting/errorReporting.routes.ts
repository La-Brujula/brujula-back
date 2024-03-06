import { Router } from 'express';
import handleValidationErrors from '@/shared/utils/handleValidationErrors';
import { bodyMatchesErrorReporting } from './errorReporting.validators';
import Container from 'typedi';
import ErrorReportingController from './errorReporting.controllers';

const router: Router = Router();
export default (app: Router) => {
  app.use('/reportError', router);

  const errorReportingController = Container.get(ErrorReportingController);

  router.post(
    '/',
    bodyMatchesErrorReporting,
    handleValidationErrors,
    errorReportingController.reportError
  );
};
