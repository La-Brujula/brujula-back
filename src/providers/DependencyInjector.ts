import { Container } from 'typedi';
import Logger from './Logger';
import Database from '@/database/Database';

class DependencyInjector {
  async init(): Promise<void> {
    try {
      Container.set('database', await Database.getInstance());
      Container.set('logger', Logger);
      Logger.info('Dependency Injector: Started');
    } catch (err) {
      Logger.error('Failed loading dependency injection');
      throw err;
    }
  }
}

export default new DependencyInjector();
