import { Router } from 'express';
import Container from 'typedi';
import { body } from 'express-validator';
import authenticateRequest from '@/shared/middleware/authenticateRequest';
import EmailVerificationController from './controllers';
import rateLimit from 'express-rate-limit';
import handleValidationErrors from '@/shared/utils/handleValidationErrors';

const verifyRequestBody = [
  body('code').notEmpty().bail().isString().isLength({ min: 64, max: 64 }),
];

const router: Router = Router();
export default (app: Router) => {
  app.use('/verifyEmail', router);
  const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    limit: 1, // Limit each IP to 1 requests per `window` (here, per 1 minute).
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  });

  const emailVerificationController = Container.get(
    EmailVerificationController
  );

  router.post(
    '/send',
    limiter,
    authenticateRequest,
    emailVerificationController.sendVerificationEmail
  );
  router.post(
    '/verify',
    verifyRequestBody,
    handleValidationErrors,
    emailVerificationController.verifyEmail
  );
};
