import { memo, Component } from 'react'
import autoscroll from 'autoscroll-react'

import Text from './text'
import Name from './name'

import { LocalChatSourceType } from '../types/chat'

const TextLine = memo(({ msg, isIM }) => {
  const time = new Date(msg.time)

  const isIrcMe = msg.message.startsWith('/me ') || msg.message.startsWith("/me'")
  const message = isIrcMe ? msg.message.substring(4) : msg.message
  const loadMissing = isIM || msg.sourceType === LocalChatSourceType.Agent

  return (
    <div className={isIrcMe ? 'italic text-xl' : 'text-xl'}>
      <time dateTime={time.toISOString()} className='pr-1 font-mono'>
        {leadingZero(time.getHours())}
        :
        {leadingZero(time.getMinutes())}
        :
        {leadingZero(time.getSeconds())}
      </time>

      <Name
        id={msg.fromId}
        loadMissing={loadMissing}
        fallback={msg.fromName}
      />
      {isIrcMe ? ' ' : ': '}

      <span>
        <Text
          text={message}
          className='text-blue-700 underline hover:text-blue-500 visited:text-indigo-600'
        />
      </span>
    </div>
  )
})

class ChatList extends Component {
  render () {
    const { messages, isIM, ...props } = this.props

    return (
      <div
        className='mt-1 overflow-y-scroll focus:ring focus:outline-none'
        role='log'
        tabIndex='0'
        {...props}
      >
        {messages.map(msg => (
          <TextLine key={msg._id} msg={msg} isIM={isIM} />
        ))}
      </div>
    )
  }
}

export default autoscroll(ChatList)

// Adds to all Numbers a leading zero if it has only one digit
function leadingZero (num) {
  return String(num).padStart(2, '0')
}
