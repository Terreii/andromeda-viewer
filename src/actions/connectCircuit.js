import simAction from './simAction'
import { userWasKicked } from '../bundles/session'

// Starts listening to packets on the circuit and dispatch a parsed action.
export default function init () {
  return (dispatch, getState, { circuit }) => {
    let listeners = connect(dispatch, circuit)

    if (process.env.NODE_ENV !== 'production') {
      if (module.hot) {
        // Replace simAction-callback if it changes
        module.hot.accept('./simAction', () => {
          removeEventListeners(circuit, listeners)
          listeners = connect(dispatch, circuit)
        })

        module.hot.accept('../bundles/session', () => {
          removeEventListeners(circuit, listeners)
          listeners = connect(dispatch, circuit)
        })
      }
    }
  }
}

/**
 * Connects the event listeners to the Circuit.
 * @param {function} dispatch    Redux Store dispatch
 * @param {EventTarget} circuit  Circuit from network/circuit.
 * @returns {{simAction: EventListener, closeHandler: EventListener}} Event listeners.
 */
function connect (dispatch, circuit) {
  const listeners = {
    simAction: event => {
      dispatch(simAction(event))
    },
    closeHandler: null
  }
  listeners.closeHandler = closeHandler(dispatch, listeners)

  circuit.addEventListener('packetReceived', listeners.simAction)
  circuit.addEventListener('close', listeners.closeHandler)

  return listeners
}

/**
 * Remove all event listeners from the circuit.
 * @param {EventTarget} circuit Circuit from network/circuit.
 * @param {{simAction: EventListener, closeHandler: EventListener}} listeners Event listeners.
 */
function removeEventListeners (circuit, listeners) {
  circuit.removeEventListener('packetReceived', listeners.simAction)
  circuit.removeEventListener('close', listeners.closeHandler)
}

/**
 * Listens to close event. If the there is a reason, dispatch it.
 * @param {function} dispatch    Redux Store dispatch
 * @param {simAction: EventListener, closeHandler: EventListener} listeners Event listeners.
 */
function closeHandler (dispatch, listeners) {
  const disconnectMessage = 'You have been disconnected!\n\n' +
    'Please check if you have an Internet connection.\n' +
    'This problem could also be on our or the grids side.'

  const reasonTexts = {
    'UDP disconnect': disconnectMessage,
    'Max reconnection tries': disconnectMessage
  }

  return event => {
    const reason = event.detail.reason in reasonTexts
      ? reasonTexts[event.detail.reason]
      : event.detail.reason

    dispatch((dispatch, getState, { circuit }) => {
      removeEventListeners(circuit, listeners)

      if (event.detail.code !== 1000) {
        // not normal circuit close
        dispatch(userWasKicked({ reason }))
      }
    })
  }
}
