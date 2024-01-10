import { NextFunction, Response, Router, Request } from 'express';
import AuthenticationController from './authentication.controllers';
import Container from 'typedi';
import { body } from 'express-validator';
import handleValidationErrors from '@/shared/utils/handleValidationErrors';

const bodyMatchesIAuthenticationRequest = () => [
  body('email').notEmpty().trim().isEmail(),
  body('password').isString(),
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
};
