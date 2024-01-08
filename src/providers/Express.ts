import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
import requestLog from "@/helpers/requestLogging";
import { handleError } from "@/helpers/errorHandler";
import Logger from "./Logger";

class Express {
  public express: express.Application;

  constructor() {
    this.express = express();
    this.setMiddleware();
  }

  setAppHealthCheck() {
    this.express.get("/status", (req, res) => {
      res.sendStatus(200);
    });
  }

  setMiddleware() {
    this.express.use(cors({ credentials: true, origin: true }));
    this.express.use(express.json({ limit: "512kb" }));
    this.express.use(express.urlencoded({ extended: true }));
    this.express.use(compression());
    this.express.use(helmet({ contentSecurityPolicy: false, xssFilter: true }));
    this.express.use(morgan(requestLog));
    this.express.use(
      fileUpload({
        createParentPath: true,
      }),
    );
  }

  setErrorHandler() {
    this.express.use(handleError);
  }

  public init() {
    this.setAppHealthCheck();
    const port: Number = +(process.env.PORT || 8000);
    this.express.listen(port, () => {
      return Logger.info(
        `Server: Listening @ 'http://localhost:${port}'`,
      );
    });
    this.setErrorHandler();
    Logger.debug("Express: Started");
  }
}

export default new Express();
