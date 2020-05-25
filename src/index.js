import React from 'react'
import ReactDOM from 'react-dom'

import Root from './app'
import configureStore from './store/configureStore'
import registerServiceWorker from './registerServiceWorker'

import './styles.css'

const store = configureStore()

ReactDOM.render(
  <Root store={store} />,
  document.getElementById('root')
)

if (process.env.NODE_ENV !== 'production') {
  if (module.hot) {
    module.hot.accept('./app', () => {
      ReactDOM.render(
        <Root store={store} />,
        document.getElementById('root')
      )
    })
  }
}

registerServiceWorker()
