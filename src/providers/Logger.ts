import winston from 'winston';
import config from '@/config';
import { format } from 'winston';
const {
  combine,
  json,
  timestamp,
  colorize,
  errors,
  splat,
  align,
  printf,
  uncolorize,
} = format;

const Logger = winston.createLogger({
  level: config.logs.level,
  levels: winston.config.npm.levels,
  format: combine(
    timestamp(),
    colorize(),
    errors({ stack: true }),
    splat(),
    align(),
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  transports: [],
});

if (process.env.NODE_ENV !== 'production') {
  Logger.add(
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({
          format: 'YYYY-MM-DD hh:mm:ss.SSS A',
        }),
        errors({ stack: true })
      ),
    })
  );
} else {
  Logger.add(
    new winston.transports.File({
      filename: 'error.log',
      format: combine(uncolorize(), timestamp(), json()),
      level: 'error',
    })
  );
  Logger.add(
    new winston.transports.File({
      filename: 'combined.log',
      format: combine(uncolorize(), timestamp(), json()),
      level: 'info',
    })
  );
}

export default Logger;
