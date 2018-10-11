'use strict'

import AvatarName from './avatarName'

test('should parse a given name', () => {
  expect(new AvatarName('First.Last')).toEqual({
    first: 'First',
    last: 'Last',
    displayName: '',
    isUsingDisplayName: false,
    didLoadDisplayName: false,
    isLoadingDisplayName: false
  })
  expect(new AvatarName('Tester Linden')).toEqual({
    first: 'Tester',
    last: 'Linden',
    displayName: '',
    isUsingDisplayName: false,
    didLoadDisplayName: false,
    isLoadingDisplayName: false
  })
  expect(new AvatarName('Tester')).toEqual({
    first: 'Tester',
    last: 'Resident',
    displayName: '',
    isUsingDisplayName: false,
    didLoadDisplayName: false,
    isLoadingDisplayName: false
  })
  expect(new AvatarName({ first: 'Tester' })).toEqual({
    first: 'Tester',
    last: 'Resident',
    displayName: '',
    isUsingDisplayName: false,
    didLoadDisplayName: false,
    isLoadingDisplayName: false
  })
  expect(new AvatarName({
    first: 'Tester',
    last: 'Linden',
    displayName: '',
    isUsingDisplayName: false,
    didLoadDisplayName: false,
    isLoadingDisplayName: false
  })).toEqual({
    first: 'Tester',
    last: 'Linden',
    displayName: '',
    isUsingDisplayName: false,
    didLoadDisplayName: false,
    isLoadingDisplayName: false
  })
})

test(
  'should give only the first name by the method getName() if the ' +
'last name is "Resident"',
  () => {
    expect(new AvatarName('Tester.Resident').getName()).toBe('Tester')
    expect(new AvatarName('hal2000').getName()).toBe('Hal2000')
  }
)

test('should give the full name with the method getFullName()', () => {
  expect(new AvatarName('Tester').getFullName()).toBe('Tester Resident')
  expect(new AvatarName('Tester.Linden').getFullName()).toBe('Tester Linden')
})

test('should have a toString method that behaves like getFullName', () => {
  expect(new AvatarName('Tester.Resident').toString()).toBe('Tester')
  expect(new AvatarName('hal2000').toString()).toBe('Hal2000')
})

test('should be comparable with the compare method', () => {
  const first = new AvatarName('test')
  const second = new AvatarName({ first: 'test', last: 'Linden' })
  const third = new AvatarName('tEst Resident')

  expect(first.compare(second)).toBe(false)
  expect(second.compare(third)).toBe(false)
  expect(second.compare('Test Linden')).toBe(true)
  expect(second.compare(third)).toBe(false)
  expect(first.compare({
    first: 'Test',
    last: 'Resident'
  })).toBe(true)
})

test('should format names', () => {
  expect(new AvatarName('tester linden')).toEqual({
    first: 'Tester',
    last: 'Linden',
    displayName: '',
    isUsingDisplayName: false,
    didLoadDisplayName: false,
    isLoadingDisplayName: false
  })

  expect(new AvatarName('teSteR lInDeN')).toEqual({
    first: 'Tester',
    last: 'Linden',
    displayName: '',
    isUsingDisplayName: false,
    didLoadDisplayName: false,
    isLoadingDisplayName: false
  })
})

test('should copy itself', () => {
  const old = new AvatarName('test')
  const isLoading = old.withIsLoadingSetTo(true)
  const displayName = isLoading.withDisplayNameSetTo('Hello')

  expect(old).not.toBe(isLoading)
  expect(isLoading).not.toBe(displayName)
})

test('should update its display name', () => {
  const old = new AvatarName('test')
  const isLoading = old.withIsLoadingSetTo(true)
  const displayName = isLoading.withDisplayNameSetTo('Hello')

  expect(isLoading).toEqual({
    first: 'Test',
    last: 'Resident',
    displayName: '',
    isUsingDisplayName: false,
    didLoadDisplayName: false,
    isLoadingDisplayName: true
  })

  expect(displayName).toEqual({
    first: 'Test',
    last: 'Resident',
    displayName: 'Hello',
    isUsingDisplayName: true,
    didLoadDisplayName: true,
    isLoadingDisplayName: false
  })
})
