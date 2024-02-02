import { Application, Router } from 'express';
import config from '@/config';
import authenticationRoutes from '@/api/authentication/authentication.routes';
import imageTestRoutes from '@/api/images/imageTest.routes';
import profileRoutes from '@/api/profile/profile.routes';

class Routes {
  public setApiRoutes(_express: Application): void {
    const prefix = config.api.prefix;

    const app = Router();

    _express.use(prefix, app);

    authenticationRoutes(app);
    imageTestRoutes(app);
    profileRoutes(app);
  }
}

export default new Routes();
