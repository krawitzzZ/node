import stream from 'stream';
import { getDefaultHeaders, getStatusText } from '../utils';
import { okResponse, lineFeedUTF } from '../utils/constants';

const headers = Symbol('headers');
const statusLine = Symbol('statusLine');
const send = Symbol('send');

export default class HttpResponse extends stream.Writable {
  constructor(socket) {
    super();

    this.socket = socket;
    this.headerSent = false;
    this[headers] = getDefaultHeaders();
    this[statusLine] = okResponse;
  }

  _write(chunk, encoding = 'utf-8', callback) {
    const write = () => {
      this.socket.write(chunk, encoding, err => {
        if (err) {
          return callback(err);
        }

        return callback();
      });
    };

    this[send](write);
  }

  [send](callback) {
    if (this.headerSent) {
      callback();
      return;
    }

    let headersToSend = `${this[statusLine]}`;

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of this[headers].entries()) {
      headersToSend += `${key}: ${value}${lineFeedUTF}`;
    }

    headersToSend += `${lineFeedUTF}`;
    this.headerSent = true;
    this.socket.write(headersToSend, 'utf-8', callback);
  }

  writeHead(code) {
    if (this.headerSent) {
      this.emit('error', new Error('Headers already sent'));
      return;
    }

    const statusText = getStatusText(code);
    this[statusLine] = `HTTP/1.1 ${code} ${statusText}${lineFeedUTF}`;
  }

  setHeader(header, value) {
    if (this.headerSent) {
      this.emit('error', new Error('Headers already sent'));
      return;
    }

    this[headers].set(header, value);
  }

  end(data) {
    this[send](() => this.socket.end(data));
  }

  json(data) {
    this[send](() => this.socket.end(JSON.stringify(data)));
  }
}
