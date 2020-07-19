import React, { memo } from 'react'
import autoscroll from 'autoscroll-react'

import Text from './text'

const TextLine = memo(({ msg, name }) => {
  const time = new Date(msg.time)

  const isIrcMe = msg.message.startsWith('/me ') || msg.message.startsWith("/me'")
  const message = isIrcMe ? msg.message.substring(4) : msg.message

  return (
    <div className={isIrcMe ? 'italic text-xl' : 'text-xl'}>
      <time dateTime={time.toISOString()} className='pr-1 font-mono'>
        {leadingZero(time.getHours())}
        :
        {leadingZero(time.getMinutes())}
        :
        {leadingZero(time.getSeconds())}
      </time>

      <span aria-hidden>{name.toString()}{isIrcMe ? '' : ':'} </span>
      <span className='sr-only'>{typeof name === 'string' ? name : name.getName()}</span>

      <span>
        <Text
          text={message}
          className='text-blue-700 underline hover:text-blue-500 visited:text-indigo-600'
        />
      </span>
    </div>
  )
})

class ChatList extends React.Component {
  render () {
    const { messages, isIM, names, ...props } = this.props

    const messagesLines = messages.map(msg => {
      const name = names[msg.fromId] || msg.fromName || ''

      return <TextLine key={msg._id} msg={msg} name={name} />
    })

    return (
      <div
        className='mt-1 overflow-y-scroll focus:shadow-outline focus:outline-none'
        role='log'
        tabIndex='0'
        {...props}
      >
        {messagesLines}
      </div>
    )
  }
}

export default autoscroll(ChatList)

// Adds to all Numbers a leading zero if it has only one digit
function leadingZero (num) {
  return String(num).padStart(2, '0')
}
