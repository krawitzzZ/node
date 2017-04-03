import stream from 'stream';
import { parseHeaders } from '../utils';
import { doubleLineFeed } from '../utils/constants';

const state = Symbol('state');
const HEADERS_STATE = 0;
const BODY_STATE = 1;

export default class HttpRequest extends stream.Readable {
  constructor(socket) {
    super();

    this.socket = socket;
    this[state] = HEADERS_STATE;
    this.buffer = Buffer.alloc(0);
    this.headers = new Map();
    this.method = null;
    this.url = null;
    this.headerParseCounter = 0;

    this.socket.on('data', this.onData.bind(this));
  }

  _read() {
    this.resume();
  }

  parseHeaders() {
    return parseHeaders(this.buffer);
  }

  processHeaders() {
    const { headers, method, url } = this.parseHeaders();
    this.url = url;
    this.method = method;
    this.headers = headers;
  }

  onData(chunk) {
    this.headerParseCounter += 1;
    if (this[state] === HEADERS_STATE) {
      this.buffer = Buffer.concat([this.buffer, chunk], this.buffer.length + chunk.length);
      const isLastHeadersChunk = this.buffer.includes(doubleLineFeed);

      if (!isLastHeadersChunk && (this.headerParseCounter > 10 || this.buffer.length > 9000)) {
        this.emit('error', new Error('Failed to parse headers'));
      }

      if (isLastHeadersChunk) {
        this[state] = BODY_STATE;
        this.processHeaders();
        this.emit('headers');
        const { reqBodyPart } = this.parseHeaders();
        this.socket.unshift(reqBodyPart);
        this.socket.pause();
      }

      return;
    }

    this.pause();
    this.push(chunk);
  }
}
