'use strict'

import {describe, it} from 'mocha'
import assert from 'assert'

import AvatarName from '../avatarName'

describe('avatarName', () => {
  it('should parse a given name', () => {
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
    () => {
      assert.equal('Tester', new AvatarName('Tester.Resident').getName())
      assert.equal('hal2000', new AvatarName('hal2000').getName())
    })

  it('should give the full name with the method getFullName()', () => {
    assert.equal('Tester Resident', new AvatarName('Tester').getFullName())
    assert.equal('Tester Linden',
      new AvatarName('Tester.Linden').getFullName())
  })

  it('should have a toString method that behaves like getName', () => {
    assert.equal('Tester', new AvatarName('Tester.Resident').toString())
    assert.equal('hal2000', new AvatarName('hal2000').toString())
  })

  it('should be compareable with the compare method', () => {
    const first = new AvatarName('test')
    const second = new AvatarName({first: 'test', last: 'Linden'})
    const third = new AvatarName('test Resident')

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
