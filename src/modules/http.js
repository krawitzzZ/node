import EventEmitter from 'events';
import net from 'net';
import { newDebug, parseHeaders } from '../utils';
import { handleIndex, handleFavicon, handleRequest } from '../utils/handlers';
import { doubleLineFeed, staticFolder, rootUrl, faviconUrl } from '../utils/constants';

const debug = newDebug('app:http');

class HttpServer extends EventEmitter {
  constructor(props) {
    super(props);

    this.server = net.createServer();

    this.server.on('connection', socket => {
      this.emit('request', socket);

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
  }

  listen(port, callback) {
    this.server.listen(port, callback);
  }
}

export default {
  createServer() {
    return new HttpServer();
  },
};
