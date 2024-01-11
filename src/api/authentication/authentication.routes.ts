import { NextFunction, Response, Router, Request } from 'express';
import AuthenticationController from './authentication.controllers';
import Container from 'typedi';
import { body } from 'express-validator';
import handleValidationErrors from '@/shared/utils/handleValidationErrors';
import authenticateRequest from '@/shared/middleware/authenticateRequest';

const bodyMatchesIAuthenticationRequest = () => [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().isLength({ min: 8 }),
];

const router: Router = Router();
export default (app: Router) => {
  app.use('/auth', router);

  const authController = Container.get(AuthenticationController);

  router.post(
    '/signup',
    bodyMatchesIAuthenticationRequest(),
    handleValidationErrors,
    async (req: Request, res: Response, next: NextFunction) => {
      await authController.signUp(req, res, next);
    }
  );

  router.post(
    '/login',
    bodyMatchesIAuthenticationRequest(),
    handleValidationErrors,
    async (req: Request, res: Response, next: NextFunction) => {
      await authController.logIn(req, res, next);
    }
  );

  router
    .route('/me')
    .all(authenticateRequest)
    .get(authController.me)
    .delete(authController.deleteAccount);
};
