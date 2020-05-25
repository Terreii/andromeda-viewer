/*
 * Displays a single conversation/dialog. Also the input
 */

import React, { useState, useEffect } from 'react'

import ChatMessagesList from './chatMessagesList'

import styles from './chatDialog.module.css'

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
      loadHistory(data.sessionId, data.saveId)
    }
  }
  useEffect(doLoadHistory, [isIM, data.sessionId])

  const placeholderText = `Send ${isIM ? 'Instant Message' : 'to local chat'}`

  return (
    <>
      <ChatMessagesList
        messages={messages}
        isIM={isIM}
        names={names}
        onScrolledTop={doLoadHistory}
      />
      <form className={styles.InputRow} onSubmit={send}>
        <input
          type='text'
          className={styles.TextBox}
          name='chatInput'
          placeholder={placeholderText}
          aria-label={placeholderText}
          value={text}
          onChange={event => { setText(event.target.value) }}
        />
        <button className='flex-initial btn btn-primary'>send</button>
      </form>
    </>
  )
}
