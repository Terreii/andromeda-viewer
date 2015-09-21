var describe = require('mocha').describe;
var it = require('mocha').it;
var assert = require('assert');

var AvatarName = require('../js/avatarName');

describe('avatarName', function () {
  it('should parse a given name', function () {
    assert.deepEqual({
      first: 'First',
      last: 'Last'
    }, new AvatarName('First.Last'));
    assert.deepEqual({
      first: 'Tester',
      last: 'Linden'
    }, new AvatarName('Tester Linden'));
    assert.deepEqual({
      first: 'Tester',
      last: 'Resident'
    }, new AvatarName('Tester'));
  });
});
