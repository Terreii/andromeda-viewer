import createCallback from './simAction'
import { userWasKicked } from '../bundles/session'

// Starts listening to packets on the circuit and dispatch a parsed action.
export default function init () {
  return (dispatch, getState, { circuit }) => {
    let callback = createCallback(dispatch)
    circuit.on('packetReceived', callback)

    let closeHandler = getCloseHandler(dispatch)
    circuit.on('close', closeHandler)

    if (process.env.NODE_ENV !== 'production') {
      if (module.hot) {
        // Replace simAction-callback if it changes
        module.hot.accept('./simAction', () => {
          circuit.removeListener('packetReceived', callback)
          callback = createCallback(dispatch)
          circuit.on('packetReceived', callback)
        })

        module.hot.accept('../bundles/session', () => {
          circuit.removeListener('close', closeHandler)
          closeHandler = getCloseHandler(dispatch)
          circuit.on('close', closeHandler)
        })
      }
    }
  }
}

function getCloseHandler (dispatch) {
  const disconnectMessage = 'You have been disconnected!\n\n' +
    'Please check if you have an Internet connection.\n' +
    'This problem could also be on our or the grids side.'

  const reasonTexts = {
    'UDP disconnect': disconnectMessage,
    'Max reconnection tries': disconnectMessage
  }

  return event => {
    const reason = event.reason in reasonTexts
      ? reasonTexts[event.reason]
      : event.reason
    dispatch(userWasKicked({ reason }))
  }
}
