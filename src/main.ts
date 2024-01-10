import 'reflect-metadata';
import * as os from 'os';
import * as cluster from 'cluster';
import App from './providers/App';
import Logger from './providers/Logger';

// if (process.env.NODE_ENV === 'production' && cluster.default.isPrimary) {
//   const cpus: any = os.cpus().length - 1;
//   for (var i = 0; i < cpus; i++) {
//     setTimeout(() => {
//       Logger.log('info', `Starting a new worker...`);
//     }, 1000);
//     cluster.default.fork();
//   }
// } else {
// }
App.loadConfig();
App.loadDatabase().then(async () => {
  await App.loadDependencyInjection();
  App.loadServer();
});

cluster.default.on('exit', (worker) => {
  Logger.debug(`Worker ${worker.id} down`);
  Logger.debug(`Starting a new worker`);
  cluster.default.fork();
});
