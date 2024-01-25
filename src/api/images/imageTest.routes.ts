import { Router } from 'express';
import Container from 'typedi';
import ImageTestControllers from './imageTest.controllers';
import { param } from 'express-validator';
import handleValidationErrors from '@/shared/utils/handleValidationErrors';

const router: Router = Router();
export default (app: Router) => {
  app.use('/img', router);

  const imageTestController = Container.get(ImageTestControllers);

  router.post('/image', imageTestController.uploadImage);
  router.get(
    '/:imageId',
    param('imageId').customSanitizer((value) => {
      return value.replace('/', '');
    }),
    handleValidationErrors,
    imageTestController.getImage
  );
};
