/*
 * Displays a single conversation/dialog. Also the input
 */

import React from 'react'
import PropTypes from 'prop-types'
import Immutable from 'immutable'
import styled from 'styled-components'

import ChatMessagesList from './chatMessagesList'

const Main = styled.div`
  margin: 0.3em;
  display: flex;
  flex-direction: column;
`

const ChatTextSend = styled.div`
  margin: .4em;
  display: flex;
  flex-direction: row;
`

const SendButton = styled.button`
  flex: 1 0 auto;
`

const TextBox = styled.input`
  flex: 4 0 auto;
  margin-right: 0.5em;
`

export default class ChatDialog extends React.Component {
  constructor () {
    super()
    this.state = {
      text: ''
    }
    this._boundChange = this._onChange.bind(this)
    this._boundKeyDown = this._onKeyDown.bind(this)
    this._boundClickSend = this._send.bind(this)
  }

  componentDidMount () {
    const isIM = this.props.isIM
    const data = this.props.data
    if (isIM && !data.get('didLoadHistory') && !data.get('isLoadingHistory')) {
      this.props.loadHistory(data.get('chatUUID'), data.get('saveId'))
    }
  }

  render () {
    const messages = this.props.isIM ? this.props.data.get('messages') : this.props.data

    const placeholderText = 'Send ' +
      (this.props.isIM ? 'Instant Message' : 'to local chat')

    return <Main>
      <ChatMessagesList
        messages={messages}
        isIM={this.props.isIM}
        names={this.props.names}
      />
      <ChatTextSend>
        <TextBox
          type='text'
          name='chatInput'
          placeholder={placeholderText}
          value={this.state.text}
          onChange={this._boundChange}
          onKeyDown={this._boundKeyDown}
        />
        <SendButton onClick={this._boundClickSend}>
          send
        </SendButton>
      </ChatTextSend>
    </Main>
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
