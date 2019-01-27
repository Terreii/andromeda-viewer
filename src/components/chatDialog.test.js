import { axe } from 'jest-axe'
import React from 'react'
import { shallow, mount } from 'enzyme'
import Immutable from 'immutable'

import ChatDialog from './chatDialog'
import AvatarName from '../avatarName'

test('renders without crashing', () => {
  const names = Immutable.fromJS({
    names: {
      first: new AvatarName('Testery MacTestface')
    }
  })

  const chatData = Immutable.fromJS([])

  shallow(<ChatDialog
    names={names}
    data={chatData}
    isIM={false}
    sendTo={() => {}}
  />)
})

test('renders local chat', () => {
  const names = Immutable.fromJS({
    names: {
      first: new AvatarName('Testery MacTestface')
    }
  })

  const chatData = Immutable.fromJS([])

  const sendData = {
    text: null,
    count: 0
  }

  const renderedLocal = mount(<ChatDialog
    names={names}
    data={chatData}
    sendTo={text => {
      sendData.text = text
      sendData.count += 1
    }}
  />)

  expect(renderedLocal.find('input').prop('placeholder')).toBe('Send to local chat')

  const sendButton = renderedLocal.find('button')
  expect(sendButton.text()).toBe('send')

  renderedLocal.find('input').simulate('change', {
    target: {
      value: 'Hello World!'
    }
  })
  sendButton.simulate('click')

  expect(sendData.text).toBe('Hello World!')
  expect(sendData.count).toBe(1)
})

test('renders IM chat', () => {
  const names = Immutable.fromJS({
    names: {
      first: new AvatarName('Testery MacTestface')
    }
  })

  const imData = Immutable.fromJS({
    chatUUID: 'abc',
    saveId: 'def',
    messages: []
  })

  const loadHistoryData = {
    id: null,
    saveId: null,
    count: 0
  }

  const sendData = {
    text: null,
    count: 0
  }

  const renderedIM = mount(<ChatDialog
    names={names}
    data={imData}
    isIM
    sendTo={text => {
      sendData.text = text
      sendData.count += 1
    }}
    loadHistory={(id, saveId) => {
      loadHistoryData.id = id
      loadHistoryData.saveId = saveId
      loadHistoryData.count += 1
    }}
  />)

  expect(renderedIM.find('input').prop('placeholder')).toBe('Send Instant Message')

  const sendButton = renderedIM.find('button')
  expect(sendButton.text()).toBe('send')
  renderedIM.find('input').simulate('change', {
    target: {
      value: 'Hello World!'
    }
  })
  sendButton.simulate('click')

  expect(sendData.text).toBe('Hello World!')
  expect(sendData.count).toBe(1)

  expect(loadHistoryData.id).toBe('abc')
  expect(loadHistoryData.saveId).toBe('def')
  expect(loadHistoryData.count).toBe(1)
})

test('Local chat should pass aXe', async () => {
  const names = Immutable.fromJS({
    names: {
      first: new AvatarName('Testery MacTestface')
    }
  })

  const chatData = Immutable.fromJS([])

  const sendData = {
    text: null,
    count: 0
  }

  const rendered = mount(<ChatDialog
    names={names}
    data={chatData}
    sendTo={text => {
      sendData.text = text
      sendData.count += 1
    }}
  />)

  expect(await axe(rendered.html())).toHaveNoViolations()
})

test('IM chat should pass aXe', async () => {
  const names = Immutable.fromJS({
    names: {
      first: new AvatarName('Testery MacTestface')
    }
  })

  const imData = Immutable.fromJS({
    chatUUID: 'abc',
    saveId: 'def',
    messages: []
  })

  const loadHistoryData = {
    id: null,
    saveId: null,
    count: 0
  }

  const sendData = {
    text: null,
    count: 0
  }

  const rendered = mount(<ChatDialog
    names={names}
    data={imData}
    isIM
    sendTo={text => {
      sendData.text = text
      sendData.count += 1
    }}
    loadHistory={(id, saveId) => {
      loadHistoryData.id = id
      loadHistoryData.saveId = saveId
      loadHistoryData.count += 1
    }}
  />)

  expect(await axe(rendered.html())).toHaveNoViolations()
})
