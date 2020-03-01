import { axe } from 'jest-axe'
import React from 'react'
import { render } from 'reakit-test-utils'

import InfoSection from './info-section'

it('should render without crashing', () => {
  const { container } = render(<InfoSection />)

  expect(container).toBeTruthy()
})

it('should pass aXe', async () => {
  const { container } = render(<InfoSection />)

  expect(await axe(container)).toHaveNoViolations()
})
