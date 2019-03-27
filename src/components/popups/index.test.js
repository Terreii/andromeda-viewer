import React from 'react'
import { shallow, mount } from 'enzyme'

import PopupRenderer from './index'

test('renders without crashing', () => {
  shallow(
    <PopupRenderer
      popup='Welcome'
      onClose={() => {}}
    />
  )
})

test('renders unlock without crashing', () => {
  const rendered = mount(
    <PopupRenderer
      popup='unlock'
      unlock={() => {}}
      signOut={() => {}}
    />
  )

  expect(rendered.find('h4 span').text()).toBe('Unlock')
})

test('renders signIn without crashing', () => {
  const rendered = mount(
    <PopupRenderer
      popup='signIn'
      unlock={() => {}}
      signOut={() => {}}
    />
  )

  expect(rendered.find('h4').text()).toBe('Sign in')
})

test('renders signUp without crashing', () => {
  const rendered = mount(
    <PopupRenderer
      popup='signUp'
      unlock={() => {}}
      signOut={() => {}}
    />
  )

  expect(rendered.find('h4').text()).toBe('Sign up')
})

test('renders resetKeys without crashing', () => {
  global.URL.createObjectURL = jest.fn()
  global.URL.revokeObjectURL = jest.fn()

  const rendered = mount(
    <PopupRenderer
      popup='resetKeys'
      unlock={() => {}}
      signOut={() => {}}
      data={[
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
      ]}
    />
  )

  expect(rendered.find('h4').text()).toBe('Password reset keys')
})

test('renders signOut without crashing', () => {
  const rendered = mount(
    <PopupRenderer
      popup='signOut'
      unlock={() => {}}
      signOut={() => {}}
    />
  )

  expect(rendered.find('h4').text()).toBe('Sign Out?')
})
