import React from 'react'
import ReactDOM from 'react-dom'

import Root from './containers/root'
import store from './store/state'
import registerServiceWorker from './registerServiceWorker'

ReactDOM.render(
  <Root store={store} />,
  document.getElementById('root')
)
registerServiceWorker()
