import { axe } from 'jest-axe'
import React from 'react'
import { render } from '@testing-library/react'

import ChatMessagesList from './chatMessagesList'
import AvatarName from '../avatarName'

describe('local chat', () => {
  it('renders without crashing', () => {
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
      ABCB: new AvatarName('Testery MacTestface'),
      1234: new AvatarName('Viewerer Account')
    }

    const { queryByText } = render(<ChatMessagesList
      messages={messages}
      names={names}
    />)

    expect(queryByText('13:03:00')).toBeTruthy()
    expect(queryByText('13:03:00').tagName).toBe('TIME')
    expect(queryByText('Testery Mactestface:')).toBeTruthy()
    expect(queryByText('Hello world!')).toBeTruthy()

    expect(queryByText('13:03:32')).toBeTruthy()
    expect(queryByText('13:03:32').tagName).toBe('TIME')
    expect(queryByText('Viewerer Account:')).toBeTruthy()
    expect(queryByText('How are you?')).toBeTruthy()
  })

  it('should pass aXe', async () => {
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
      ABCB: new AvatarName('Testery MacTestface'),
      1234: new AvatarName('Viewerer Account')
    }

    const { container } = render(<ChatMessagesList
      messages={messages}
      names={names}
    />)

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('IMs', () => {
  it('renders without crashing', () => {
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
      ABCB: new AvatarName('Testery MacTestface'),
      1234: new AvatarName('Viewerer Account')
    }

    const { queryByText } = render(<ChatMessagesList
      messages={messages}
      isIM
      names={names}
    />)

    expect(queryByText('13:03:00')).toBeTruthy()
    expect(queryByText('13:03:00').tagName).toBe('TIME')
    expect(queryByText('Testery Mactestface:')).toBeTruthy()
    expect(queryByText('Hello world!')).toBeTruthy()

    expect(queryByText('13:03:32')).toBeTruthy()
    expect(queryByText('13:03:32').tagName).toBe('TIME')
    expect(queryByText('Viewerer Account:')).toBeTruthy()
    expect(queryByText('How are you?')).toBeTruthy()
  })

  it('should pass aXe', async () => {
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
      ABCB: new AvatarName('Testery MacTestface'),
      1234: new AvatarName('Viewerer Account')
    }

    const { container } = render(<ChatMessagesList
      messages={messages}
      isIM
      names={names}
    />)

    expect(await axe(container)).toHaveNoViolations()
  })
})
