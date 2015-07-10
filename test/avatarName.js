var describe = require('mocha').describe;
var it = require('mocha').it;
var assert = require('assert');

var avatarName = require('../js/avatarName');

describe('avatarName', function () {
  it('should parse a given name', function () {
    assert.deepEqual({
      first: 'First',
      last: 'Last'
    }, avatarName('First.Last'));
    assert.deepEqual({
      first: 'Tester',
      last: 'Linden'
    }, avatarName('Tester Linden'));
    assert.deepEqual({
      first: 'Tester',
      last: 'Resident'
    }, avatarName('Tester'));
  });
});
