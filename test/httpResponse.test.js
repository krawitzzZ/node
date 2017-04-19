import test from 'ava';
import { Writable } from 'stream';
import HttpResponse from '../src/modules/httpResponse';

test.cb('Should be WritableStream', t => {
  t.plan(1);
  const fakeSocket = new Writable({ write: () => {} });
  const responseStream = new HttpResponse(fakeSocket);

  t.true(responseStream instanceof Writable);
  t.end();
});

test.cb('Call to setHeader after headers have been sent should emit error', t => {
  const fakeSocket = new Writable({ write: () => {} });
  const responseStream = new HttpResponse(fakeSocket);

  responseStream.on('error', () => t.end());
  responseStream.end('hello');
  responseStream.setHeader('foo', 'bar');
});

test.cb('Call to writeHead should send headers with corresponding status line', t => {
  t.plan(1);

  const fakeSocket = new Writable({ write: () => {} });
  const responseStream = new HttpResponse(fakeSocket);

  responseStream.writeHead(515);
  t.true(responseStream.statusLine.includes('515'));
  t.end();
});

test.cb('Call to writeHead after head was already written should emit error', t => {
  const fakeSocket = new Writable({ write: () => {} });
  const responseStream = new HttpResponse(fakeSocket);

  responseStream.on('error', () => t.end());
  responseStream.writeHead(200);
  responseStream.end('hello');
  responseStream.writeHead(404);
});

test.cb('Have setHeader method', t => {
  t.plan(2);

  const fakeSocket = new Writable({ write: () => {} });
  const responseStream = new HttpResponse(fakeSocket);

  responseStream.setHeader('foo', 'bar');
  t.true(typeof responseStream.setHeader === 'function');
  t.true(responseStream.headerSent === false);

  t.end();
});

test.cb('All headers added with setHeader should be sent to socket', t => {
  t.plan(5);

  const fakeSocket = new Writable({ write: () => {} });
  const responseStream = new HttpResponse(fakeSocket);

  responseStream.setHeader('foo', 'bar');
  t.true(responseStream.headers.get('foo') === 'bar');
  responseStream.setHeader('moo', 'shoo');
  t.true(responseStream.headers.get('moo') === 'shoo');
  responseStream.setHeader('fee', 'baz');
  t.true(responseStream.headers.get('foo') === 'bar');
  t.true(responseStream.headers.get('moo') === 'shoo');
  t.true(responseStream.headers.get('fee') === 'baz');

  t.end();
});

test.cb('SetHeader method should overwrite header with the same name', t => {
  t.plan(4);

  const fakeSocket = new Writable({ write: () => {} });
  const responseStream = new HttpResponse(fakeSocket);

  responseStream.setHeader('foo', 'bar');
  t.true(responseStream.headers.get('foo') === 'bar');
  responseStream.setHeader('foo', 'baz');
  t.true(responseStream.headers.get('foo') === 'baz');
  responseStream.setHeader('Foo', 'biz');
  t.true(responseStream.headers.get('foo') === 'baz');
  t.true(responseStream.headers.get('Foo') === 'biz');

  t.end();
});

// line 20
test.cb('Should correctly send data in chunks to destination', t => {
  // TODO !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  t.plan(0);

  const fakeData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const fakeBuf = Buffer.from(fakeData);
  const firstPart = fakeBuf.slice(0, 5);
  const secondPart = fakeBuf.slice(5);

  const fakeSocket = new Writable({ write: () => {} });
  const responseStream = new HttpResponse(fakeSocket);

  responseStream.setHeader('Content-Length', fakeBuf.length);
  responseStream.write(firstPart);
  responseStream.end(secondPart);

  t.end();
});

test.cb('If writeHead invoked with not a number argument, HttpResponse should emit error', t => {
  t.plan(0);

  const fakeSocket = new Writable({ write: () => {} });
  const responseStream = new HttpResponse(fakeSocket);

  responseStream.on('error', () => t.end());
  responseStream.writeHead('200');
  responseStream.end('hello');
});
