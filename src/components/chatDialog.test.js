import React from 'react'
import {shallow, mount} from 'enzyme'
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

  const renderedLocal = mount(<ChatDialog
    names={names}
    data={chatData}
    sendTo={() => {}}
  />)

  expect(renderedLocal.find('button').text()).toBe('send')
  expect(renderedLocal.find('input').prop('placeholder')).toBe('Send to local chat')
})

test('renders IM chat', () => {
  const names = Immutable.fromJS({
    names: {
      first: new AvatarName('Testery MacTestface')
    }
  })

  const imData = Immutable.fromJS({
    chatUUID: 'abc',
    messages: []
  })

  const loadHistoryData = {
    id: null,
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
    loadHistory={id => {
      loadHistoryData.id = id
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
  expect(loadHistoryData.count).toBe(1)
})
