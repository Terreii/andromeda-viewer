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

  expect(rendered.find('h4').text()).toBe('sign in')
})

test('renders signUp without crashing', () => {
  const rendered = mount(
    <PopupRenderer
      popup='signUp'
      unlock={() => {}}
      signOut={() => {}}
    />
  )

  expect(rendered.find('h4').text()).toBe('sign up')
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
