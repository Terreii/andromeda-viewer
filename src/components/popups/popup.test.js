import { axe } from 'jest-axe'
import React from 'react'
import { shallow, mount } from 'enzyme'

import Popup from './popup'

test('renders without crashing', () => {
  shallow(
    <Popup
      title='Welcome'
      onClose={() => {}}
    >
      Hello World!
    </Popup>
  )
})

test('renders welcome message', () => {
  const aPopup = mount(
    <Popup
      title='Welcome'
      onClose={() => {}}
    >
      <span>Hello World!</span>
    </Popup>
  )

  expect(aPopup).toContainReact(<img
    src='icon_close.svg'
    alt='close popup'
    height='32'
    width='32'
  />)

  const header = aPopup.find('h4')
  expect(header.text()).toBe('Welcome')
  expect(header).toHaveStyleRule('margin-left', '1.3em')

  expect(aPopup).toContainReact(<span>Hello World!</span>)
})

test('call the onClose callback', () => {
  let wasCalled = false
  let defaultPrevented = false

  const aPopup = mount(
    <Popup
      title='Welcome'
      onClose={() => {
        wasCalled = true
      }}
    >
      <span>Hello World!</span>
    </Popup>
  )

  aPopup.find('button').simulate('click', {
    preventDefault: () => {
      defaultPrevented = true
    }
  })

  expect(wasCalled).toBe(true)
  expect(defaultPrevented).toBe(true)
})

test('should pass aXe', async () => {
  const rendered = mount(<Popup
    title='Welcome'
    onClose={() => {}}
  >
    Hello World!
  </Popup>)

  expect(await axe(rendered.html())).toHaveNoViolations()
})
