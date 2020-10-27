import { Provider } from 'react-redux'
import { render } from '@testing-library/react'

import ModalsRenderer from './globalModals'

it('renders resetKeys without crashing', () => {
  global.URL.createObjectURL = jest.fn()
  global.URL.revokeObjectURL = jest.fn()

  const store = {
    getState: () => ({
      account: {
        loggedIn: true,
        unlocked: true,
        resetKeys: [
          '6f9be4b69637f3e18a0f747c4ae70158',
          '1d8ad0e879644a3cff07134a4b50bd09',
          '52f4944503133cd658cefbe5c905ba56',
          '8a04bce4d35319db6b54d9b109f6fd2e',
          '0f185fb339d36d635e58fc6c6be85edd',
          '1e34712bd7734c489a8e20e3212146e1',
          '74e7098dbc5a0cfaa7ab595cf4d970b7',
          'd6acf8385d77e16423a75a1b5a3a883c',
          '20050f0a104c0f5dcafcf8798f2d130e',
          '5d588ce0ee8de2b80aab0aaad8e57b38'
        ]
      },
      session: {}
    }),
    dispatch: () => {},
    subscribe: () => () => {}
  }

  const { queryByText } = render(
    <Provider store={store}>
      <ModalsRenderer />
    </Provider>
  )

  expect(queryByText('Password reset keys').nodeName).toBe('H4')
})
