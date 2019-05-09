import React from 'react'
import autoscroll from 'autoscroll-react'

import styles from './chatMessagesList.module.css'

// Adds to all Numbers a leading zero if it has only one digit
function leadingZero (num) {
  return String(num).padStart(2, '0')
}

class ChatList extends React.Component {
  render () {
    const { messages, isIM, names, ...props } = this.props

    const messagesLines = messages.map(msg => {
      const time = new Date(msg.time)
      const fromId = isIM ? msg.fromId : msg.sourceID
      const name = names[fromId] || msg[isIM ? 'fromAgentName' : 'fromName'] || ''

      return <div key={msg._id} className={styles.Message}>
        <span className='time'>
          {leadingZero(time.getHours())}
          :
          {leadingZero(time.getMinutes())}
          :
          {leadingZero(time.getSeconds())}
        </span>
        <span className={styles.AvatarName}>{name.toString()}</span>
        <span className='messageText'>{msg.message}</span>
      </div>
    })

    return <div className={styles.List} {...props}>
      {messagesLines}
    </div>
  }
}

export default autoscroll(ChatList)
