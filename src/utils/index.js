/* eslint-disable */
import createDebug from 'debug';

export const clearConsole = () => {
  if (process.env.NODE_ENV !== 'production') {
    process.stdout.write(process.platform === 'win32' ? '\z1Bc' : '\x1B[2J\x1B[3J\x1B[H');
  }
};

export const newDebug = name => {
  let _debug = createDebug(name);
  const debug = (data, divider = true) => {
    if (divider) {
      _debug(data);
      _debug('-----------------------------------------------------------------------------------');
      _debug('');
      return;
    }

    _debug(data);
    _debug('');
  };

  return debug;
};
