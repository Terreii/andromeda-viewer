'use strict'

import {describe, it} from 'mocha'
import assert from 'assert'

import AvatarName from '../avatarName'

describe('avatarName', () => {
  it('should parse a given name', () => {
    assert.deepEqual({
      first: 'First',
      last: 'Last',
      displayName: '',
      didLoadDisplayName: false,
      isLoadingDisplayName: false
    }, new AvatarName('First.Last'))
    assert.deepEqual({
      first: 'Tester',
      last: 'Linden',
      displayName: '',
      didLoadDisplayName: false,
      isLoadingDisplayName: false
    }, new AvatarName('Tester Linden'))
    assert.deepEqual({
      first: 'Tester',
      last: 'Resident',
      displayName: '',
      didLoadDisplayName: false,
      isLoadingDisplayName: false
    }, new AvatarName('Tester'))
    assert.deepEqual({
      first: 'Tester',
      last: 'Resident',
      displayName: '',
      didLoadDisplayName: false,
      isLoadingDisplayName: false
    }, new AvatarName({first: 'Tester'}))
    assert.deepEqual({
      first: 'Tester',
      last: 'Linden',
      displayName: '',
      didLoadDisplayName: false,
      isLoadingDisplayName: false
    }, new AvatarName({
      first: 'Tester',
      last: 'Linden',
      displayName: '',
      didLoadDisplayName: false,
      isLoadingDisplayName: false
    }))
  })

  it('should give only the first name by the method getName() if the ' +
  'last name is "Resident"',
    () => {
      assert.equal('Tester', new AvatarName('Tester.Resident').getName())
      assert.equal('Hal2000', new AvatarName('hal2000').getName())
    })

  it('should give the full name with the method getFullName()', () => {
    assert.equal('Tester Resident', new AvatarName('Tester').getFullName())
    assert.equal('Tester Linden',
      new AvatarName('Tester.Linden').getFullName())
  })

  it('should have a toString method that behaves like getName', () => {
    assert.equal('Tester', new AvatarName('Tester.Resident').toString())
    assert.equal('Hal2000', new AvatarName('hal2000').toString())
  })

  it('should be comparable with the compare method', () => {
    const first = new AvatarName('test')
    const second = new AvatarName({first: 'test', last: 'Linden'})
    const third = new AvatarName('test Resident')

    assert.equal(false, first.compare(second))
    assert.equal(true, first.compare(third))
    assert.equal(true, second.compare('Test Linden'))
    assert.equal(true, first.compare(third, true))
    assert.equal(false, first.compare({
      first: 'Test',
      last: 'Resident'
    }, true))
  })

  it('should format names', () => {
    assert.deepEqual({
      first: 'Tester',
      last: 'Linden',
      displayName: '',
      didLoadDisplayName: false,
      isLoadingDisplayName: false
    }, new AvatarName('tester linden'))

    assert.deepEqual({
      first: 'Tester',
      last: 'Linden',
      displayName: '',
      didLoadDisplayName: false,
      isLoadingDisplayName: false
    }, new AvatarName('teSteR lInDeN'))
  })

  it('should copy itself', () => {
    const old = new AvatarName('test')
    const isLoading = old.withIsLoadingSetTo(true)
    const displayName = isLoading.withDisplayNameSetTo('Hello')

    assert.notEqual(old, isLoading)
    assert.notEqual(isLoading, displayName)
  })

  it('should update its display name', () => {
    const old = new AvatarName('test')
    const isLoading = old.withIsLoadingSetTo(true)
    const displayName = isLoading.withDisplayNameSetTo('Hello')

    assert.deepEqual(isLoading, {
      first: 'Test',
      last: 'Resident',
      displayName: '',
      didLoadDisplayName: false,
      isLoadingDisplayName: true
    })

    assert.deepEqual(displayName, {
      first: 'Test',
      last: 'Resident',
      displayName: 'Hello',
      didLoadDisplayName: true,
      isLoadingDisplayName: false
    })
  })
})
