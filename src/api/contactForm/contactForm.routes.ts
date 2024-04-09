import { Router } from 'express';
import Container from 'typedi';
import { body } from 'express-validator';
import AuthenticationController from './contactForm.controllers';
import handleValidationErrors from '@/shared/utils/handleValidationErrors';
import authenticateRequest from '@/shared/middleware/authenticateRequest';

const bodyMatchesContactForm = () => [
  body('subject').isString(),
  body('name').isString(),
  body('email').isEmail().normalizeEmail(),
  body('message').isString().isLength({ max: 512 }),
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
