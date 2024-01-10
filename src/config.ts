import dotenv from 'dotenv';

const envConfig = dotenv.config();

if (process.env.NODE_ENV !== 'production' && envConfig.error) {
  throw new Error(`Could not find the env config file`);
}

export default {
  // Logs
  logs: {
    level: process.env.LOG_LEVEL || 'silly',
  },

  // API config
  api: {
    prefix: process.env.API_PREFIX || '/',
  },

  application: {
    name: process.env.APP_NAME,
    port: +(process.env.APP_PORT || 8000),
    jwt_secret: process.env.JWT_SECRET || 'supersecret',
  },

  database: {
    dialect: process.env.DB_DIALECT || 'sqlite',
    username: process.env.DB_USERNAME || 'username',
    password: process.env.DB_PASSWORD || 'password',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_DATABASE_NAME || 'labrujula',
    storage: process.env.DB_STORAGE_LOCATION || 'db.sqlite',
    port: +(process.env.DB_PORT || 9117),
  },
};
