import { Router } from 'express';
import Container from 'typedi';
import { body } from 'express-validator';
import AuthenticationController from './authentication.controllers';
import handleValidationErrors from '@/shared/utils/handleValidationErrors';
import authenticateRequest from '@/shared/middleware/authenticateRequest';

const bodyMatchesIAuthenticationRequest = () => [
  body('email').isEmail().normalizeEmail({
    all_lowercase: true,
    gmail_lowercase: true,
    gmail_remove_dots: false,
    gmail_remove_subaddress: false,
    gmail_convert_googlemaildotcom: false,
    outlookdotcom_lowercase: true,
    outlookdotcom_remove_subaddress: false,
    yahoo_lowercase: true,
    yahoo_remove_subaddress: false,
    icloud_lowercase: true,
    icloud_remove_subaddress: false,
  }),
  body('password').notEmpty().isLength({ min: 8 }),
];

const router: Router = Router();
export default (app: Router) => {
  app.use('/auth', router);

  const authController = Container.get(AuthenticationController);

  router.post(
    '/signup',
    bodyMatchesIAuthenticationRequest(),
    body('type').isIn(['fisica', 'moral']),
    handleValidationErrors,
    authController.signUp
  );

  router.post(
    '/login',
    bodyMatchesIAuthenticationRequest(),
    handleValidationErrors,
    authController.logIn
  );

  router.post(
    '/resetPassword',
    [
      body('email').isEmail().normalizeEmail({
        all_lowercase: true,
        gmail_lowercase: true,
        gmail_remove_dots: false,
        gmail_remove_subaddress: false,
        gmail_convert_googlemaildotcom: false,
        outlookdotcom_lowercase: true,
        outlookdotcom_remove_subaddress: false,
        yahoo_lowercase: true,
        yahoo_remove_subaddress: false,
        icloud_lowercase: true,
        icloud_remove_subaddress: false,
      }),
    ],
    handleValidationErrors,
    authController.sendPasswordReset
  );
  router.patch(
    '/resetPassword',
    bodyMatchesIAuthenticationRequest(),
    body('code').isString(),
    handleValidationErrors,
    authController.resetPassword
  );

  router.use(authenticateRequest);

  router
    .route('/me')
    .get(authController.me)
    .delete(authController.deleteAccount);
};
