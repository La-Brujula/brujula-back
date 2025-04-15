import express, { RequestHandler } from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import requestLog from '@/shared/helpers/requestLogging';
import { handleError } from '@/shared/helpers/errorHandler';
import Logger from './Logger';
import Routes from './Routes';
import config from '@/config';
import { randomBytes } from 'crypto';

class Express {
  public express: express.Application;

  constructor() {
    this.express = express();
    this.setMiddleware();
  }

  setAppHealthCheck() {
    this.express.get('/status', (req, res) => {
      res.sendStatus(200);
    });
  }

  setMiddleware() {
    this.express.set('trust proxy', true);
    this.express.use(cors({ credentials: true, preflightContinue: true }));
    this.express.use(express.json({ limit: '512kb' }));
    this.express.use(express.urlencoded({ extended: true }));
    // @ts-expect-error
    this.express.use(compression());
    this.express.use(helmet({ contentSecurityPolicy: false, xssFilter: true }));
    this.express.use(morgan(requestLog));
    this.express.use(
      // @ts-expect-error
      fileUpload({
        createParentPath: true,
        limits: {
          fileSize: 10 * 1024 * 1024,
          files: 1,
        },
        useTempFiles: true,
        tempFileDir: '/tmp/',
        safeFileNames: true,
        preserveExtension: 4,
        abortOnLimit: true,
      })
    );
    this.express.use((req, res, next) => {
      req.id = new Date().valueOf() + '-' + randomBytes(4).toString('hex');
      res.setHeader('x-api-trace-id', req.id);
      next();
    });
  }

  setApiRoutes() {
    Routes.setApiRoutes(this.express);

    // Handle default 404
    this.express.use((_, res) => {
      res.sendStatus(404);
    });
  }

  setErrorHandler() {
    this.express.use(handleError);
  }

  public init() {
    this.setAppHealthCheck();
    this.setApiRoutes();
    const port: Number = config.application.port;
    this.express.listen(port, () => {
      return Logger.info(`Server: Listening @ 'http://localhost:${port}'`);
    });
    this.setErrorHandler();
    Logger.info('Express: Started');
  }
}

export default new Express();
