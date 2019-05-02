import { axe } from 'jest-axe'
import React from 'react'
import { mount } from 'enzyme'

import ChatMessagesList from './chatMessagesList'
import AvatarName from '../avatarName'

test('renders local chat without crashing', () => {
  const messages = [
    {
      _id: 'first',
      sourceID: 'ABCB',
      message: 'Hello world!',
      time: '2018-08-10T11:03:00.000Z'
    },
    {
      _id: 'second',
      sourceID: '1234',
      message: 'How are you?',
      time: '2018-08-10T11:03:32.734Z'
    }
  ]

  const names = {
    'ABCB': new AvatarName('Testery MacTestface'),
    '1234': new AvatarName('Viewerer Account')
  }

  const rendered = mount(<ChatMessagesList
    messages={messages}
    names={names}
  />)

  expect(rendered.find('div').length).toBe(3)

  const timeElements = rendered.find('span.time')
  expect(timeElements.length).toBe(2)
  timeElements.forEach(element => {
    const text = element.text()
    expect(text).toMatch(new RegExp('\\d\\d:\\d\\d:\\d\\d'))
  })

  const messageTexts = rendered.find('span.messageText')
  expect(messageTexts.length).toBe(2)
  messageTexts.forEach((element, index) => {
    const text = element.text()
    expect(text).toBe(index === 0 ? 'Hello world!' : 'How are you?')
  })
})

test('renders IM chat without crashing', () => {
  const messages = [
    {
      _id: 'first',
      fromId: 'ABCB',
      message: 'Hello world!',
      time: '2018-08-10T11:03:00.000Z'
    },
    {
      _id: 'second',
      fromId: '1234',
      message: 'How are you?',
      time: '2018-08-10T11:03:32.734Z'
    }
  ]

  const names = {
    'ABCB': new AvatarName('Testery MacTestface'),
    '1234': new AvatarName('Viewerer Account')
  }

  const rendered = mount(<ChatMessagesList
    messages={messages}
    isIM
    names={names}
  />)

  expect(rendered.find('div').length).toBe(3)

  const timeElements = rendered.find('span.time')
  expect(timeElements.length).toBe(2)
  timeElements.forEach(element => {
    const text = element.text()
    expect(text).toMatch(new RegExp('\\d\\d:\\d\\d:\\d\\d'))
  })

  const messageTexts = rendered.find('span.messageText')
  expect(messageTexts.length).toBe(2)
  messageTexts.forEach((element, index) => {
    const text = element.text()
    expect(text).toBe(index === 0 ? 'Hello world!' : 'How are you?')
  })
})

test('Local chat should pass aXe', async () => {
  const messages = [
    {
      _id: 'first',
      sourceID: 'ABCB',
      message: 'Hello world!',
      time: '2018-08-10T11:03:00.000Z'
    },
    {
      _id: 'second',
      sourceID: '1234',
      message: 'How are you?',
      time: '2018-08-10T11:03:32.734Z'
    }
  ]

  const names = {
    'ABCB': new AvatarName('Testery MacTestface'),
    '1234': new AvatarName('Viewerer Account')
  }

  const rendered = mount(<ChatMessagesList
    messages={messages}
    names={names}
  />)

  expect(await axe(rendered.html())).toHaveNoViolations()
})

test('IM chat should pass aXe', async () => {
  const messages = [
    {
      _id: 'first',
      fromId: 'ABCB',
      message: 'Hello world!',
      time: '2018-08-10T11:03:00.000Z'
    },
    {
      _id: 'second',
      fromId: '1234',
      message: 'How are you?',
      time: '2018-08-10T11:03:32.734Z'
    }
  ]

  const names = {
    'ABCB': new AvatarName('Testery MacTestface'),
    '1234': new AvatarName('Viewerer Account')
  }

  const rendered = mount(<ChatMessagesList
    messages={messages}
    isIM
    names={names}
  />)

  expect(await axe(rendered.html())).toHaveNoViolations()
})
