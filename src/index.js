import React from 'react'
import ReactDOM from 'react-dom'

import Root from './app'
import configureStore from './store/configureStore'
import registerServiceWorker from './registerServiceWorker'
import reportWebVitals from './reportWebVitals'

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

// Learn more about service workers: https://cra.link/PWA
registerServiceWorker()

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
