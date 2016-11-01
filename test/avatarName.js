'use strict'

var describe = require('mocha').describe
var it = require('mocha').it
var assert = require('assert')

var AvatarName = require('../avatarName')

describe('avatarName', function () {
  it('should parse a given name', function () {
    assert.deepEqual({
      first: 'First',
      last: 'Last'
    }, new AvatarName('First.Last'))
    assert.deepEqual({
      first: 'Tester',
      last: 'Linden'
    }, new AvatarName('Tester Linden'))
    assert.deepEqual({
      first: 'Tester',
      last: 'Resident'
    }, new AvatarName('Tester'))
    assert.deepEqual({
      first: 'Tester',
      last: 'Resident'
    }, new AvatarName({first: 'Tester'}))
    assert.deepEqual({
      first: 'Tester',
      last: 'Linden'
    }, new AvatarName({
      first: 'Tester',
      last: 'Linden'
    }))
  })

  it('should give only the first name by the method getName() if the ' +
  'last name is "Resident"',
    function () {
      assert.equal('Tester', new AvatarName('Tester.Resident').getName())
      assert.equal('hal2000', new AvatarName('hal2000').getName())
    })

  it('should give the full name with the method getFullName()', function () {
    assert.equal('Tester Resident', new AvatarName('Tester').getFullName())
    assert.equal('Tester Linden',
      new AvatarName('Tester.Linden').getFullName())
  })

  it('should have a toString method that behaves like getName', function () {
    assert.equal('Tester', new AvatarName('Tester.Resident').toString())
    assert.equal('hal2000', new AvatarName('hal2000').toString())
  })

  it('should be compareable with the compare method', function () {
    var first = new AvatarName('test')
    var second = new AvatarName({first: 'test', last: 'Linden'})
    var third = new AvatarName('test Resident')

    assert.equal(false, first.compare(second))
    assert.equal(true, first.compare(third))
    assert.equal(true, second.compare('test Linden'))
    assert.equal(true, first.compare(third, true))
    assert.equal(false, first.compare({
      first: 'test',
      last: 'Resident'
    }, true))
  })
})
