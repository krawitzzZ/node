import path from 'path';

export const root = process.cwd();
export const staticFolder = path.resolve(root, 'static');
export const lineFeedUTF = '\r\n';
export const doubleLineFeed = Buffer.from([0x0d, 0x0a, 0x0d, 0x0a]);
export const faviconUrl = `${staticFolder}/favicon.ico`;
export const indexUrl = `${staticFolder}/index.html`;
export const rootUrl = `${staticFolder}/`;
export const okResponse = `HTTP/1.1 200 OK\r\n`;
export const badRequestResponse = `HTTP/1.1 400 Bad Request\r\n`;
export const forbiddenResponse = `HTTP/1.1 403 Forbidden\r\n`;
export const notFoundResponse = `HTTP/1.1 404 Not Found\r\n`;
