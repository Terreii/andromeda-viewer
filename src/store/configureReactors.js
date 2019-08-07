import { request as requestIdleCallback } from 'requestidlecallback'

import reactors from '../reactors/'

export default function configureReactors (store) {
  let mappedReactors = mapReactors(reactors)

  store.subscribe(() => {
    const state = store.getState()

    reacting(store.dispatch, state, mappedReactors)
  })

  if (process.env.NODE_ENV !== 'production') {
    if (module.hot) {
      // Enable Webpack hot module replacement for reactors
      module.hot.accept('../reactors/', () => {
        mappedReactors = mapReactors(reactors)
      })
    }
  }
}

// Save-guards against dispatching the same action multiple times
function mapReactors (reactors) {
  return reactors.map(reactor => {
    let lastResult = null

    return state => {
      const result = reactor(state)

      if (result !== lastResult) {
        lastResult = result
        return result
      }

      return null
    }
  })
}

function reacting (dispatch, state, reactors) {
  for (const reactor of reactors) {
    const action = reactor(state)

    if (action != null) {
      requestIdleCallback(() => {
        dispatch(action)
      })
      return
    }
  }
}
