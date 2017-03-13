import net from 'net';
import config from './config';
import { clearConsole, newDebug } from './utils';
import { lineFeedUTF, doubleLineFeed, staticFolder } from './utils/constants';

const debug = newDebug('app');
const server = net.createServer();

server.on('connection', socket => {
  let buffer = Buffer.alloc(0);

  socket.on('data', chunk => {
    buffer = Buffer.concat([buffer, chunk], buffer.length + chunk.length);

    const isLastChunk = buffer.includes(doubleLineFeed);

    if (!isLastChunk) {
      return;
    }

    const req = buffer.toString('utf-8').split(lineFeedUTF);
    const [method, path, httpV] = req[0].split(' ');
    const headersArray = req
      .slice(1, req.indexOf(lineFeedUTF) - 1)
      .map(header => header.split(': '));
    const headers = new Map(headersArray);

    debug(`Received headers are:`, false);
    debug(headers);
    debug(method);
    debug(httpV);
    debug(path);
    debug(staticFolder);

    socket.end('ok');
  });

  socket.on('end', () => {
    debug('connection closed');
  });

  socket.on('error', err => {
    debug('error occurred', false);
    debug(err);
  });
});

server.listen(config.port, err => {
  if (err) {
    debug(`error occurred while starting server`, false);
    debug(err);
    process.exit(0);
  }

  clearConsole();
  debug(`server starts on port ${config.port}`);
});
