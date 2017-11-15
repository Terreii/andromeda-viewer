import React from 'react'
import ReactDOM from 'react-dom'

import Root from './containers/root'
import configureStore from './store/configureStore'
import registerServiceWorker from './registerServiceWorker'

const store = configureStore()

ReactDOM.render(
  <Root store={store} />,
  document.getElementById('root')
)

if (process.env.NODE_ENV !== 'production') {
  if (module.hot) {
    module.hot.accept('./containers/root', () => {
      ReactDOM.render(
        <Root store={store} />,
        document.getElementById('root')
      )
    })
  }
}

registerServiceWorker()
