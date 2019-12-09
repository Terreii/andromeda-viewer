import { axe } from 'jest-axe'
import React from 'react'
import { mount } from 'enzyme'
import { Provider } from 'react-redux'

import AccountDialog from './accountDialog'
import configureStore from '../store/configureStore'
import { updateAccount } from '../actions/viewerAccount'

jest.mock('../actions/viewerAccount')

const { didSignIn } = jest.requireActual('../actions/viewerAccount')
updateAccount.mockImplementation(args => Promise.resolve({ ...args }))

test('should display and update the account name', () => {
  const store = configureStore()
  store.dispatch(didSignIn(true, true, 'tester.mactestface@viewer.com'))

  const rendered = mount(<Provider store={store}>
    <AccountDialog />
  </Provider>)

  expect(rendered.find('#usernameChange').prop('value')).toBe('tester.mactestface@viewer.com')
  expect(rendered.find('#updateAccountData').prop('disabled')).toBeTruthy()

  // enter a not valid email address
  rendered.find('#usernameChange').simulate('change', {
    target: {
      value: 'tester.mactestface@',
      validity: {
        valid: false
      }
    }
  })
  expect(rendered.find('#usernameChange').prop('value')).toBe('tester.mactestface@')
  expect(rendered.find('#updateAccountData').prop('disabled')).toBeTruthy()

  rendered.find('form').simulate('submit')
  expect(updateAccount.mock.calls.length).toBe(0)

  // reset data
  rendered.find('#accountDataReset').simulate('click')
  expect(rendered.find('#usernameChange').prop('value')).toBe('tester.mactestface@viewer.com')
  expect(rendered.find('#updateAccountData').prop('disabled')).toBeTruthy()

  rendered.find('form').simulate('submit')
  expect(updateAccount.mock.calls.length).toBe(0)

  // enter and change a valid email address
  rendered.find('#usernameChange').simulate('change', {
    target: {
      value: 'tester.mactestface@viewer.net',
      validity: {
        valid: true
      }
    }
  })
  expect(rendered.find('#usernameChange').prop('value')).toBe('tester.mactestface@viewer.net')
  expect(rendered.find('#updateAccountData').prop('disabled')).toBeFalsy()

  // change username
  rendered.find('form').simulate('submit')
  expect(updateAccount.mock.calls.length).toBe(1)
  expect(updateAccount.mock.calls[0]).toEqual([
    { nextUsername: 'tester.mactestface@viewer.net' }
  ])
})

test('should change the password', () => {
  const store = configureStore()
  store.dispatch(didSignIn(true, true, 'tester.mactestface@viewer.com'))

  const rendered = mount(<Provider store={store}>
    <AccountDialog />
  </Provider>)

  expect(rendered.find('#passwordChangeOld').prop('value')).toBe('')
  expect(rendered.find('#passwordChangeNew').prop('value')).toBe('')
  expect(rendered.find('#passwordChangeNew2').prop('value')).toBe('')
  expect(rendered.find('#updateAccountData').prop('disabled')).toBeTruthy()

  rendered.find('form').simulate('submit')
  expect(updateAccount.mock.calls.length).toBe(1)

  // enter old password
  rendered.find('#passwordChangeOld').simulate('change', {
    target: {
      value: 'oldPassword',
      validity: {
        valid: true
      }
    }
  })
  expect(rendered.find('#passwordChangeOld').prop('value')).toBe('oldPassword')
  expect(rendered.find('#passwordChangeNew').prop('value')).toBe('')
  expect(rendered.find('#passwordChangeNew2').prop('value')).toBe('')
  expect(rendered.find('#updateAccountData').prop('disabled')).toBeTruthy()

  rendered.find('form').simulate('submit')
  expect(updateAccount.mock.calls.length).toBe(1)

  // enter new password
  rendered.find('#passwordChangeNew').simulate('change', {
    target: {
      value: 'newPassword',
      validity: {
        valid: true
      }
    }
  })
  expect(rendered.find('#passwordChangeOld').prop('value')).toBe('oldPassword')
  expect(rendered.find('#passwordChangeNew').prop('value')).toBe('newPassword')
  expect(rendered.find('#passwordChangeNew2').prop('value')).toBe('')
  expect(rendered.find('#updateAccountData').prop('disabled')).toBeTruthy()

  rendered.find('form').simulate('submit')
  expect(updateAccount.mock.calls.length).toBe(1)

  // enter not matching password
  rendered.find('#passwordChangeNew2').simulate('change', {
    target: {
      value: 'otherPassword',
      validity: {
        valid: true
      }
    }
  })
  expect(rendered.find('#passwordChangeOld').prop('value')).toBe('oldPassword')
  expect(rendered.find('#passwordChangeNew').prop('value')).toBe('newPassword')
  expect(rendered.find('#passwordChangeNew2').prop('value')).toBe('otherPassword')
  expect(rendered.find('#updateAccountData').prop('disabled')).toBeTruthy()

  rendered.find('form').simulate('submit')
  expect(updateAccount.mock.calls.length).toBe(1)

  // enter new password
  rendered.find('#passwordChangeNew2').simulate('change', {
    target: {
      value: 'newPassword',
      validity: {
        valid: true
      }
    }
  })
  expect(rendered.find('#passwordChangeOld').prop('value')).toBe('oldPassword')
  expect(rendered.find('#passwordChangeNew').prop('value')).toBe('newPassword')
  expect(rendered.find('#passwordChangeNew2').prop('value')).toBe('newPassword')
  expect(rendered.find('#updateAccountData').prop('disabled')).toBeFalsy()

  // change username
  rendered.find('form').simulate('submit')
  expect(updateAccount.mock.calls.length).toBe(2)
  expect(updateAccount.mock.calls[1]).toEqual([
    {
      nextPassword: 'newPassword',
      password: 'oldPassword'
    }
  ])
})

test('should allow to change username and password at the same time', () => {
  const store = configureStore()
  store.dispatch(didSignIn(true, true, 'tester.mactestface@viewer.com'))

  const rendered = mount(<Provider store={store}>
    <AccountDialog />
  </Provider>)

  rendered.find('#usernameChange').simulate('change', {
    target: {
      value: 'tester.mactestface@viewer.net',
      validity: {
        valid: true
      }
    }
  })
  rendered.find('#passwordChangeOld').simulate('change', {
    target: {
      value: 'oldPassword',
      validity: {
        valid: true
      }
    }
  })
  rendered.find('#passwordChangeNew').simulate('change', {
    target: {
      value: 'newPassword',
      validity: {
        valid: true
      }
    }
  })
  rendered.find('#passwordChangeNew2').simulate('change', {
    target: {
      value: 'newPassword',
      validity: {
        valid: true
      }
    }
  })

  rendered.find('form').simulate('submit')
  expect(updateAccount.mock.calls.length).toBe(3)
  expect(updateAccount.mock.calls[2]).toEqual([
    {
      nextUsername: 'tester.mactestface@viewer.net',
      nextPassword: 'newPassword',
      password: 'oldPassword'
    }
  ])
})

test('should pass aXe', async () => {
  const rendered = mount(<Provider store={configureStore()}>
    <AccountDialog />
  </Provider>)

  expect(await axe(rendered.html())).toHaveNoViolations()
})
