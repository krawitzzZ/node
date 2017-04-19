import test from 'ava';
import { spy } from 'sinon';
import { Readable } from 'stream';
import HttpRequest from '../src/modules/httpRequest';

test.cb('Should correctly handle when headers come in multiple chunks', t => {
  t.plan(2);

  const fakeHeadersFirstPart = ['GET /foo HTTP/1.1', 'Cache-Control: no-cache'].join('\r\n');
  const fakeHeadersSecondPart = ['Connection: keep-alive', 'Pragma: no-cache', '\r\n'].join('\r\n');
  const fakeSocket = new Readable({ read: () => {} });
  const requestStream = new HttpRequest(fakeSocket);

  const onHeaders = spy(() => {
    t.true(onHeaders.calledOnce);
    t.end();
  });

  requestStream.on('headers', onHeaders);

  fakeSocket.push(fakeHeadersFirstPart);
  t.true(onHeaders.notCalled);

  setTimeout(() => fakeSocket.push(fakeHeadersSecondPart));
});

test.cb('Should correctly parse headers, method & url fields', t => {
  t.plan(9);

  const fakeBody = 'this is the most strange body ever';
  const fakeRequest = [
    'GET /foo HTTP/1.1',
    'Cache-Control: no-cache',
    'Connection: keep-alive',
    'Pragma: no-cache',
    '',
    fakeBody,
  ].join('\r\n');

  const fakeSocket = new Readable({ read: () => {} });
  const requestStream = new HttpRequest(fakeSocket);

  requestStream.on('headers', () => {
    t.true(requestStream.headers.has('Cache-Control'));
    t.true(requestStream.headers.get('Cache-Control') === 'no-cache');
    t.true(requestStream.headers.has('Connection'));
    t.true(requestStream.headers.get('Connection') === 'keep-alive');
    t.true(requestStream.headers.has('Pragma'));
    t.true(requestStream.headers.get('Pragma') === 'no-cache');
    t.true(!requestStream.headers.has('Bla-Bla'));
    t.true(requestStream.method === 'GET');
    t.true(requestStream.url === '/foo');
    t.end();
  });

  fakeSocket.push(fakeRequest);
});

test.cb('Is ReadableStream and contain body without headers', t => {
  t.plan(6);

  const fakeBody = 'this is the most strange body ever';
  const fakeRequest = [
    'GET /foo HTTP/1.1',
    'Cache-Control: no-cache',
    'Connection: keep-alive',
    'Pragma: no-cache',
    '',
    fakeBody,
  ].join('\r\n');

  const fakeSocket = new Readable({ read: () => {} });
  const requestStream = new HttpRequest(fakeSocket);

  requestStream.on('data', data => {
    t.true(requestStream instanceof Readable);
    t.true(requestStream.headers.has('Cache-Control'));
    t.true(requestStream.headers.has('Connection'));
    t.true(requestStream.headers.has('Pragma'));
    t.true(!requestStream.headers.has('Bla-Bla'));
    t.true(data.toString('utf8') === fakeBody);
    t.end();
  });

  fakeSocket.push(fakeRequest);
});

test.cb('Should emit close event if socket was closed', t => {
  const fakeSocket = new Readable({ read: () => {} });
  const requestStream = new HttpRequest(fakeSocket);
  requestStream.on('close', () => t.end());
  fakeSocket.emit('close');
});

test.cb('Should correctly handle when headers split in two parts between by \\r\\n', t => {
  t.plan(1);

  const fakeRequestFirstPart = ['GET /foo HTTP/1.1', 'Cache-Control: no-cache'].join('\r\n');
  const fakeRequestSecondPart = ['\r\n', 'this is the most strange body ever'].join('\r\n');
  const fakeSocket = new Readable({ read: () => {} });
  const requestStream = new HttpRequest(fakeSocket);

  const onHeaders = spy(() => {
    t.true(onHeaders.calledOnce);
    t.end();
  });

  requestStream.on('headers', onHeaders);

  fakeSocket.push(fakeRequestFirstPart);
  setTimeout(() => fakeSocket.push(fakeRequestSecondPart));
});
