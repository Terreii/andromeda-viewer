import React from 'react'
import { shallow, mount } from 'enzyme'

import SignInPopup from './signInPopup'

test('renders without crashing', () => {
  shallow(
    <SignInPopup onCancel={() => {}} isSignUp onSend={() => {}} />
  )

  shallow(
    <SignInPopup onCancel={() => {}} onSend={() => {}} />
  )
})

test('renders different with isSignUp', () => {
  const signUp = shallow(<SignInPopup onCancel={() => {}} isSignUp onSend={() => {}} />)

  const signIn = shallow(<SignInPopup onCancel={() => {}} onSend={() => {}} />)

  expect(signUp.find('Popup').prop('title')).toBe('sign up')
  expect(signUp.find('input').length).toBe(3)

  expect(signIn.find('Popup').prop('title')).toBe('sign in')
  expect(signIn.find('input[autoComplete="new-password"]').first().prop('style')).toEqual({
    display: 'none'
  })

  ;[signUp, signIn].forEach((popup, index) => {
    const buttons = popup.find('button')

    expect(buttons.length).toBe(2)
    expect(buttons.first().text()).toBe('cancel')
    expect(buttons.last().text()).toBe(index === 0 ? 'sign up' : 'sign in')
  })
})

test('click actions', () => {
  let cancelCallCount = 0
  let sendCallCount = 0
  let shouldCallSend = false

  const onSend = (username, password, type, ...rest) => {
    expect(shouldCallSend).toBe(true)
    expect(username).toBe('testery.mactestface@example.com')
    expect(password).toBe('secret')
    expect(rest.length).toBe(0)

    sendCallCount += 1
  }

  const onCancel = event => {
    cancelCallCount += 1
  }

  const signUp = mount(<SignInPopup
    onCancel={onCancel}
    isSignUp
    onSend={onSend}
  />)

  const signIn = mount(<SignInPopup
    onCancel={onCancel}
    onSend={onSend}
  />)

  ;[signUp, signIn].forEach((popup, index) => {
    const isSignUp = index === 0

    popup.find('button').first().simulate('click')
    popup.find('a[href="#close_popup"]').simulate('click', {
      preventDefault: () => {}
    })

    popup.find('button').last().simulate('click')

    popup.find('input[type="email"]').simulate('change', {
      target: {
        value: 'testery.mactestface@example.com',
        validity: {
          valid: true
        },
        dataset: {
          key: 'username'
        }
      }
    })

    popup.find('button').last().simulate('click')

    const passwordInputs = popup.find('input[type="password"]')
    const addPassword = (aInput, key) => {
      aInput.simulate('change', {
        target: {
          value: 'secret',
          dataset: {
            key
          }
        }
      })
    }
    addPassword(passwordInputs.first(), 'password')
    if (isSignUp) {
      popup.find('button').last().simulate('click')
      addPassword(passwordInputs.last(), 'password2')
    }

    shouldCallSend = true
    popup.find('button').last().simulate('click')
  })

  expect(cancelCallCount).toBe(4)
  expect(sendCallCount).toBe(2)
})
