import dotenv from 'dotenv';
import { Dialect } from 'sequelize';

const envConfig = dotenv.config();

if (process.env.NODE_ENV !== 'production' && envConfig.error) {
  throw new Error(`Could not find the env config file`);
}

export default {
  env: process.env.NODE_ENV || 'development',
  // Logs
  logs: {
    level: process.env.LOG_LEVEL || 'silly',
  },

  // API config
  api: {
    prefix: process.env.API_PREFIX || '/',
    errorReportingEmail: process.env.ERROR_EMAIL || '',
    contactEmail: process.env.CONTACT_EMAIL || '',
  },

  application: {
    name: process.env.APP_NAME,
    port: +(process.env.APP_PORT || 8000),
    frontend_url: process.env.APP_FRONTEND_URL || 'https://labrujula.com.mx',
    jwtSecret: process.env.JWT_SECRET || 'supersecret',
  },

  images: {
    imagesPath: process.env.IMAGES_PATH || './public',
    imagesBaseURL:
      process.env.IMAGES_SERVICE_URL || 'https://img.labrujula.com.mx',
  },

  database: {
    dialect: (process.env.DB_DIALECT || 'sqlite') as Dialect,
    username: process.env.DB_USERNAME || 'username',
    password: process.env.DB_PASSWORD || 'password',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_DATABASE_NAME || 'labrujula',
    storage: process.env.DB_STORAGE_LOCATION || 'db.sqlite',
    port: +(process.env.DB_PORT || 9117),
  },

  smtp: {
    host: process.env.SMTP_SERVER,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    authType: process.env.SMTP_AUTH_TYPE,
    sslPort: +(process.env.SMTP_SSL_PORT || 465),
    tlsPort: +(process.env.SMTP_TLS_PORT || 587),
  },

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
  },
};
