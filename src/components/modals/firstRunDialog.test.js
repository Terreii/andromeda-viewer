import { axe } from 'jest-axe'
import React from 'react'
import { Provider } from 'react-redux'
import { render } from 'reakit-test-utils'

import FirstRunDialog from './firstRunDialog'
import configureStore from '../../store/configureStore'

it('should render without crashing', () => {
  const { container } = render(<Provider store={configureStore()}>
    <FirstRunDialog />
  </Provider>)

  expect(container).toBeTruthy()
})

it('should pass aXe', async () => {
  const { container } = render(<Provider store={configureStore()}>
    <FirstRunDialog />
  </Provider>)

  expect(await axe(container)).toHaveNoViolations()
})
