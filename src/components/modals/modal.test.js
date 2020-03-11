import { axe } from 'jest-axe'
import React from 'react'
import { render } from 'reakit-test-utils'
import { useDialogState, DialogDisclosure } from 'reakit'

import Modal from './modal'

it('renders without crashing', () => {
  const Comp = () => {
    const dialog = useDialogState()
    return (
      <div>
        <DialogDisclosure {...dialog}>Open dialog</DialogDisclosure>
        <Modal dialog={dialog} title='hello world' showOnClose>
          Hello world!
        </Modal>
      </div>
    )
  }

  render(<Comp />)
})

it('should pass aXe', async () => {
  const Comp = () => {
    const dialog = useDialogState()
    return (
      <div>
        <DialogDisclosure {...dialog}>Open dialog</DialogDisclosure>
        <Modal dialog={dialog} title='hello world' showOnClose>
          Hello world!
        </Modal>
      </div>
    )
  }

  const { container } = render(<Comp />)

  expect(await axe(container)).toHaveNoViolations()
})
