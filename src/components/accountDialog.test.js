import { axe } from 'jest-axe'
import React from 'react'
import { Provider } from 'react-redux'
import { render, fireEvent } from '@testing-library/react'

import AccountDialog from './accountDialog'
import configureStore from '../store/configureStore'
import { updateAccount } from '../actions/viewerAccount'
import { signInStatus } from '../bundles/account'

jest.mock('../actions/viewerAccount')

updateAccount.mockImplementation(args => async () => {
  return args // mock a promise
})

it('should display and update the account name', async () => {
  const store = configureStore()
  store.dispatch(signInStatus(true, true, 'tester.mactestface@viewer.com'))

  const { queryByLabelText, queryByText, findByLabelText, findByText } = render(
    <Provider store={store}>
      <AccountDialog />
    </Provider>
  )

  const username = queryByLabelText('Username / Mail')
  expect(username).toBeTruthy()
  expect(username.nodeName).toBe('INPUT')
  expect(username.type).toBe('email')
  expect(username.value).toBe('tester.mactestface@viewer.com')

  const updateButton = queryByText('update')
  expect(updateButton).toBeTruthy()
  expect(updateButton.nodeName).toBe('BUTTON')
  expect(updateButton.disabled).toBeTruthy()

  // enter a not valid email address
  fireEvent.change(username, {
    target: {
      value: 'tester.mactestface@'
    }
  })
  expect((await findByLabelText('Username / Mail')).value).toBe('tester.mactestface@')
  expect(queryByText('update').disabled).toBeTruthy()

  fireEvent.submit(username)
  expect(updateAccount.mock.calls.length).toBe(0)

  // reset data
  const resetButton = await findByText('reset')
  expect(resetButton).toBeTruthy()
  expect(resetButton.nodeName).toBe('BUTTON')
  expect(resetButton.type).toBe('reset')

  fireEvent.click(resetButton)

  expect((await findByLabelText('Username / Mail')).value).toBe('tester.mactestface@viewer.com')
  expect(queryByText('update').disabled).toBeTruthy()

  fireEvent.submit(username)
  expect(updateAccount.mock.calls.length).toBe(0)

  // enter and change a valid email address
  fireEvent.change(await findByLabelText('Username / Mail'), {
    target: {
      value: 'tester.mactestface@viewer.net'
    }
  })
  expect((await findByLabelText('Username / Mail')).value).toBe('tester.mactestface@viewer.net')
  expect(updateButton.disabled).toBeTruthy()

  fireEvent.change(queryByLabelText('Current password'), {
    target: {
      value: 'password'
    }
  })
  // Update button
  expect((await findByText('update')).disabled).toBeFalsy()

  // change username
  fireEvent.submit(username)

  expect((await findByLabelText('Username / Mail')).value).toBe('tester.mactestface@viewer.net')
  expect(updateAccount.mock.calls.length).toBe(1)
  expect(updateAccount.mock.calls[0]).toEqual([
    {
      nextUsername: 'tester.mactestface@viewer.net',
      password: 'password'
    }
  ])
})

it('should change the password', async () => {
  const store = configureStore()
  store.dispatch(signInStatus(true, true, 'tester.mactestface@viewer.com'))

  const startUpdateCallCount = updateAccount.mock.calls.length

  const { queryByLabelText, queryByText, findByLabelText } = render(
    <Provider store={store}>
      <AccountDialog />
    </Provider>
  )

  const passwordChangeOld = queryByLabelText('Current password')
  expect(passwordChangeOld).toBeTruthy()
  expect(passwordChangeOld.nodeName).toBe('INPUT')
  expect(passwordChangeOld.type).toBe('password')
  expect(passwordChangeOld.autocomplete).toBe('current-password')

  const passwordChangeNew = queryByLabelText('New password')
  expect(passwordChangeNew).toBeTruthy()
  expect(passwordChangeNew.nodeName).toBe('INPUT')
  expect(passwordChangeNew.type).toBe('password')
  expect(passwordChangeNew.autocomplete).toBe('new-password')

  const passwordChangeRepeat = queryByLabelText('Repeat password')
  expect(passwordChangeRepeat).toBeTruthy()
  expect(passwordChangeRepeat.nodeName).toBe('INPUT')
  expect(passwordChangeRepeat.type).toBe('password')
  expect(passwordChangeRepeat.autocomplete).toBe('new-password')

  const updateButton = queryByText('update')
  expect(updateButton).toBeTruthy()
  expect(updateButton.nodeName).toBe('BUTTON')
  expect(updateButton.disabled).toBeTruthy()

  fireEvent.submit(queryByLabelText('Username / Mail'))
  expect(updateAccount.mock.calls.length).toBe(startUpdateCallCount)

  // enter Current password
  fireEvent.change(passwordChangeOld, {
    target: {
      value: 'oldPassword'
    }
  })

  expect((await findByLabelText('Current password')).value).toBe('oldPassword')
  expect(passwordChangeNew.value).toBe('')
  expect(passwordChangeRepeat.value).toBe('')
  expect(updateButton.disabled).toBeTruthy()

  fireEvent.click(updateButton)
  expect(updateAccount.mock.calls.length).toBe(startUpdateCallCount)

  // enter new password
  fireEvent.change(await findByLabelText('New password'), {
    target: {
      value: 'newPassword'
    }
  })

  expect((await findByLabelText('Current password')).value).toBe('oldPassword')
  expect(passwordChangeNew.value).toBe('newPassword')
  expect(passwordChangeRepeat.value).toBe('')
  expect(updateButton.disabled).toBeTruthy()

  fireEvent.click(updateButton)
  expect(updateAccount.mock.calls.length).toBe(startUpdateCallCount)

  // enter not matching password
  fireEvent.change(await findByLabelText('Repeat password'), {
    target: {
      value: 'otherPassword'
    }
  })

  expect((await findByLabelText('Current password')).value).toBe('oldPassword')
  expect(passwordChangeNew.value).toBe('newPassword')
  expect(passwordChangeRepeat.value).toBe('otherPassword')
  expect(updateButton.disabled).toBeTruthy()

  fireEvent.click(updateButton)
  expect(updateAccount.mock.calls.length).toBe(startUpdateCallCount)

  // enter new password
  fireEvent.change(await findByLabelText('Repeat password', { exact: false }), {
    target: {
      value: 'newPassword'
    }
  })

  expect((await findByLabelText('Current password')).value).toBe('oldPassword')
  expect(passwordChangeNew.value).toBe('newPassword')
  expect(passwordChangeRepeat.value).toBe('newPassword')
  expect(updateButton.disabled).toBeFalsy()

  // change username
  fireEvent.click(updateButton)

  expect((await findByLabelText('Current password')).value).toBe('')
  expect(passwordChangeNew.value).toBe('')
  expect(passwordChangeRepeat.value).toBe('')
  expect(updateButton.disabled).toBeTruthy()

  expect(updateAccount.mock.calls.length).toBe(startUpdateCallCount + 1)
  expect(updateAccount.mock.calls[startUpdateCallCount]).toEqual([
    {
      nextPassword: 'newPassword',
      password: 'oldPassword'
    }
  ])
})

it('should allow to change username and password at the same time', async () => {
  const store = configureStore()
  store.dispatch(signInStatus(true, true, 'tester.mactestface@viewer.com'))

  const startUpdateCallCount = updateAccount.mock.calls.length

  const { queryByLabelText, findByLabelText, findByText } = render(
    <Provider store={store}>
      <AccountDialog />
    </Provider>
  )

  fireEvent.change(queryByLabelText('Username / Mail'), {
    target: {
      value: 'tester.mactestface@viewer.net'
    }
  })

  fireEvent.change(await findByLabelText('Current password'), {
    target: {
      value: 'oldPassword'
    }
  })

  fireEvent.change(await findByLabelText('New password'), {
    target: {
      value: 'newPassword'
    }
  })

  fireEvent.change(await findByLabelText('Repeat password'), {
    target: {
      value: 'newPassword'
    }
  })

  fireEvent.click(await findByText('update'))

  expect((await findByLabelText('Username / Mail')).value).toBe('tester.mactestface@viewer.net')
  expect(queryByLabelText('Current password').value).toBe('')
  expect(queryByLabelText('New password').value).toBe('')
  expect(queryByLabelText('Repeat password').value).toBe('')

  expect(updateAccount.mock.calls.length).toBe(startUpdateCallCount + 1)
  expect(updateAccount.mock.calls[startUpdateCallCount]).toEqual([
    {
      nextUsername: 'tester.mactestface@viewer.net',
      nextPassword: 'newPassword',
      password: 'oldPassword'
    }
  ])
})

it('should pass aXe', async () => {
  const store = configureStore()
  store.dispatch(signInStatus(true, true, 'tester.mactestface@viewer.com'))

  const { container } = render(
    <Provider store={store}>
      <AccountDialog />
    </Provider>
  )

  expect(await axe(container)).toHaveNoViolations()
})
