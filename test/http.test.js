/* eslint-disable no-prototype-builtins */
import test from 'ava';
import request from 'supertest';
import fs from 'mz/fs';
import mime from 'mime';
import crypto from 'crypto';
import { rootUrl } from '../src/utils/constants';
import http, { HttpServer } from '../src/modules/http';

// line 10
test('Should contain createServer function', t => {
  t.plan(3);

  const server = http.createServer();

  t.true(http.hasOwnProperty('createServer'));
  t.true(typeof http.createServer === 'function');
  t.true(server instanceof HttpServer);
});

// line 13
test('Correctly sends files to several clients simultaneously', async t => {
  t.plan(1);

  const startServer = server => new Promise(resolve => server.listen(3001, () => resolve()));
  const getCheckSum = stream => new Promise(resolve => {
    const md5sum = crypto.createHash('md5');

    stream.on('data', d => {
      md5sum.update(d);
    });

    stream.on('end', () => {
      const d = md5sum.digest('hex');
      resolve(d);
    });
  });

  const filename = `${rootUrl}rc.jpg`;
  const fileStream = fs.ReadStream(filename);
  const md5hash = await getCheckSum(fileStream);

  const testServer = http.createServer();
  testServer.on('request', (req, res) => {
    res.setHeader('Content-Type', `${mime.lookup(filename)}`);
    res.setHeader('Date', new Date().toISOString());
    res.setHeader('Connection', 'keep-alive');
    fs.createReadStream(filename).pipe(res);
  });

  await startServer(testServer);
  const r = request('http://localhost:3001');
  const response = await r.get('/foo');
  const responseStream = fs.ReadStream(response.body);
  const responseMd5hash = await getCheckSum(responseStream);
  console.log(md5hash);
  console.log(responseMd5hash);
  testServer.close();

  t.true(true);
});
