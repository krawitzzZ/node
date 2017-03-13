import path from 'path';

export const root = process.cwd();
export const staticFolder = path.resolve(root, 'static');
export const lineFeed = new Buffer([0x0d, 0x0a]);
export const lineFeedUTF = '\r\n';
export const doubleLineFeed = new Buffer([0x0d, 0x0a, 0x0d, 0x0a]);
export const doubleLineFeedUTF = '\r\n\r\n';

export default {
  lineFeed,
  lineFeedUTF,
  doubleLineFeed,
  doubleLineFeedUTF,
  root,
  staticFolder,
};
