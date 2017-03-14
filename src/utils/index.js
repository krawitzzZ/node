import fs from 'fs';
import mime from 'mime';
import createDebug from 'debug';
import { lineFeedUTF, doubleLineFeed, staticFolder } from './constants';

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

export const getRequestedUrl = url => `${staticFolder}${url}`;

export const getDefaultHeaders = () => {
  const headers = new Map();
  headers.set('Date', new Date().toISOString());
  headers.set('Connection', 'keep-alive');

  return headers;
};

export const getStatusText = code => {
  switch (code) {
    case 200:
      return 'OK';
    case 400:
      return 'Bad Request';
    case 403:
      return 'Forbidden';
    case 404:
      return 'Not Found';
    case 500:
      return 'Internal Server Error';
    default:
      return 'OK';
  }
};

export const parseHeaders = buf => {
  const req = buf.toString('utf-8').split(lineFeedUTF);
  const [method, url, httpVersion] = req[0].split(' ');
  const headersArray = req.slice(1, req.indexOf(lineFeedUTF) - 1).map(header => header.split(': '));
  const headers = new Map(headersArray);
  const bodyStartIndex = buf.indexOf(doubleLineFeed) + doubleLineFeed.length;
  const reqBodyPart = buf.slice(bodyStartIndex);

  return {
    httpVersion,
    method,
    url,
    headers,
    reqBodyPart,
  };
};

export const writeResponse = (req, res, url, errorHandler) => {
  res.setHeader('Content-Type', 'application/json');

  if (url.includes('.')) {
    res.setHeader('Content-Type', `${mime.lookup(url)}`);
  }

  const stream = fs.createReadStream(url);
  stream.on('open', () => stream.pipe(res));
  stream.on('error', err => errorHandler(err, req, res));
};
