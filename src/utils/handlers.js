import { newDebug, getRequestedUrl, writeResponse } from '../utils';
import { rootUrl, indexUrl, faviconUrl } from '../utils/constants';

const debug = newDebug('app:handlers');

export const handleError = (error, req, res) => {
  debug(error);
  res.setHeader('Content-Type', 'text/plain');
  switch (error.code) {
    case 'ENOENT':
      res.writeHead(404);
      return res.end('Not Found');
    case 'EACCES':
      res.writeHead(403);
      return res.end('Access Denied');
    default:
      res.writeHead(400);
      return res.end('Bad Request');
  }
};

export const handleFavicon = (req, res) => {
  writeResponse(req, res, faviconUrl, handleError);
};

export const handleIndex = (req, res) => {
  writeResponse(req, res, indexUrl, handleError);
};

export const handleRequest = (req, res) => {
  const url = getRequestedUrl(req.url);

  if (url === faviconUrl) {
    handleFavicon(req, res);
    return;
  }

  if (url === rootUrl) {
    handleIndex(req, res);
    return;
  }

  writeResponse(req, res, url, handleError);
};
