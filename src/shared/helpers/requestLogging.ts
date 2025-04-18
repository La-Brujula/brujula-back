import Logger from '@/providers/Logger';
import cluster from 'cluster';
import { Request, Response } from 'express';

export default function requestLog(tokens: any, req: Request, res: Response) {
  const { statusCode } = res;
  const { method } = req;
  const level = statusCode < 400 ? 'info' : statusCode < 500 ? 'warn' : 'error';
  Logger.log(
    level,
    [
      cluster.worker?.id,
      statusCode,
      method,
      req.id,
      decodeURIComponent(req.originalUrl),
      `| ${tokens['response-time'](req, res)} ms`,
    ].join(' ')
  );
  return undefined;
}
