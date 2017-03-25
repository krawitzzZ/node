import EventEmitter from 'events';
import net from 'net';
import HttpRequest from './httpRequest';
import HttpResponse from './httpResponse';
import { newDebug } from '../utils';

const debug = newDebug('app:http');

class HttpServer extends EventEmitter {
  constructor(props) {
    super(props);

    this.server = net.createServer();

    this.server.on('connection', socket => {
      const request = new HttpRequest(socket);
      const response = new HttpResponse(socket);

      request.on('headers', () => {
        this.emit('request', request, response);
      });

      request.on('error', err => {
        this.emit('error', err);
      });

      response.on('error', err => {
        this.emit('error', err);
      });

      socket.on('error', err => {
        if (err.code === 'ECONNRESET') {
          debug('Connection refused', false);
          debug(err.code);
          return;
        }

        this.emit('error', err);
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
