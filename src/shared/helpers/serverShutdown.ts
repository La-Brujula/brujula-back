import { Server } from 'http';
import Database from '@/database/Database';

export default async function shutdownServer(error?: Error) {
  if (error !== undefined) {
    console.error('Uncaught exception.\nShutting down...');
    console.error(error);
  } else {
    console.info('Powering down...');
  }
  await (await Database.getInstance()).shutdown();
  process.exit(error !== undefined ? 1 : 0);
}
