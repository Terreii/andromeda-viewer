import React, { memo } from 'react'
import autoscroll from 'autoscroll-react'

import styles from './chatMessagesList.module.css'

import Text from './text'

const TextLine = memo(({ msg, name }) => {
  const time = new Date(msg.time)

  const isIrcMe = msg.message.startsWith('/me ') || msg.message.startsWith("/me'")
  const message = isIrcMe ? msg.message.substring(4) : msg.message

  return <div className={isIrcMe ? styles.icr_me : styles.Message}>
    <time dateTime={time.toISOString()}>
      {leadingZero(time.getHours())}
      :
      {leadingZero(time.getMinutes())}
      :
      {leadingZero(time.getSeconds())}
    </time>

    <span className={styles.AvatarName}>{name.toString()}{isIrcMe ? '' : ':'} </span>

    <span className='messageText'>
      <Text text={message} />
    </span>
  </div>
})

class ChatList extends React.Component {
  render () {
    const { messages, isIM, names, ...props } = this.props

    const messagesLines = messages.map(msg => {
      const name = names[msg.fromId] || msg.fromName || ''

      return <TextLine key={msg._id} msg={msg} name={name} />
    })

    return <div className={styles.List} {...props}>
      {messagesLines}
    </div>
  }
}

export default autoscroll(ChatList)

// Adds to all Numbers a leading zero if it has only one digit
function leadingZero (num) {
  return String(num).padStart(2, '0')
}
