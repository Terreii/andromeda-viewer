import { axe } from 'jest-axe'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import ChatDialog from './chatDialog'
import AvatarName from '../avatarName'

it('renders without crashing', () => {
  const names = {
    first: new AvatarName('Testery MacTestface')
  }

  const { container } = render(
    <ChatDialog
      names={names}
      data={[]}
      isIM={false}
      sendTo={() => {}}
    />
  )

  expect(container).toBeTruthy()
})

describe('local chat', () => {
  it('renders', async () => {
    const names = {
      first: new AvatarName('Testery MacTestface')
    }

    const send = jest.fn()

    const { queryByText, queryByPlaceholderText, findByText } = render(
      <ChatDialog
        names={names}
        data={[]}
        sendTo={send}
      />
    )

    const input = queryByPlaceholderText('Send to local chat')
    expect(input).toBeTruthy()
    expect(input.nodeName).toBe('INPUT')
    expect(input.type).toBe('text')

    const sendButton = queryByText('send')
    expect(sendButton).toBeTruthy()
    expect(sendButton.nodeName).toBe('BUTTON')

    fireEvent.change(input, {
      target: {
        value: 'Hello World!'
      }
    })
    fireEvent.submit(await findByText('send'))

    expect(send.mock.calls).toEqual([
      ['Hello World!']
    ])
  })

  it('should pass aXe', async () => {
    const names = {
      first: new AvatarName('Testery MacTestface')
    }

    const { container } = render(
      <ChatDialog
        names={names}
        data={[]}
        isIM={false}
        sendTo={() => {}}
      />
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('IM chat', () => {
  it('renders', async () => {
    const names = {
      first: new AvatarName('Testery MacTestface')
    }

    const imData = {
      sessionId: 'abc',
      saveId: 'def',
      messages: []
    }

    const send = jest.fn()
    const loadHistory = jest.fn()

    const { queryByText, queryByPlaceholderText, findByText } = render(
      <ChatDialog
        isIM
        names={names}
        data={imData}
        sendTo={send}
        loadHistory={loadHistory}
      />
    )

    const input = queryByPlaceholderText('Send Instant Message')
    expect(input).toBeTruthy()
    expect(input.nodeName).toBe('INPUT')
    expect(input.type).toBe('text')

    const sendButton = queryByText('send')
    expect(sendButton).toBeTruthy()
    expect(sendButton.nodeName).toBe('BUTTON')

    fireEvent.change(input, {
      target: {
        value: 'Hello World!'
      }
    })
    fireEvent.submit(await findByText('send'))

    expect(send.mock.calls).toEqual([
      ['Hello World!']
    ])

    expect(loadHistory.mock.calls).toEqual([
      [imData.sessionId, imData.saveId]
    ])
  })

  it('should pass aXe', async () => {
    const names = {
      first: new AvatarName('Testery MacTestface')
    }

    const imData = {
      sessionId: 'abc',
      saveId: 'def',
      messages: []
    }

    const { container } = render(
      <ChatDialog
        isIM
        names={names}
        data={imData}
        sendTo={() => {}}
        loadHistory={() => {}}
      />
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
