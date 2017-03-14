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

      socket.on('error', err => {
        debug(err);
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
