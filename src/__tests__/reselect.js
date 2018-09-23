import { createSelector } from 'reselect'

test('selectors only call the function if something changes', () => {
  let callCount = 0

  const selector = createSelector(
    state => state.a,
    state => state.b,
    (a, b) => {
      callCount += 1
      return { num: a + b.num }
    }
  )

  const firstState = {
    a: 3,
    b: {
      num: 4
    }
  }
  const firstResult = selector(firstState)

  expect(callCount).toBe(1)
  expect(firstResult).toEqual({ num: 7 })

  const secondResult = selector(firstState)
  expect(callCount).toBe(1)
  expect(secondResult).toBe(firstResult)

  const secondState = Object.assign({}, firstState, {
    a: 5
  })

  const thirdResult = selector(secondState)
  expect(callCount).toBe(2)
  expect(thirdResult).not.toBe(firstResult)
  expect(thirdResult).toEqual({ num: 9 })

  const thirdState = Object.assign({}, secondState, {
    c: 5
  })
  const fourthResult = selector(thirdState)
  expect(callCount).toBe(2)
  expect(fourthResult).toBe(thirdResult)
})
