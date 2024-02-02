import { NextFunction, Response, Router, Request } from 'express';
import ProfileController from './profile.controllers';
import Container from 'typedi';
import { body, query } from 'express-validator';
import handleValidationErrors from '@/shared/utils/handleValidationErrors';
import authenticateRequest from '@/shared/middleware/authenticateRequest';
import {
  bodyMatchesSearchQuery,
  validatePagination,
  validateProfileCreation,
  validateProfileUpdate,
} from './profile.validators';

const router: Router = Router();
export default (app: Router) => {
  app.use('/profiles', router);

  const profileController = Container.get(ProfileController);

  router.get(
    '/',
    bodyMatchesSearchQuery,
    validatePagination,
    handleValidationErrors,
    profileController.search
  );
  router.post('/', validateProfileCreation, handleValidationErrors, profileController.create);

  router.use(authenticateRequest);

  router
    .route('/me')
    .get(profileController.me)
    .patch(validateProfileUpdate, handleValidationErrors, profileController.updateMe);
};
