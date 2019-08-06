/*
 * Displays a single conversation/dialog. Also the input
 */

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

import ChatMessagesList from './chatMessagesList'
import { Button, Input } from './formElements'

const Main = styled.div`
  margin: 0.3em;
  display: flex;
  flex-direction: column;
`

const ChatTextSend = styled.div`
  margin: .4em;
  display: flex;
  flex-direction: row;
`

const SendButton = styled(Button)`
  flex: 1 0 auto;
`

const TextBox = styled(Input)`
  flex: 4 0 auto;
  margin-right: 0.5em;
`

export default function ChatDialog ({ isIM = false, data = [], names, sendTo, loadHistory }) {
  const [text, setText] = useState('')

  const messages = isIM ? data.messages : data

  const send = event => {
    event.preventDefault()
    const textTrimmed = text.trim()
    if (textTrimmed) {
      sendTo(textTrimmed)
      setText('')
    }
  }

  const doLoadHistory = () => {
    if (isIM && !data.didLoadHistory && !data.isLoadingHistory && loadHistory) {
      loadHistory(data.chatUUID, data.saveId)
    }
  }
  useEffect(doLoadHistory, [isIM, data.chatUUID])

  const placeholderText = `Send ${isIM ? 'Instant Message' : 'to local chat'}`

  return <Main>
    <ChatMessagesList
      messages={messages}
      isIM={isIM}
      names={names}
      onScrolledTop={doLoadHistory}
    />
    <ChatTextSend>
      <TextBox
        type='text'
        name='chatInput'
        placeholder={placeholderText}
        aria-label={placeholderText}
        value={text}
        onChange={event => { setText(event.target.value) }}
        onKeyDown={event => {
          if (event.keyCode === 13) {
            send(event)
          }
        }}
      />
      <SendButton className='primary' onClick={send}>
        send
      </SendButton>
    </ChatTextSend>
  </Main>
}
