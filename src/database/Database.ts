import config from '@/config';
import Logger from '@/providers/Logger';
import { Sequelize } from 'sequelize-typescript';
import Container, { Service } from 'typedi';
import { Umzug, SequelizeStorage } from 'umzug';

import Account from './schemas/Account';
import Profile, { ProfileRecommendations } from './schemas/Profile';
import { join } from 'path';

@Service('Database')
class Database {
  private static _instance: Database;
  public sequelize!: Sequelize;

  public static async getInstance(): Promise<Database> {
    if (this._instance) {
      return this._instance;
    }

    this._instance = new Database();
    await this._instance.init();
    return this._instance;
  }

  public async init(): Promise<any> {
    const connectionSettings = config.database;
    if (!connectionSettings) {
      throw Error(
        'No connection settings defined for the database in the .env file.'
      );
    }

    Logger.info(
      `Connecting to ${connectionSettings.dialect}:${connectionSettings.database}`
    );
    this.sequelize = new Sequelize({
      database: connectionSettings.database,
      username: connectionSettings.username,
      password: connectionSettings.password,
      host: connectionSettings.host,
      dialect: connectionSettings.dialect,
      storage: connectionSettings.storage,
      logging: (msg) => Logger.debug(msg),
      port: connectionSettings.port,
      repositoryMode: true,
      models: [Account, Profile, ProfileRecommendations],
    });
    try {
      await this.sequelize.authenticate();
      Container.set('Database', Database._instance);
      Logger.info('Database: Connected to database correctly');
    } catch (error) {
      Logger.error(error);
      throw error;
    }
    await this.sequelize.sync();

    const umzug = new Umzug({
      migrations: {
        glob: [
          'migrations/*.ts',
          {
            cwd: join(__dirname, 'src', 'database'),
            ignore: ['**/*.d.ts', '**/index.ts', '**/index.js'],
          },
        ],
      },
      context: this.sequelize,
      storage: new SequelizeStorage({ sequelize: this.sequelize }),
      logger: Logger,
    });

    await umzug.up();
  }

  public async shutdown() {
    Logger.info('Shutting down sequelize');
    await this.sequelize.close();
    Logger.info('Shut down sequelize');
  }
}

export default Database;
