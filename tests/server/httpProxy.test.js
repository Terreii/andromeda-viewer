/* eslint-env node, mocha */
'use strict';

const assert = require('assert');
const express = require('express');
const proxyquire = require('proxyquire');
const request = require('supertest');
const uuid = require('uuid');

describe('httpProxy', function () {
  let testServer;
  let testServerPort;

  let server; // express server
  let app; // express app

  beforeEach(function (done) {
    const testApp = express();
    testApp.use((req, res) => {
      for (const [key, value] of Object.entries(req.headers)) {
        res.setHeader(key, value);
      }
      res.setHeader('x-request-method', req.method);
      res.send({ something: 'Hello World!' });
    });
    testServer = testApp.listen(() => {
      testServerPort = testServer.address().port;
      done();
    });
  });

  beforeEach(function () {
    const backend = proxyquire('../../backend/index', {});
    app = backend.app;
    server = backend.server;
  });

  afterEach('close server', function (done) {
    server.close(done);
  });

  afterEach('close test target server', function (done) {
    testServer.close(done);
  });

  it('should fail if the user in not logged in', function (done) {
    request(server)
      .get(`/api/proxy/http/127.0.0.1:${testServerPort}/`)
      .expect('Content-Type', 'application/vnd.api+json; charset=utf-8')
      .expect(
        401,
        {
          errors: [
            {
              status: 401,
              title: 'unauthorized',
              detail: '"x-andromeda-session-id" is wrong',
            },
          ],
        },
        done
      );
  });

  it('should proxy the requests to the passed address', function (done) {
    const id = uuid.v4();
    app.get('gridSessions').set(id, 'active');

    request(server)
      .get(`/api/proxy/http/127.0.0.1:${testServerPort}/somePath`)
      .set('x-andromeda-session-id', id)
      .expect('x-request-method', 'GET')
      .expect((res) => {
        assert.strictEqual(res.headers['x-andromeda-session-id'], undefined);
      })
      .expect(200, { something: 'Hello World!' }, done);
  });

  it('should proxy the request the the passed path-less address', function (done) {
    const id = uuid.v4();
    app.get('gridSessions').set(id, 'active');

    request(server)
      .get(`/api/proxy/http/127.0.0.1:${testServerPort}/`)
      .set('x-andromeda-session-id', id)
      .expect('x-request-method', 'GET')
      .expect((res) => {
        assert.strictEqual(res.headers['x-andromeda-session-id'], undefined);
      })
      .expect(200, { something: 'Hello World!' }, done);
  });

  describe('methods', function () {
    for (const method of [
      'GET',
      'HEAD',
      'POST',
      'PUT',
      'DELETE',
      'OPTIONS',
      'TRACE',
      'PATCH',
    ]) {
      it(`should handle ${method} requests`, function (done) {
        const id = uuid.v4();
        app.get('gridSessions').set(id, 'active');

        const req = request(server)
          [method.toLowerCase()](`/api/proxy/http/127.0.0.1:${testServerPort}/`)
          .set('x-andromeda-session-id', id);

        // Methods with body
        if (['POST', 'PUT', 'PATCH'].includes(method)) {
          req
            .send({ data: 'moar' })
            .expect('x-request-method', method)
            .expect((res) => {
              assert.strictEqual(
                res.headers['x-andromeda-session-id'],
                undefined
              );
            })
            .expect(200, { something: 'Hello World!' }, done);
        } else {
          req
            .expect('x-request-method', method)
            .expect((res) => {
              assert.strictEqual(
                res.headers['x-andromeda-session-id'],
                undefined
              );
            })
            .expect(
              200,
              method === 'HEAD' ? {} : { something: 'Hello World!' },
              done
            );
        }
      });
    }
  });
});
