import net from 'net';
import config from './config';
import { clearConsole, newDebug, parseHeaders } from './utils';
import { handleIndex, handleFavicon, handleRequest } from './utils/handlers';
import { doubleLineFeed, staticFolder, rootUrl, faviconUrl } from './utils/constants';

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

    const { headers, url } = parseHeaders(buffer);
    const requestedUrl = `${staticFolder}${url}`;
    debug(`Received headers are:`, false);
    debug(headers);

    if (requestedUrl === faviconUrl) {
      handleFavicon(socket);
      return;
    }

    if (requestedUrl === rootUrl) {
      handleIndex(socket);
      return;
    }

    handleRequest(socket, requestedUrl);
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
