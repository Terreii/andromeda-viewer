import React, { useMemo, memo } from 'react'
import anchorme from 'anchorme'
import autoscroll from 'autoscroll-react'

import styles from './chatMessagesList.module.css'

const TextLine = memo(({ msg, name }) => {
  const time = new Date(msg.time)

  const message = msg.message
  const isIrcMe = message.startsWith('/me ') || message.startsWith("/me'")

  const parsed = useMemo(
    () => {
      const urls = anchorme(message, { list: true })

      let text = isIrcMe ? message.substring(4) : message

      if (urls.length === 0) return [text]
      const result = []

      for (const url of urls) {
        const urlStartIndex = text.indexOf(url.raw)
        const urlEndIndex = urlStartIndex + url.raw.length

        const hasLinkBody = text.charAt(Math.max(0, urlStartIndex - 1)) === '[' &&
          /\s/.test(text.charAt(urlEndIndex))

        let index = urlStartIndex
        let endIndex = urlEndIndex
        let linkBody = url.raw

        if (hasLinkBody) {
          const closingIndex = text.indexOf(']', urlEndIndex + 1)
          const body = text.substring(urlEndIndex + 1, closingIndex)

          if (closingIndex >= 0 && body.length > 0) {
            index = Math.max(0, urlStartIndex - 1)
            endIndex = closingIndex + 1
            linkBody = body
          }
        }

        // split out text only part
        if (index > 0) {
          result.push(text.substring(0, index))
        }

        result.push({
          text: linkBody,
          url: url.raw
        })

        text = text.substring(endIndex)
      }

      if (text.length > 0) {
        result.push(text)
      }

      return result
    },
    [isIrcMe, message]
  )

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
      {parsed.map((part, index) => {
        if (typeof part === 'string') {
          return part
        } else {
          return <a key={index} href={part.url} target='_blank' rel='noopener noreferrer'>
            {part.text}
          </a>
        }
      })}
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
