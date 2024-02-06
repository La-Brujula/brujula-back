import { Router } from 'express';
import ProfileController from './profile.controllers';
import Container from 'typedi';
import handleValidationErrors from '@/shared/utils/handleValidationErrors';
import authenticateRequest from '@/shared/middleware/authenticateRequest';
import {
  bodyMatchesSearchQuery,
  validatePagination,
  validateProfileCreation,
  validateProfileUpdate,
} from './profile.validators';
import { handleAsync } from '@/shared/utils/sendError';

const notSelf = handleAsync((req, _, next) => {
  if (req.user.ProfileId == req.params.profileId) throw Error("Can't affect self");
  return next();
});

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

  router
    .route('/me')
    .all(authenticateRequest)
    .get(profileController.getUserProfile)
    .patch(validateProfileUpdate, handleValidationErrors, profileController.updateMe);

  router
    .route('/:profileId/recommendations')
    .all(authenticateRequest, notSelf)
    .post(profileController.recommendProfile)
    .delete(profileController.revokeRecommendation);

  router.get('/:profileId', profileController.attachParamToUser, profileController.getUserProfile);
};
