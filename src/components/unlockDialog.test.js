import React from 'react'
import { shallow, mount } from 'enzyme'

import UnlockDialog from './unlockDialog'

test('renders without crashing', () => {
  shallow(<UnlockDialog
    onUnlock={() => {}}
    onSignOut={() => {}}
  />)
})

test('unlock with return key', () => {
  const unlockEvents = {
    count: 0,
    lastPassword: null,
    nextShouldError: null
  }
  let signOutCount = 0

  const rendered = mount(<UnlockDialog
    onUnlock={password => {
      unlockEvents.count += 1
      unlockEvents.lastPassword = password

      if (unlockEvents.nextShouldError != null) {
        const error = unlockEvents.nextShouldError
        unlockEvents.nextShouldError = null
        return Promise.reject(error)
      } else {
        return Promise.resolve()
      }
    }}
    onSignOut={() => {
      signOutCount += 1
    }}
  />)

  const pwInput = rendered.find('input[type="password"]')
  expect(pwInput).toBeTruthy()

  pwInput.simulate('keyUp', {
    keyCode: 13
  })
  expect(unlockEvents.count).toBe(0) // empty input doesn't unlock
  expect(rendered.find('span').at(2).text()).toBe('No password was entered jet!')

  pwInput.simulate('change', {
    target: {
      value: 'aPassword'
    }
  })

  pwInput.simulate('keyUp', {
    keyCode: 13
  })
  expect(unlockEvents).toEqual({
    count: 1,
    lastPassword: 'aPassword',
    nextShouldError: null
  })

  expect(signOutCount).toBe(0)
})

test('unlock with button', () => {
  const unlockEvents = {
    count: 0,
    lastPassword: null,
    nextShouldError: null
  }
  let signOutCount = 0

  const rendered = mount(<UnlockDialog
    onUnlock={password => {
      unlockEvents.count += 1
      unlockEvents.lastPassword = password

      if (unlockEvents.nextShouldError != null) {
        const error = unlockEvents.nextShouldError
        unlockEvents.nextShouldError = null
        return Promise.reject(error)
      } else {
        return Promise.resolve()
      }
    }}
    onSignOut={() => {
      signOutCount += 1
    }}
  />)

  const pwInput = rendered.find('input[type="password"]')
  expect(pwInput).toBeTruthy()
  const unlockButton = rendered.find('button').at(0)
  expect(unlockButton).toBeTruthy()
  const signOutButton = rendered.find('button').at(1)
  expect(signOutButton).toBeTruthy()

  unlockButton.simulate('click')
  expect(unlockEvents.count).toBe(0) // empty input doesn't unlock
  expect(rendered.find('span').at(2).text()).toBe('No password was entered jet!')

  pwInput.simulate('change', {
    target: {
      value: 'aPassword'
    }
  })
  unlockButton.simulate('click')
  expect(unlockEvents).toEqual({
    count: 1,
    lastPassword: 'aPassword',
    nextShouldError: null
  })

  expect(signOutCount).toBe(0)
})

test('sign out', () => {
  let unlockCount = 0
  let signOutCount = 0

  const rendered = shallow(<UnlockDialog
    onUnlock={() => {
      unlockCount += 1
    }}
    onSignOut={() => {
      signOutCount += 1
    }}
  />)

  const signOutButton = rendered.find('button').at(1)
  expect(signOutButton).toBeTruthy()
  expect(signOutButton.text()).toBe('Sign out')

  signOutButton.simulate('click')

  expect(unlockCount).toBe(0)
  expect(signOutCount).toBe(1)
})
