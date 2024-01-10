import config from "@/config";
import Logger from "@/providers/Logger";
import { Dialect, Sequelize } from "sequelize";

class Database {
  private static _instance: Database;
  private sequelize!: Sequelize;

  public constructor() {
    this.init();
  }

  public static async getInstance(): Promise<Database> {
    if (this._instance) {
      return this._instance;
    }

    this._instance = new Database();
    return this._instance;
  }

  public async init(): Promise<any> {
    const connectionSettings = config.database;
    if (!connectionSettings) {
      throw Error(
        "No connection settings defined for the database in the .env file.",
      );
    }

    Logger.info(
      `Connecting to ${connectionSettings.dialect}:${connectionSettings.database}`,
    );
    this.sequelize = new Sequelize(
      connectionSettings.database,
      connectionSettings.username,
      connectionSettings.password,
      {
        host: connectionSettings.host,
        dialect: connectionSettings.dialect as Dialect,
        storage: connectionSettings.storage,
        logging: (msg) => Logger.debug(msg),
        port: connectionSettings.port
      },
    );
    try {
      await this.sequelize.authenticate();
      Logger.info("Database: Connected to database correctly");
    } catch (error) {
      Logger.error(error);
    }
  }

  public async shutdown() {
    Logger.info("Shutting down sequelize");
    await this.sequelize.close();
    Logger.info("Shut down sequelize");
  }
}

export default Database;
