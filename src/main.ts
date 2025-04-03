import 'reflect-metadata';
import * as os from 'os';
import * as cluster from 'cluster';
import App from './providers/App';
import Logger from './providers/Logger';

if (cluster.default.isPrimary) {
  const cpus: any = os.cpus().length;
  for (var i = 0; i < cpus; i++) {
    Logger.log('info', `Starting a new worker...`);
    cluster.default.fork();
  }
  cluster.default.on('exit', (worker) => {
    Logger.warn(`Worker ${worker.id} down`);
    Logger.warn(`Starting a new worker`);
    cluster.default.fork();
  });
} else {
  Logger.info(`Worker ${cluster.default.worker?.id} online`);
  App.loadConfig();
  App.loadDatabase().then(async () => {
    await App.loadDependencyInjection();
    App.loadServer();
  });
}
