import connectCircuit from './connectCircuit'

it('should listen to packages on the Circuit in the thunk extra argument', () => {
  const innerFn = connectCircuit()
  const dispatch = jest.fn()
  const getState = jest.fn(() => ({}))
  const circuitAddEventListener = jest.fn()

  innerFn(dispatch, getState, {
    circuit: {
      addEventListener: circuitAddEventListener
    }
  })

  expect(dispatch).not.toBeCalled()
  expect(getState).not.toBeCalled()
  expect(circuitAddEventListener).toBeCalledTimes(2)
  expect(circuitAddEventListener)
    .toHaveBeenNthCalledWith(1, 'packetReceived', expect.any(Function))
  expect(circuitAddEventListener).toHaveBeenNthCalledWith(2, 'close', expect.any(Function))
})

it('should close all event-listeners on the close event', () => {
  const innerFn = connectCircuit()
  const dispatch = jest.fn()
  const getState = jest.fn(() => ({}))
  const eventListeners = new Map()
  const circuitRemoveEventListener = jest.fn()
  const circuit = {
    addEventListener (eventName, listener) {
      eventListeners.set(eventName, listener)
    },
    removeEventListener: circuitRemoveEventListener
  }

  innerFn(dispatch, getState, { circuit })

  const closeListener = eventListeners.get('close')
  expect(typeof closeListener).toBe('function')

  closeListener(new window.CustomEvent('close', {
    detail: {
      code: 1006,
      reason: 'Max reconnection tries'
    }
  }))

  expect(dispatch).toHaveBeenLastCalledWith({
    type: 'session/userWasKicked',
    payload: {
      reason: 'You have been disconnected!\n\n' +
        'Please check if you have an Internet connection.\n' +
        'This problem could also be on our or the grids side.'
    }
  })
  expect(getState).not.toHaveBeenCalled()
  expect(circuitRemoveEventListener)
    .toHaveBeenNthCalledWith(1, 'packetReceived', eventListeners.get('packetReceived'))
  expect(circuitRemoveEventListener)
    .toHaveBeenNthCalledWith(2, 'close', eventListeners.get('close'))
})

it('should not dispatch an kick event if the circuit did close with 1000', () => {
  const innerFn = connectCircuit()
  const dispatch = jest.fn()
  const getState = jest.fn(() => ({}))
  const eventListeners = new Map()
  const circuitRemoveEventListener = jest.fn()
  const circuit = {
    addEventListener (eventName, listener) {
      eventListeners.set(eventName, listener)
    },
    removeEventListener: circuitRemoveEventListener
  }

  innerFn(dispatch, getState, { circuit })

  const closeListener = eventListeners.get('close')
  expect(typeof closeListener).toBe('function')

  closeListener(new window.CustomEvent('close', {
    detail: {
      code: 1000,
      reason: 'session end'
    }
  }))

  expect(dispatch).toBeCalledTimes(0)
  expect(getState).not.toHaveBeenCalled()
  expect(circuitRemoveEventListener)
    .toHaveBeenNthCalledWith(1, 'packetReceived', eventListeners.get('packetReceived'))
  expect(circuitRemoveEventListener)
    .toHaveBeenNthCalledWith(2, 'close', eventListeners.get('close'))
})
