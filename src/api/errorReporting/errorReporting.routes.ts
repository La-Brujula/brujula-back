import { Router } from 'express';
import handleValidationErrors from '@/shared/utils/handleValidationErrors';
import { bodyMatchesErrorReporting } from './errorReporting.validators';
import Container from 'typedi';
import ErrorReportingController from './errorReporting.controllers';
import { rateLimit } from 'express-rate-limit';

const router: Router = Router();
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 1, // Limit each IP to 100 requests per `window` (here, per 1 minute).
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
});
export default (app: Router) => {
  router.use(limiter);
  app.use('/reportError', router);

  // Apply the rate limiting middleware to all requests.
  const errorReportingController = Container.get(ErrorReportingController);

  router.post(
    '/',
    bodyMatchesErrorReporting,
    handleValidationErrors,
    errorReportingController.reportError
  );
};
