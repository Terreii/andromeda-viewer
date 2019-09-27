import React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'

import App from './app'

export default function Root ({ store }) {
  return <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
}
