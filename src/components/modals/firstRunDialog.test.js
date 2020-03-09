import { axe } from 'jest-axe'
import React from 'react'
import { render } from 'reakit-test-utils'

import FirstRunDialog from './firstRunDialog'

it('should render without crashing', () => {
  const { container } = render(<FirstRunDialog />)

  expect(container).toBeTruthy()
})

it('should pass aXe', async () => {
  const { container } = render(<FirstRunDialog />)

  expect(await axe(container)).toHaveNoViolations()
})
