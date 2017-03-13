import createDebug from 'debug';
import mime from 'mime';
import { lineFeedUTF, okResponse } from './constants';

export const clearConsole = () => {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-useless-escape
    process.stdout.write(process.platform === 'win32' ? '\z1Bc' : '\x1B[2J\x1B[3J\x1B[H');
  }
};

export const newDebug = name => {
  const privateDebug = createDebug(name);
  const debug = (data, divider = true) => {
    if (divider) {
      privateDebug(data);
      privateDebug('-----------------------------------------------------------------------------');
      privateDebug('');
      return;
    }

    privateDebug(data);
    privateDebug('');
  };

  return debug;
};

export const parseHeaders = buf => {
  const req = buf.toString('utf-8').split(lineFeedUTF);
  const [method, url, httpVersion] = req[0].split(' ');
  const headersArray = req.slice(1, req.indexOf(lineFeedUTF) - 1).map(header => header.split(': '));
  const headers = new Map(headersArray);

  return {
    method,
    url,
    httpVersion,
    headers,
  };
};

export const writeResponse = (socket, url, data) => {
  socket.write(okResponse);
  socket.write(`Date: ${new Date().toISOString()}${lineFeedUTF}`);
  socket.write(`Connection: keep-alive${lineFeedUTF}`);
  socket.write(`Content-Length: ${data.length}${lineFeedUTF}`);
  socket.write(`Content-Type: ${mime.lookup(url)}${lineFeedUTF}`);
  socket.write(`${lineFeedUTF}`);
  socket.end(data);
};

export const writeErrorResponse = (socket, errorResponse) => {
  socket.write(errorResponse);
  socket.write(`Date: ${new Date().toISOString()}${lineFeedUTF}`);
  socket.write(`Connection: keep-alive${lineFeedUTF}`);
  socket.end();
};
