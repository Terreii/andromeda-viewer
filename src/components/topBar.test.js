import { axe } from 'jest-axe'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { render } from 'reakit-test-utils'

import TopBar from './topBar'
import configureStore from '../store/configureStore'

it('renders without crashing', () => {
  const store = configureStore()

  const { container } = render(
    <Provider store={store}>
      <MemoryRouter>
        <TopBar />
      </MemoryRouter>
    </Provider>
  )

  expect(container).toBeTruthy()
})

it('should pass aXe', async () => {
  const store = configureStore()

  const { container } = render(
    <Provider store={store}>
      <MemoryRouter>
        <TopBar />
      </MemoryRouter>
    </Provider>
  )

  expect(await axe(container)).toHaveNoViolations()
})
