import http from './modules/http';
import config from './config';
import { newDebug, clearConsole } from './utils';
import { handleRequest } from './utils/handlers';

const debug = newDebug('app:main');
const server = http.createServer();

server.on('request', (req, res) => {
  if (req.method !== 'GET') {
    res.writeHead(400);
    res.end('METHOD NOT ALLOWED');
    return;
  }

  handleRequest(req, res);
});

server.on('error', err => {
  debug(err);
});

server.listen(config.port, err => {
  if (err) {
    debug(`error occurred while starting server`, false);
    debug(err);
    process.exit(0);
  }

  clearConsole();
  debug(`server starts on localhost:${config.port}`);
});
