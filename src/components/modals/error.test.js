import { axe } from 'jest-axe'
import configureMockStore from 'redux-mock-store'
import React from 'react'
import { Provider } from 'react-redux'
import { render } from 'reakit-test-utils'
import thunk from 'redux-thunk'

import ErrorModal from './error'

const mockStore = configureMockStore([thunk])

it('renders without crashing', () => {
  const store = mockStore()
  const Comp = () => {
    return <Provider store={store}>
      <ErrorModal errorMessage='Test, test!' />
    </Provider>
  }

  render(<Comp />)
})

it('should pass aXe', async () => {
  const store = mockStore()
  const Comp = () => {
    return <Provider store={store}>
      <ErrorModal errorMessage='Test, test!' />
    </Provider>
  }

  const { container } = render(<Comp />)

  expect(await axe(container)).toHaveNoViolations()
})
