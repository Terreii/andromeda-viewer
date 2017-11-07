'use strict'

/*
 * Displays a single conversation/dialog. Also the input
 */

import React from 'react'
import PropTypes from 'prop-types'
import Immutable from 'immutable'

import style from './chatDialog.css'

// Adds to all Numbers a leading zero if it has only one digit
function leadingZero (num) {
  return String(num).padStart(2, '0')
}

export default class ChatDialog extends React.Component {
  constructor () {
    super()
    this.state = {
      text: ''
    }
  }

  componentDidMount () {
    const isIM = this.props.isIM
    const data = this.props.data
    if (isIM && !data.get('didLoadHistory') && !data.get('isLoadingHistory')) {
      this.props.loadHistory(data.get('chatUUID'))
    }
  }

  render () {
    const msgData = this.props.isIM ? this.props.data.get('messages') : this.props.data
    const messages = msgData.map(msg => {
      const time = new Date(msg.get('time'))
      const fromId = this.props.isIM ? msg.get('fromId') : msg.get('sourceID')
      const name = this.props.names.get(fromId) || ''
      return (
        <div className={style.message} key={`message_${fromId}_${time}`}>
          <span className='time'>
            {leadingZero(time.getHours())}
            :
            {leadingZero(time.getMinutes())}
            :
            {leadingZero(time.getSeconds())}
          </span>
          <span className={style.avatar}>{name.toString()}</span>
          <span className='messageText'>{msg.get('message')}</span>
        </div>
      )
    })

    const placeholderText = 'Send ' +
      (this.props.isIM ? 'Instant Message' : 'to local chat')

    return (
      <div className={style.ChatDialog}>
        <div className={style.messageOutput}>
          {messages}
        </div>
        <div className={style.ChatTextSend}>
          <input
            type='text'
            className={style.textBox}
            name='chatInput'
            placeholder={placeholderText}
            value={this.state.text}
            onChange={this._onChange.bind(this)}
            onKeyDown={this._onKeyDown.bind(this)} />
          <input
            type='button'
            className={style.send}
            value='Send'
            onClick={this._onClick.bind(this)} />
        </div>
      </div>
    )
  }

  _onChange (event, value) {
    this.setState({
      text: event.target.value
    })
  }

  _onKeyDown (event) {
    if (event.keyCode === 13) {
      event.preventDefault()
      const text = this.state.text.trim()
      if (text) {
        this.props.sendTo(text)
      }
      this.setState({
        text: ''
      })
    }
  }

  _onClick (event) {
    event.preventDefault()
    const text = this.state.text.trim()
    if (text) {
      this.props.sendTo(text)
    }
    this.setState({
      text: ''
    })
  }
}
ChatDialog.displayName = 'ChatDialog'
// https://facebook.github.io/react/docs/typechecking-with-proptypes.html
ChatDialog.propTypes = {
  data: PropTypes.oneOfType([
    PropTypes.instanceOf(Immutable.List),
    PropTypes.instanceOf(Immutable.Map)
  ]).isRequired,
  names: PropTypes.instanceOf(Immutable.Map).isRequired,
  sendTo: PropTypes.func.isRequired,
  isIM: PropTypes.bool
}
ChatDialog.defaultProps = {
  isIM: false,
  data: []
}
