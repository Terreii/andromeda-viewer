import { v4 as uuid } from 'uuid'

it('should have a v4 function', () => {
  expect(typeof uuid).toBe('function')
})

it('should create a valid uuid', () => {
  const reg = /[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-4[0-9A-Fa-f]{3}-[89abAB][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}/
  expect(uuid()).toMatch(reg)
})
