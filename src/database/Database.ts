import config from '@/config';
import Logger from '@/providers/Logger';
import { DataTypes, Dialect, ModelStatic, Sequelize } from 'sequelize';
import { Service } from 'typedi';
import { Account } from './schemas/Account';
import { Umzug, SequelizeStorage } from 'umzug';

@Service()
class Database {
  private static _instance: Database;
  public sequelize!: Sequelize;
  public models: { Account: ModelStatic<Account> } = {} as any;

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
      throw Error('No connection settings defined for the database in the .env file.');
    }

    Logger.info(`Connecting to ${connectionSettings.dialect}:${connectionSettings.database}`);
    this.sequelize = new Sequelize(
      connectionSettings.database,
      connectionSettings.username,
      connectionSettings.password,
      {
        host: connectionSettings.host,
        dialect: connectionSettings.dialect as Dialect,
        storage: connectionSettings.storage,
        logging: (msg) => Logger.debug(msg),
        port: connectionSettings.port,
      }
    );
    try {
      await this.sequelize.authenticate();
      this.loadSchemas();
      Logger.info('Database: Connected to database correctly');
    } catch (error) {
      Logger.error(error);
    }
  }

  async loadSchemas() {
    const umzug = new Umzug({
      migrations: { glob: 'migrations/*.js' },
      context: this.sequelize.getQueryInterface(),
      storage: new SequelizeStorage({ sequelize: this.sequelize }),
      logger: Logger,
    });
    const models = ['./schemas/Account'];
    models.map((route) => {
      const model = require(route).default(this.sequelize, DataTypes);
      // @ts-ignore
      this.models[route.slice(route.lastIndexOf('/') + 1)] = model;
    });

    (async () => {
      // Checks migrations and run them if they are not already applied. To keep
      // track of the executed migrations, a table (and sequelize model) called SequelizeMeta
      // will be automatically created (if it doesn't exist already) and parsed.
      await umzug.up();
    })();
  }

  public async shutdown() {
    Logger.info('Shutting down sequelize');
    await this.sequelize.close();
    Logger.info('Shut down sequelize');
  }
}

export default Database;
