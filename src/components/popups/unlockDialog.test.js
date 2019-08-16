import { axe } from 'jest-axe'
import React from 'react'
import { shallow, mount } from 'enzyme'

import UnlockDialog from './unlockDialog'

test('renders without crashing', () => {
  const rendered = shallow(<UnlockDialog
    onUnlock={() => {}}
    onForgottenPassword={() => {}}
    onSignOut={() => {}}
  />)

  expect(rendered).toBeTruthy()
})

test('unlock with return key', () => {
  const unlockEvents = {
    count: 0,
    lastPassword: null,
    nextShouldError: null
  }
  let signOutCount = 0
  let resetPasswordCount = 0

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
    onForgottenPassword={() => {
      resetPasswordCount += 1
    }}
    onSignOut={() => {
      signOutCount += 1
    }}
  />)

  const pwInput = rendered.find('input[type="password"]')
  expect(pwInput).toBeTruthy()

  expect(rendered.find('small').first().text()).toBe(
    'If you did forget your encryption-password?Reset password'
  )

  pwInput.simulate('keyDown', {
    keyCode: 13
  })
  expect(unlockEvents.count).toBe(0) // empty input doesn't unlock
  expect(rendered.find('small').at(1).text()).toBe('No password was entered jet!')

  pwInput.simulate('change', {
    target: {
      value: 'aPassword'
    }
  })

  pwInput.simulate('keyDown', {
    keyCode: 13
  })
  expect(unlockEvents).toEqual({
    count: 1,
    lastPassword: 'aPassword',
    nextShouldError: null
  })

  expect(signOutCount).toBe(0)
  expect(resetPasswordCount).toBe(0)
})

test('unlock with button', () => {
  const unlockEvents = {
    count: 0,
    lastPassword: null,
    nextShouldError: null
  }
  let signOutCount = 0
  let resetPasswordCount = 0

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
    onForgottenPassword={() => {
      resetPasswordCount += 1
    }}
    onSignOut={() => {
      signOutCount += 1
    }}
  />)

  const pwInput = rendered.find('input[type="password"]')
  expect(pwInput).toBeTruthy()
  const unlockButton = rendered.find('#unlockButton').first()
  expect(unlockButton).toBeTruthy()
  const signOutButton = rendered.find('#signOutButton').first()
  expect(signOutButton).toBeTruthy()

  expect(rendered.find('small').first().text()).toBe(
    'If you did forget your encryption-password?Reset password'
  )

  unlockButton.simulate('click')
  expect(unlockEvents.count).toBe(0) // empty input doesn't unlock
  expect(rendered.find('small').at(1).text()).toBe('No password was entered jet!')

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
  expect(resetPasswordCount).toBe(0)
})

test('sign out', () => {
  let unlockCount = 0
  let signOutCount = 0
  let resetPasswordCount = 0

  const rendered = mount(<UnlockDialog
    onUnlock={() => {
      unlockCount += 1
    }}
    onForgottenPassword={() => {
      resetPasswordCount += 1
    }}
    onSignOut={() => {
      signOutCount += 1
    }}
  />)

  const signOutButton = rendered.find('#signOutButton').first()
  expect(signOutButton).toBeTruthy()
  expect(signOutButton.text()).toBe('Sign out')

  signOutButton.simulate('click')

  expect(unlockCount).toBe(0)
  expect(signOutCount).toBe(1)
  expect(resetPasswordCount).toBe(0)
})

test('should callOnForgottenPassword if the reset password button is clicked', () => {
  let unlockCount = 0
  let signOutCount = 0
  let resetPasswordCount = 0

  const rendered = mount(<UnlockDialog
    onUnlock={() => {
      unlockCount += 1
    }}
    onForgottenPassword={arg => {
      resetPasswordCount += 1
      expect(arg).toBe('encryption')
    }}
    onSignOut={() => {
      signOutCount += 1
    }}
  />)

  const resetPasswordButton = rendered.find('#resetPasswordButton').first()

  resetPasswordButton.simulate('click')

  expect(unlockCount).toBe(0)
  expect(signOutCount).toBe(0)
  expect(resetPasswordCount).toBe(1)
})

test('should pass aXe', async () => {
  const rendered = mount(<UnlockDialog
    onUnlock={() => {}}
    onForgottenPassword={() => {}}
    onSignOut={() => {}}
  />)

  expect(await axe(rendered.html())).toHaveNoViolations()
})
