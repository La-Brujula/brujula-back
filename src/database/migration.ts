import { Umzug, SequelizeStorage } from 'umzug';
import { Sequelize } from 'sequelize';
import config from '@/config';
import Logger from '@/providers/Logger';

const connectionSettings = config.database;

const sequelize = new Sequelize({
  database: connectionSettings.database,
  username: connectionSettings.username,
  password: connectionSettings.password,
  host: connectionSettings.host,
  dialect: connectionSettings.dialect,
  storage: connectionSettings.storage,
  logging: (msg: string) => Logger.debug(msg),
  port: connectionSettings.port,
});

export const migrator = new Umzug({
  migrations: {
    glob: ['migrations/*.ts', { cwd: __dirname }],
  },
  context: sequelize,
  storage: new SequelizeStorage({
    sequelize,
  }),
  logger: console,
});

export type Migration = typeof migrator._types.migration;
