import { axe } from 'jest-axe'
import React from 'react'
import { render } from '@testing-library/react'

import ChatMessagesList from './chatMessagesList'
import AvatarName from '../avatarName'

function getTimeString (timeSting) {
  const date = new Date(timeSting)
  const h = date.getHours().toString().padStart(2, '0')
  const m = date.getMinutes().toString().padStart(2, '0')
  const s = date.getSeconds().toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

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

    const { queryByText } = render(
      <ChatMessagesList
        messages={messages}
        names={names}
      />
    )

    expect(queryByText(getTimeString('2018-08-10T11:03:00.000Z'))).toBeTruthy()
    expect(queryByText(getTimeString('2018-08-10T11:03:00.000Z')).tagName).toBe('TIME')
    expect(queryByText('Testery Mactestface:')).toBeTruthy()
    expect(queryByText('Hello world!')).toBeTruthy()

    expect(queryByText(getTimeString('2018-08-10T11:03:32.734Z'))).toBeTruthy()
    expect(queryByText(getTimeString('2018-08-10T11:03:32.734Z')).tagName).toBe('TIME')
    expect(queryByText('Viewerer Account:')).toBeTruthy()
    expect(queryByText('How are you?')).toBeTruthy()
  })

  it('renders plain urls and urls with second life formation', () => {
    const messages = [
      {
        _id: 'first',
        fromId: 'ABCB',
        message: "An article https://en.wikipedia.org/wiki/Second_Life. Isn't it nice?",
        time: '2018-08-10T11:03:00.000Z'
      },
      {
        _id: 'second',
        fromId: '1234',
        message: 'Please visit [http://wiki.secondlife.com/wiki/Main_Page the second life wiki]!',
        time: '2018-08-10T11:03:32.734Z'
      }
    ]

    const names = {
      ABCB: new AvatarName('Testery MacTestface'),
      1234: new AvatarName('Viewerer Account')
    }

    const { queryByText } = render(
      <ChatMessagesList
        messages={messages}
        names={names}
      />
    )

    // first message
    expect(queryByText(getTimeString('2018-08-10T11:03:00.000Z'))).toBeTruthy()
    expect(queryByText(getTimeString('2018-08-10T11:03:00.000Z')).tagName).toBe('TIME')
    expect(queryByText('Testery Mactestface:')).toBeTruthy()

    expect(queryByText('https://en.wikipedia.org/wiki/Second_Life')).toBeTruthy()
    expect(queryByText('https://en.wikipedia.org/wiki/Second_Life').tagName).toBe('A')
    expect(queryByText('https://en.wikipedia.org/wiki/Second_Life').href)
      .toBe('https://en.wikipedia.org/wiki/Second_Life')
    expect(queryByText('https://en.wikipedia.org/wiki/Second_Life').rel)
      .toBe('noopener noreferrer')

    // second message
    expect(queryByText(getTimeString('2018-08-10T11:03:32.734Z'))).toBeTruthy()
    expect(queryByText(getTimeString('2018-08-10T11:03:32.734Z')).tagName).toBe('TIME')
    expect(queryByText('Viewerer Account:')).toBeTruthy()

    expect(queryByText('the second life wiki')).toBeTruthy()
    expect(queryByText('the second life wiki').tagName).toBe('A')
    expect(queryByText('the second life wiki').href)
      .toBe('http://wiki.secondlife.com/wiki/Main_Page')
    expect(queryByText('the second life wiki').rel)
      .toBe('noopener noreferrer')
  })

  it('should render messages starting with /me without a colon', () => {
    const messages = [
      {
        _id: 'first',
        fromId: 'ABCB',
        message: '/me wonders about the world!',
        time: '2018-08-10T11:03:00.000Z'
      }
    ]

    const names = {
      ABCB: new AvatarName('Testery MacTestface')
    }

    const { queryByText } = render(
      <ChatMessagesList
        messages={messages}
        names={names}
      />
    )

    expect(queryByText(getTimeString('2018-08-10T11:03:00.000Z'))).toBeTruthy()
    expect(queryByText(getTimeString('2018-08-10T11:03:00.000Z')).tagName).toBe('TIME')
    expect(queryByText('Testery Mactestface')).toBeTruthy()
    expect(queryByText('wonders about the world!')).toBeTruthy()
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

    const { container } = render(
      <ChatMessagesList
        messages={messages}
        names={names}
      />
    )

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

    const { queryByText } = render(
      <ChatMessagesList
        messages={messages}
        isIM
        names={names}
      />
    )

    expect(queryByText(getTimeString('2018-08-10T11:03:00.000Z'))).toBeTruthy()
    expect(queryByText(getTimeString('2018-08-10T11:03:00.000Z')).tagName).toBe('TIME')
    expect(queryByText('Testery Mactestface:')).toBeTruthy()
    expect(queryByText('Hello world!')).toBeTruthy()

    expect(queryByText(getTimeString('2018-08-10T11:03:32.734Z'))).toBeTruthy()
    expect(queryByText(getTimeString('2018-08-10T11:03:32.734Z')).tagName).toBe('TIME')
    expect(queryByText('Viewerer Account:')).toBeTruthy()
    expect(queryByText('How are you?')).toBeTruthy()
  })

  it('renders plain urls and urls with second life formation', () => {
    const messages = [
      {
        _id: 'first',
        fromId: 'ABCB',
        message: "An article https://en.wikipedia.org/wiki/Second_Life. Isn't it nice?",
        time: '2018-08-10T11:03:00.000Z'
      },
      {
        _id: 'second',
        fromId: '1234',
        message: 'Please visit [http://wiki.secondlife.com/wiki/Main_Page the second life wiki]!',
        time: '2018-08-10T11:03:32.734Z'
      }
    ]

    const names = {
      ABCB: new AvatarName('Testery MacTestface'),
      1234: new AvatarName('Viewerer Account')
    }

    const { queryByText } = render(
      <ChatMessagesList
        messages={messages}
        isIM
        names={names}
      />
    )

    // first message
    expect(queryByText(getTimeString('2018-08-10T11:03:00.000Z'))).toBeTruthy()
    expect(queryByText(getTimeString('2018-08-10T11:03:00.000Z')).tagName).toBe('TIME')
    expect(queryByText('Testery Mactestface:')).toBeTruthy()

    expect(queryByText('https://en.wikipedia.org/wiki/Second_Life')).toBeTruthy()
    expect(queryByText('https://en.wikipedia.org/wiki/Second_Life').tagName).toBe('A')
    expect(queryByText('https://en.wikipedia.org/wiki/Second_Life').href)
      .toBe('https://en.wikipedia.org/wiki/Second_Life')
    expect(queryByText('https://en.wikipedia.org/wiki/Second_Life').rel)
      .toBe('noopener noreferrer')

    // second message
    expect(queryByText(getTimeString('2018-08-10T11:03:32.734Z'))).toBeTruthy()
    expect(queryByText(getTimeString('2018-08-10T11:03:32.734Z')).tagName).toBe('TIME')
    expect(queryByText('Viewerer Account:')).toBeTruthy()

    expect(queryByText('the second life wiki')).toBeTruthy()
    expect(queryByText('the second life wiki').tagName).toBe('A')
    expect(queryByText('the second life wiki').href)
      .toBe('http://wiki.secondlife.com/wiki/Main_Page')
    expect(queryByText('the second life wiki').rel)
      .toBe('noopener noreferrer')
  })

  it('should render messages starting with /me without a colon', () => {
    const messages = [
      {
        _id: 'first',
        fromId: 'ABCB',
        message: '/me wonders about the world!',
        time: '2018-08-10T11:03:00.000Z'
      }
    ]

    const names = {
      ABCB: new AvatarName('Testery MacTestface')
    }

    const { queryByText } = render(
      <ChatMessagesList
        messages={messages}
        isIM
        names={names}
      />
    )

    expect(queryByText(getTimeString('2018-08-10T11:03:00.000Z'))).toBeTruthy()
    expect(queryByText(getTimeString('2018-08-10T11:03:00.000Z')).tagName).toBe('TIME')
    expect(queryByText('Testery Mactestface')).toBeTruthy()
    expect(queryByText('wonders about the world!')).toBeTruthy()
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

    const { container } = render(
      <ChatMessagesList
        messages={messages}
        isIM
        names={names}
      />
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
