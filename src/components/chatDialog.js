/*
 * Displays a single conversation/dialog. Also the input
 */

import React from 'react'
import PropTypes from 'prop-types'

import ChatMessagesList from './chatMessagesList'

import styles from './chatDialog.module.css'

export default class ChatDialog extends React.Component {
  constructor () {
    super()
    this.state = {
      text: ''
    }
    this._boundChange = this._onChange.bind(this)
    this._boundKeyDown = this._onKeyDown.bind(this)
    this._boundClickSend = this._send.bind(this)
    this._boundLoadHistory = this._loadHistory.bind(this)
  }

  componentDidMount () {
    this._loadHistory()
  }

  _loadHistory () {
    const isIM = this.props.isIM
    const data = this.props.data
    if (isIM && !data.didLoadHistory && !data.isLoadingHistory) {
      this.props.loadHistory(data.chatUUID, data.saveId)
    }
  }

  _onChange (event, value) {
    this.setState({
      text: event.target.value
    })
  }

  _onKeyDown (event) {
    if (event.keyCode === 13) {
      this._send(event)
    }
  }

  _send (event) {
    event.preventDefault()
    const text = this.state.text.trim()
    if (text) {
      this.props.sendTo(text)
    }
    this.setState({
      text: ''
    })
  }

  render () {
    const messages = this.props.isIM ? this.props.data.messages : this.props.data

    const placeholderText = `Send ${this.props.isIM ? 'Instant Message' : 'to local chat'}`

    return <div className={styles.Container}>
      <ChatMessagesList
        messages={messages}
        isIM={this.props.isIM}
        names={this.props.names}
        onScrolledTop={this._boundLoadHistory}
      />
      <div className={styles.InputRow}>
        <input
          type='text'
          className={styles.TextBox}
          name='chatInput'
          placeholder={placeholderText}
          aria-label={placeholderText}
          value={this.state.text}
          onChange={this._boundChange}
          onKeyDown={this._boundKeyDown}
        />
        <button className={styles.SendButton} onClick={this._boundClickSend}>
          send
        </button>
      </div>
    </div>
  }
}

ChatDialog.displayName = 'ChatDialog'
// https://facebook.github.io/react/docs/typechecking-with-proptypes.html
ChatDialog.propTypes = {
  data: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object
  ]).isRequired,
  names: PropTypes.object.isRequired,
  sendTo: PropTypes.func.isRequired,
  isIM: PropTypes.bool
}
ChatDialog.defaultProps = {
  isIM: false,
  data: []
}
