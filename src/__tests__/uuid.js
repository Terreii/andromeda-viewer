import uuid, { v4 } from 'uuid'

test('it should have a v4 function', () => {
  expect(typeof uuid.v4).toBe('function')
  expect(typeof v4).toBe('function')
})

test('it should create a valid uuid', () => {
  const reg = /[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-4[0-9A-Fa-f]{3}-[89abAB][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}/
  expect(uuid.v4()).toMatch(reg)
  expect(v4()).toMatch(reg)
})
