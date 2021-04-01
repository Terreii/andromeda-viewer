/* eslint-env node, mocha */
'use strict';

const assert = require('assert');
const ms = require('milliseconds');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const uuid = require('uuid');

describe('gridSession', function () {
  let clock;
  let server; // express server
  let app; // express app
  let generateSession;
  let checkSession;
  let changeSessionState;

  beforeEach(function () {
    clock = sinon.useFakeTimers(Date.now());
  });

  beforeEach(function () {
    const backend = proxyquire('../../backend/index', {});
    app = backend.app;
    server = backend.server;
    generateSession = app.get('generateSession');
    checkSession = app.get('checkSession');
    changeSessionState = app.get('changeSessionState');
  });

  afterEach('close server', function (done) {
    server.close(done);
  });

  afterEach('restore timers', function () {
    clock.restore();
  });

  it('should add a generateSession function to the app key-value store', function () {
    assert.strictEqual(typeof generateSession, 'function');
  });

  it('should add a checkSession function to the app key-value store', function () {
    assert.strictEqual(typeof checkSession, 'function');
  });

  it('should add a changeSessionState function to the app key-value store', function () {
    assert.strictEqual(typeof changeSessionState, 'function');
  });

  it('should generate a session ID which can be validated', function () {
    const id = generateSession();
    const state = checkSession(id);
    assert.strictEqual(state, 'inactive');
  });

  it('should update the state of a session', function () {
    const id = generateSession();
    const oldState = checkSession(id);

    const nextState = changeSessionState(id, 'active');
    assert.strictEqual(nextState, 'active');

    const state = checkSession(id);
    assert.strictEqual(state, 'active');
    assert.notStrictEqual(state, oldState);
  });

  it('should throw if a not valid session id is checked', function () {
    assert.throws(
      () => {
        checkSession(uuid.v4());
      },
      {
        error: true,
        name: 'unauthorized',
        status: 401,
        message: 'Name or password is incorrect.',
        reason: '"x-andromeda-session-id" is wrong',
      }
    );
  });

  it('should invalidate a session after a timeout', function () {
    const id = generateSession();

    clock.tick(ms.minutes(10) + ms.seconds(2));

    assert.throws(
      () => {
        checkSession(id);
      },
      {
        error: true,
        name: 'unauthorized',
        status: 401,
        message: 'Name or password is incorrect.',
        reason: '"x-andromeda-session-id" is wrong',
      }
    );
  });

  it('should not invalidate an active session after the timeout', function () {
    const id = generateSession();
    changeSessionState(id, 'active');

    clock.tick(ms.minutes(10) + ms.seconds(2));

    assert.strictEqual(checkSession(id), 'active');
  });

  it('should invalidate a session that became inactive after a timeout', function () {
    const id = generateSession();
    changeSessionState(id, 'active');
    changeSessionState(id, 'inactive');

    clock.tick(ms.minutes(10) + ms.seconds(2));

    assert.throws(
      () => {
        checkSession(id);
      },
      {
        error: true,
        name: 'unauthorized',
        status: 401,
        message: 'Name or password is incorrect.',
        reason: '"x-andromeda-session-id" is wrong',
      }
    );
  });

  it('should invalidate a session when it ends', function () {
    const id = generateSession();
    changeSessionState(id, 'active');
    changeSessionState(id, 'end');

    assert.throws(
      () => {
        checkSession(id);
      },
      {
        error: true,
        name: 'unauthorized',
        status: 401,
        message: 'Name or password is incorrect.',
        reason: '"x-andromeda-session-id" is wrong',
      }
    );
  });

  it('should cleanup inactive sessions that timeouted on a session check', function (done) {
    const idActive1 = generateSession();
    changeSessionState(idActive1, 'active');
    const idInactive1 = generateSession();

    clock.tick(ms.minutes(5));

    const idActive2 = generateSession();
    changeSessionState(idActive2, 'active');
    const idInactive2 = generateSession();

    clock.tick(ms.minutes(5) + ms.seconds(2));

    checkSession(idActive1);

    clock.nextAsync().then(() => {
      try {
        checkSession(idActive2);
        assert.throws(
          () => {
            checkSession(idInactive1);
          },
          {
            error: true,
            name: 'unauthorized',
            status: 401,
            message: 'Name or password is incorrect.',
            reason: '"x-andromeda-session-id" is wrong',
          }
        );

        checkSession(idActive2);
        checkSession(idInactive2);

        done();
      } catch (err) {
        done(err);
      }
    });
  });
});
