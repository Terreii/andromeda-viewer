import createCallback from './simAction'

// Starts listening to packets on the circuit and dispatch a parsed action.
export default function init () {
  return (dispatch, getState, { circuit }) => {
    let callback = createCallback(dispatch)
    circuit.on('packetReceived', callback)

    if (process.env.NODE_ENV !== 'production') {
      if (module.hot) {
        // Replace simAction-callback if it changes
        module.hot.accept('./simAction', () => {
          circuit.removeListener('packetReceived', callback)
          callback = createCallback(dispatch)
          circuit.on('packetReceived', callback)
        })
      }
    }
  }
}
