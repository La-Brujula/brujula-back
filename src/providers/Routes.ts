import { Application, Router } from 'express';
import cors from 'cors';

import config from '@/config';
import authenticationRoutes from '@/api/authentication/authentication.routes';
import imageTestRoutes from '@/api/images/imageTest.routes';
import profileRoutes from '@/api/profile/profile.routes';
import errorReportingRoutes from '@/api/errorReporting/errorReporting.routes';
import contactFormRoutes from '@/api/contactForm/contactForm.routes';

class Routes {
  public setApiRoutes(_express: Application): void {
    const prefix = config.api.prefix;

    const app = Router();

    _express.use(prefix, app);

    app.use(cors());

    authenticationRoutes(app);
    imageTestRoutes(app);
    profileRoutes(app);
    errorReportingRoutes(app);
    contactFormRoutes(app);
  }
}

export default new Routes();
