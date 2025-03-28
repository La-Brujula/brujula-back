import { Router } from 'express';
import handleValidationErrors from '@/shared/utils/handleValidationErrors';
import { bodyMatchesErrorReporting } from './errorReporting.validators';
import Container from 'typedi';
import ErrorReportingController from './errorReporting.controllers';
import { rateLimit } from 'express-rate-limit';

const router: Router = Router();
const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 1,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
export default (app: Router) => {
  router.use(limiter);
  app.use('/reportError', router);

  const errorReportingController = Container.get(ErrorReportingController);

  router.post(
    '/',
    bodyMatchesErrorReporting,
    handleValidationErrors,
    errorReportingController.reportError
  );
};
