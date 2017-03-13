import http from './modules/http';
import config from './config';
import { newDebug, clearConsole } from './utils';

const debug = newDebug('app:main');
const server = http.createServer();

server.listen(config.port, err => {
  if (err) {
    debug(`error occurred while starting server`, false);
    debug(err);
    process.exit(0);
  }

  clearConsole();
  debug(`server starts on localhost:${config.port}`);
});
