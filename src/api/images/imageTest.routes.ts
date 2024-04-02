import { Router } from 'express';
import Container from 'typedi';
import ImageTestControllers from './imageTest.controllers';
import { param } from 'express-validator';
import handleValidationErrors from '@/shared/utils/handleValidationErrors';
import isAdmin from '@/shared/middleware/isAdmin';

const router: Router = Router();
export default (app: Router) => {
  app.use('/img', router);

  const imageTestController = Container.get(ImageTestControllers);

  router.post('/image', isAdmin, imageTestController.uploadImage);
  router.get(
    '/:imageId',
    param('imageId').isString(),
    handleValidationErrors,
    imageTestController.getImage
  );
};
