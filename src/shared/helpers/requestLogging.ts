import Logger from '@/providers/Logger';
import { Request, Response } from 'express';

export default function requestLog(tokens: any, req: Request, res: Response) {
  const { statusCode } = res;
  const { method } = req;
  const level = statusCode < 400 ? 'info' : statusCode < 500 ? 'warn' : 'error';
  Logger.log(
    level,
    [
      req.id,
      statusCode,
      method,
      decodeURIComponent(req.originalUrl),
      `| ${tokens['response-time'](req, res)} ms`,
    ].join(' ')
  );
  return undefined;
}
