import fs from 'mz/fs';
import { newDebug, writeResponse, writeErrorResponse } from '../utils';
import {
  badRequestResponse,
  forbiddenResponse,
  notFoundResponse,
  indexUrl,
  faviconUrl,
} from '../utils/constants';

const debug = newDebug('handlers');

export const handleError = (socket, error) => {
  debug(error);
  switch (error.code) {
    case 'ENOENT':
      return writeErrorResponse(socket, notFoundResponse);
    case 'EACCES':
      return writeErrorResponse(socket, forbiddenResponse);
    default:
      return writeErrorResponse(socket, badRequestResponse);
  }
};

export const handleFavicon = socket => {
  fs.readFile(faviconUrl)
    .then(data => writeResponse(socket, faviconUrl, data), err => handleError(socket, err))
};

export const handleIndex = socket => {
  fs.readFile(indexUrl)
    .then(data => writeResponse(socket, indexUrl, data), err => handleError(socket, err))
};

export const handleRequest = (socket, url) => {
  fs.readFile(url)
    .then(data => writeResponse(socket, url, data), err => handleError(socket, err))
};
