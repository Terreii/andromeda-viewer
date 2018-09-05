'use strict'

import AvatarName from './avatarName'

global.test('should parse a given name', () => {
  global.expect(new AvatarName('First.Last')).toEqual({
    first: 'First',
    last: 'Last',
    displayName: '',
    didLoadDisplayName: false,
    isLoadingDisplayName: false
  })
  global.expect(new AvatarName('Tester Linden')).toEqual({
    first: 'Tester',
    last: 'Linden',
    displayName: '',
    didLoadDisplayName: false,
    isLoadingDisplayName: false
  })
  global.expect(new AvatarName('Tester')).toEqual({
    first: 'Tester',
    last: 'Resident',
    displayName: '',
    didLoadDisplayName: false,
    isLoadingDisplayName: false
  })
  global.expect(new AvatarName({ first: 'Tester' })).toEqual({
    first: 'Tester',
    last: 'Resident',
    displayName: '',
    didLoadDisplayName: false,
    isLoadingDisplayName: false
  })
  global.expect(new AvatarName({
    first: 'Tester',
    last: 'Linden',
    displayName: '',
    didLoadDisplayName: false,
    isLoadingDisplayName: false
  })).toEqual({
    first: 'Tester',
    last: 'Linden',
    displayName: '',
    didLoadDisplayName: false,
    isLoadingDisplayName: false
  })
})

global.test(
  'should give only the first name by the method getName() if the ' +
'last name is "Resident"',
  () => {
    global.expect(new AvatarName('Tester.Resident').getName()).toBe('Tester')
    global.expect(new AvatarName('hal2000').getName()).toBe('Hal2000')
  }
)

global.test('should give the full name with the method getFullName()', () => {
  global.expect(new AvatarName('Tester').getFullName()).toBe('Tester Resident')
  global.expect(new AvatarName('Tester.Linden').getFullName()).toBe('Tester Linden')
})

global.test('should have a toString method that behaves like getFullName', () => {
  global.expect(new AvatarName('Tester.Resident').toString()).toBe('Tester')
  global.expect(new AvatarName('hal2000').toString()).toBe('Hal2000')
})

global.test('should be comparable with the compare method', () => {
  const first = new AvatarName('test')
  const second = new AvatarName({ first: 'test', last: 'Linden' })
  const third = new AvatarName('tEst Resident')

  global.expect(first.compare(second)).toBe(false)
  global.expect(second.compare(third)).toBe(false)
  global.expect(second.compare('Test Linden')).toBe(true)
  global.expect(second.compare(third)).toBe(false)
  global.expect(first.compare({
    first: 'Test',
    last: 'Resident'
  })).toBe(true)
})

global.test('should format names', () => {
  global.expect(new AvatarName('tester linden')).toEqual({
    first: 'Tester',
    last: 'Linden',
    displayName: '',
    didLoadDisplayName: false,
    isLoadingDisplayName: false
  })

  global.expect(new AvatarName('teSteR lInDeN')).toEqual({
    first: 'Tester',
    last: 'Linden',
    displayName: '',
    didLoadDisplayName: false,
    isLoadingDisplayName: false
  })
})

global.test('should copy itself', () => {
  const old = new AvatarName('test')
  const isLoading = old.withIsLoadingSetTo(true)
  const displayName = isLoading.withDisplayNameSetTo('Hello')

  global.expect(old).not.toBe(isLoading)
  global.expect(isLoading).not.toBe(displayName)
})

global.test('should update its display name', () => {
  const old = new AvatarName('test')
  const isLoading = old.withIsLoadingSetTo(true)
  const displayName = isLoading.withDisplayNameSetTo('Hello')

  global.expect(isLoading).toEqual({
    first: 'Test',
    last: 'Resident',
    displayName: '',
    didLoadDisplayName: false,
    isLoadingDisplayName: true
  })

  global.expect(displayName).toEqual({
    first: 'Test',
    last: 'Resident',
    displayName: 'Hello',
    didLoadDisplayName: true,
    isLoadingDisplayName: false
  })
})
