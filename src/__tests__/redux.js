import { createStore, applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'

test('redux and thunk should have their public functions', () => {
  expect(createStore).toBeInstanceOf(Function)
  expect(applyMiddleware).toBeInstanceOf(Function)
  expect(compose).toBeInstanceOf(Function)
  expect(thunkMiddleware).toBeInstanceOf(Function)
})

describe('basic functionality of redux-store', () => {
  const store = createStore(
    (state = { text: 'hello' }, action) => action.type === 'UPDATE' ? action.next : state
  )

  test('the store should have the expected methods', () => {
    expect(store.dispatch).toBeInstanceOf(Function)
    expect(store.getState).toBeInstanceOf(Function)
    expect(store.replaceReducer).toBeInstanceOf(Function)
    expect(store.subscribe).toBeInstanceOf(Function)
  })

  test('getState returns the state', () => {
    expect(store.getState()).toEqual({ text: 'hello' })
  })

  test('dispatch should update the state', () => {
    const oldState = store.getState()

    expect(() => {
      expect(store.dispatch('TEST'))
    }).toThrow()

    expect(() => {
      expect(store.dispatch({ wrongKey: 'TEST' }))
    }).toThrow()

    store.dispatch({ type: 'NOT_UPDATE' })
    expect(store.getState()).toBe(oldState)

    store.dispatch({
      type: 'UPDATE',
      next: {
        foo: 'bar',
        text: 'baz'
      }
    })
    expect(store.getState()).not.toBe(oldState)
    expect(store.getState()).toEqual({
      foo: 'bar',
      text: 'baz'
    })
  })

  test('subscribe should call the function and return a unsubscribe fn', () => {
    let lastStates = [store.getState(), null]
    let callCount = 0

    const unsubscribe = store.subscribe(prop => {
      expect(prop).toBeUndefined()
      lastStates.unshift(store.getState())
      callCount += 1
    })
    expect(unsubscribe).toBeInstanceOf(Function)

    store.dispatch({
      type: 'UPDATE',
      next: {
        foo: 'bar',
        text: 'baz'
      }
    })
    expect(callCount).toBe(1)
    expect(lastStates[0]).not.toBe(lastStates[1])
    expect(lastStates[1]).not.toBeNull()

    store.dispatch({ type: 'NO_UPDATE' })
    expect(callCount).toBe(2)
    expect(lastStates[0]).toBe(lastStates[1])

    unsubscribe()
    const oldCallCount = callCount
    store.dispatch({
      type: 'UPDATE',
      next: {
        bar: 'foo',
        text: 'baz'
      }
    })
    expect(callCount).toBe(oldCallCount)
    expect(store.getState()).not.toBe(lastStates[0])
  })

  test('replace reducer should replace them', () => {
    let oldState = store.getState()

    store.dispatch({ type: 'NO_UPDATE' })
    expect(store.getState()).toBe(oldState)

    store.dispatch({
      type: 'UPDATE',
      next: {
        foo: 'bar',
        text: 'baz'
      }
    })
    expect(store.getState()).not.toBe(oldState)

    // replace
    store.replaceReducer((state, action) => action.type === 'NO_UPDATE' ? action.next : state)
    oldState = store.getState()

    store.dispatch({ type: 'UPDATE' })
    expect(store.getState()).toBe(oldState)

    store.dispatch({
      type: 'NO_UPDATE',
      next: {
        foo: 'bar',
        text: 'baz'
      }
    })
    expect(store.getState()).not.toBe(oldState)
  })
})

describe('middleware adding and thunk', () => {
  let store = null

  test('thunk as withExtraArgument', () => {
    expect(thunkMiddleware.withExtraArgument).toBeInstanceOf(Function)
    expect(thunkMiddleware.withExtraArgument({ callCount: 0 })).toBeInstanceOf(Function)
  })

  test('adding the middleware', () => {
    const enhancers = compose(
      applyMiddleware(
        thunkMiddleware.withExtraArgument({
          callCount: 0
        })
      )
    )

    store = createStore(
      (state = { text: 'hello' }, action) => action.type === 'UPDATE' ? action.next : state,
      // undefined, // old state
      enhancers
    )

    expect(store.dispatch).toBeInstanceOf(Function)
  })

  describe('dispatching a function', () => {
    test('should call it', () => {
      store.dispatch(() => {
        expect(true).toBe(true)
      })
    })

    test('it should receive dispatch, getState and the extra argument', () => {
      store.dispatch((dispatch, getState, extraArgument) => {
        expect(dispatch).toBeInstanceOf(Function)
        expect(getState).toBeInstanceOf(Function)
        expect(extraArgument).toEqual({
          callCount: 0
        })
      })
    })

    test('it should be possible to dispatch actions from within', () => {
      const oldState = store.getState()

      store.dispatch(dispatch => {
        dispatch({
          type: 'UPDATE',
          next: {
            text: 'world'
          }
        })
      })

      expect(store.getState()).not.toBe(oldState)
    })

    test('it should be possible to use getState from within', () => {
      const oldState = store.getState()

      store.dispatch((dispatch, getState) => {
        const activeState = getState()
        expect(activeState).toBe(oldState)
      })

      expect(store.getState()).toBe(oldState)
    })

    test('it should be possible to change the extra argument', () => {
      store.dispatch((dispatch, getState, extraArgument) => {
        extraArgument.callCount += 1
        extraArgument.foo = 'bar'
      })

      store.dispatch((dispatch, getState, extraArgument) => {
        expect(extraArgument).toEqual({
          callCount: 1,
          foo: 'bar'
        })
      })
    })

    test('it should return what the function returns', done => {
      let result = null

      expect(
        store.dispatch(() => {
          result = {
            foo: 'bar'
          }
          return result
        })
      ).toBe(result)

      store.dispatch(async () => {
        await new Promise(resolve => setTimeout(resolve), 0)
        return true
      })
        .then(didPass => {
          expect(didPass).toBe(true)
          done()
        })
    })
  })
})
