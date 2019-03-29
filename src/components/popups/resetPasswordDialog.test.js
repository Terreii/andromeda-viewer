import { axe } from 'jest-axe'
import React from 'react'
import { shallow, mount } from 'enzyme'

import ResetPasswordDialog from './resetPasswordDialog'

test('renders without crashing', () => {
  const rendered = shallow(<ResetPasswordDialog
    type='encryption'
    onChangePassword={() => {}}
    onSignOut={() => {}}
    onCancel={() => {}}
  />)

  expect(rendered).toBeTruthy()
})

test('should call onChangePassword only if the input is valid', () => {
  let changePwCount = 0
  let signOutCount = 0
  let cancelCount = 0

  let changePwArgs = {}

  const rendered = mount(<ResetPasswordDialog
    type='encryption'
    onChangePassword={(resetKey, password, other) => {
      changePwCount += 1
      changePwArgs = { resetKey, password, other }
      return Promise.resolve()
    }}
    onSignOut={() => {
      signOutCount += 1
    }}
    onCancel={() => {
      cancelCount += 1
    }}
  />)

  expect(rendered.find('h4').text()).toBe('Reset password')

  const buttons = rendered.find('article button')
  expect(buttons.length).toBe(3)

  const cancelButton = buttons.at(0)
  expect(cancelButton.text()).toBe('cancel')

  const signOutButton = buttons.at(1)
  expect(signOutButton.text()).toBe('sign out')

  const changePwButton = buttons.at(2)
  expect(changePwButton.text()).toBe('change encryption password')
  expect(changePwButton.prop('disabled')).toBe(true)

  const inputs = rendered.find('article input')
  expect(inputs.length).toBe(3)

  const resetKeyInput = inputs.at(0)
  expect(resetKeyInput.prop('type')).toBe('text')

  const newPwInput1 = inputs.at(1)
  const newPwInput2 = inputs.at(2)
  ;[newPwInput1, newPwInput2].forEach(input => {
    expect(input.prop('type')).toBe('password')
  })

  const updateInputs = (resetKey, pw1, pw2) => {
    resetKeyInput.simulate('change', {
      target: {
        value: resetKey
      }
    })

    newPwInput1.simulate('change', {
      target: {
        value: pw1
      }
    })

    newPwInput2.simulate('change', {
      target: {
        value: pw2
      }
    })

    rendered.update()
  }

  const getChangePwButton = () => rendered.find('article button').at(2)

  // only reset key, no new password
  updateInputs('2309ab6d30b8f201cd20fa9edead0b20', '', '')
  expect(getChangePwButton().prop('disabled')).toBe(true)

  // only new password
  updateInputs('', 'password', 'password')
  expect(getChangePwButton().prop('disabled')).toBe(true)

  // not matching passwords
  updateInputs('2309ab6d30b8f201cd20fa9edead0b20', 'password', 'passwo')
  expect(getChangePwButton().prop('disabled')).toBe(true)

  updateInputs('2309ab6d30b8f201cd20fa9edead0b20', 'passwo', 'password')
  expect(getChangePwButton().prop('disabled')).toBe(true)

  // not valid reset-key
  // to short
  updateInputs('2309ab6d30b8f201cd20fa9edead0b', 'password', 'password')
  expect(getChangePwButton().prop('disabled')).toBe(true)
  // to long
  updateInputs('2309ab6d30b8f201cd20fa9edead0b20a', 'password', 'password')
  expect(getChangePwButton().prop('disabled')).toBe(true)

  // everything is ok
  updateInputs('2309ab6d30b8f201cd20fa9edead0b20', 'password', 'password')
  expect(getChangePwButton().prop('disabled')).toBe(false)

  getChangePwButton().simulate('click')
  expect(cancelCount).toBe(0)
  expect(signOutCount).toBe(0)
  expect(changePwCount).toBe(1)
  expect(changePwArgs).toEqual({
    resetKey: '2309ab6d30b8f201cd20fa9edead0b20',
    password: 'password',
    other: undefined
  })
})

test('should call onSignOut and onCancel', () => {
  let changePwCount = 0
  let signOutCount = 0
  let cancelCount = 0

  const rendered = mount(<ResetPasswordDialog
    type='encryption'
    onChangePassword={() => {
      changePwCount += 1
      return Promise.resolve()
    }}
    onSignOut={() => {
      signOutCount += 1
    }}
    onCancel={() => {
      cancelCount += 1
    }}
  />)

  const buttons = rendered.find('article button')

  const cancelButton = buttons.at(0)
  expect(cancelButton.text()).toBe('cancel')

  const signOutButton = buttons.at(1)
  expect(signOutButton.text()).toBe('sign out')

  cancelButton.simulate('click')
  expect(changePwCount).toBe(0)
  expect(signOutCount).toBe(0)
  expect(cancelCount).toBe(1)

  signOutButton.simulate('click')
  expect(changePwCount).toBe(0)
  expect(signOutCount).toBe(1)
  expect(cancelCount).toBe(1)
})

test('should pass aXe', async () => {
  const rendered = mount(<ResetPasswordDialog
    type='encryption'
    onChangePassword={() => {}}
    onSignOut={() => {}}
    onCancel={() => {}}
  />)

  expect(await axe(rendered.html())).toHaveNoViolations()
})
