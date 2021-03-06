/*
 * Displays a single conversation/dialog. Also the input
 */

import { useState, useEffect, useMemo } from 'react'

import ChatMessagesList from './chatMessagesList'

import { selectChatMessages } from '../bundles/imChat'
import { selectLocalChat } from '../bundles/localChat'
import { useSelector } from '../hooks/store'

/**
 * Display a chat.
 * @param {object} param React param.
 * @param {boolean} param.isIM   Is this chat a IM chat? This can be personal, group or conference.
 * @param {import('../types/chat').IMChat?} param.data  IM chat data.
 * @param {function} param.sendTo Callback to send a message.
 * @param {function} param.loadHistory Action to load the chat history.
 */
export default function ChatDialog ({ isIM = false, data = {}, sendTo, loadHistory }) {
  const [text, setText] = useState('')

  const chatId = isIM ? data.sessionId : ''
  const messages = useSelector(useMemo(
    () => isIM
      ? state => selectChatMessages(state, chatId)
      : selectLocalChat,
    [isIM, chatId]
  ))

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
  useEffect(doLoadHistory, [
    loadHistory,
    isIM,
    data.sessionId,
    data.saveId,
    data.didLoadHistory,
    data.isLoadingHistory
  ])

  const placeholderText = `Send ${isIM ? 'Instant Message' : 'to local chat'}`

  return (
    <>
      <ChatMessagesList
        messages={messages}
        isIM={isIM}
        onScrolledTop={doLoadHistory}
      />
      <form className='flex flex-row flex-shrink-0 m-2 space-x-2' onSubmit={send}>
        <input
          type='text'
          className='flex-grow flex-shrink-0 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
          name='chatInput'
          placeholder={placeholderText}
          aria-label={placeholderText}
          value={text}
          onChange={event => { setText(event.target.value) }}
        />
        <button className='flex-initial w-16 btn btn--primary'>send</button>
      </form>
    </>
  )
}
