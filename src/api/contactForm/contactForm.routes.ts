import { Router } from 'express';
import Container from 'typedi';
import { body } from 'express-validator';
import AuthenticationController from './contactForm.controllers';
import handleValidationErrors from '@/shared/utils/handleValidationErrors';

const bodyMatchesContactForm = () => [
  body('subject').isString(),
  body('name').isString(),
  body('email').isEmail(),
  body('message')
    .isString()
    .isLength({ max: 512 })
    .withMessage('The message must be under 512 characters'),
];

const router: Router = Router();
export default (app: Router) => {
  app.use('/contact', router);

  const authController = Container.get(AuthenticationController);

  router.post(
    '/',
    bodyMatchesContactForm(),
    handleValidationErrors,
    authController.sendContactEmail
  );
};
