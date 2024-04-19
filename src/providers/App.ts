import * as dotenv from 'dotenv';
import * as path from 'path';

import Express from './Express';
import Logger from './Logger';
import DependencyInjector from './DependencyInjector';
import Database from '@/database/Database';

class App {
  public loadConfig() {
    dotenv.config({ path: path.join(__dirname, '../../.env') });
  }

  public loadServer() {
    Logger.verbose('Express: Starting...');
    Express.init();
  }

  public async loadDatabase() {
    Logger.verbose('Database: Connecting...');
    await Database.getInstance();
  }

  public async loadDependencyInjection() {
    Logger.verbose('Dependency Injector: Starting...');
    await DependencyInjector.init();
  }
}

export default new App();
