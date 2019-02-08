import React from 'react'
import styled from 'styled-components'
import autoscroll from 'autoscroll-react'

const MessageList = styled.div`
  flex: 1 1 100%;
  overflow-y: scroll;
  max-height: calc(100vh - 8.7em);
`

const Message = styled.div`
  & > span {
    padding-right: 0.3em;
    font-size: 120%;
  }
`

const AvatarName = styled.span`
  :after {
    content: ":";
  }
`

// Adds to all Numbers a leading zero if it has only one digit
function leadingZero (num) {
  return String(num).padStart(2, '0')
}

class ChatList extends React.Component {
  render () {
    const { messages, isIM, names, ...props } = this.props

    const messagesLines = messages.map(msg => {
      const time = new Date(msg.get('time'))
      const fromId = isIM ? msg.get('fromId') : msg.get('sourceID')
      const name = names.get(fromId) || ''
      return (
        <Message key={msg.get('_id')}>
          <span className='time'>
            {leadingZero(time.getHours())}
            :
            {leadingZero(time.getMinutes())}
            :
            {leadingZero(time.getSeconds())}
          </span>
          <AvatarName>{name.toString()}</AvatarName>
          <span className='messageText'>{msg.get('message')}</span>
        </Message>
      )
    })

    return <MessageList {...props}>
      {messagesLines}
    </MessageList>
  }
}

export default autoscroll(ChatList)
