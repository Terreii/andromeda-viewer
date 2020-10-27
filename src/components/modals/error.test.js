import { axe } from 'jest-axe'
import configureMockStore from 'redux-mock-store'
import { Provider } from 'react-redux'
import { render } from 'reakit-test-utils'
import thunk from 'redux-thunk'

import ErrorModal from './error'

const mockStore = configureMockStore([thunk])

it('renders without crashing', () => {
  const store = mockStore()

  render(
    <Provider store={store}>
      <ErrorModal errorMessage='Test, test!' />
    </Provider>
  )
})

it('should pass aXe', async () => {
  const store = mockStore()

  const { container } = render(
    <Provider store={store}>
      <ErrorModal errorMessage='Test, test!' />
    </Provider>
  )

  expect(await axe(container)).toHaveNoViolations()
})
