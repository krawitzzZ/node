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
    .catch(err => handleError(socket, err))
    .then(data => writeResponse(socket, faviconUrl, data))
};

export const handleIndex = socket => {
  fs.readFile(indexUrl)
    .catch(err => handleError(socket, err))
    .then(data => writeResponse(socket, indexUrl, data))
};

export const handleRequest = (socket, url) => {
  fs.readFile(url)
    .catch(err => handleError(socket, err))
    .then(data => writeResponse(socket, url, data))
};
