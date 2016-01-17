'use strict'

/*
 * Displays a single conversation/dialog. Also the input
 */

var React = require('react')
var Immutable = require('immutable')

var nameStore = require('../stores/nameStore.js')
var style = require('../../style/chatDialog.css')

// Adds to all Numbers a leading zero if it has only one digit
function leadingZero (num) {
  var numStr = String(num)
  if (numStr.length === 1) {
    numStr = '0' + numStr
  }
  return numStr
}

var ChatDialog = React.createClass({
  displayName: 'ChatDialog',

  // https://facebook.github.io/react/docs/reusable-components.html
  propTypes: {
    data: React.PropTypes.instanceOf(Immutable.List).isRequired,
    sendTo: React.PropTypes.func.isRequired,
    isIM: React.PropTypes.bool
  },

  getDefaultProps: function () {
    return {
      isIM: false
    }
  },

  getInitialState: function () {
    return {
      text: ''
    }
  },

  render: function () {
    var self = this
    var messages = this.props.data.map(function (msg) {
      var time = msg.get('time')
      var fromId = self.props.isIM ? msg.get('fromId') : msg.get('sourceID')
      var name = nameStore.getNameOf(fromId).toString()
      return (
      <div className={style.message}>
        <span className='time'>{leadingZero(time.getHours())}: {leadingZero(time.getMinutes())}: {leadingZero(time.getSeconds())}</span>
        <span className={style.avatar}>{name}</span>
        <span className='messageText'>{msg.get('message')}</span>
      </div>
      )
    })

    var placeholderText = 'Send ' +
      ((this.props.isIM) ? 'Instant Message' : 'to local chat')

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
          onChange={this._onChange}
          onKeyDown={this._onKeyDown} />
        <input
          type='button'
          className={style.send}
          value='Send'
          onClick={this._onClick} />
      </div>
    </div>
    )
  },

  _onChange: function (event, value) {
    this.setState({
      text: event.target.value
    })
  },

  _onKeyDown: function (event) {
    if (event.keyCode === 13) {
      event.preventDefault()
      var text = this.state.text.trim()
      if (text) {
        this.props.sendTo(text)
      }
      this.setState({
        text: ''
      })
    }
  },

  _onClick: function (event) {
    event.preventDefault()
    var text = this.state.text.trim()
    if (text) {
      this.props.sendTo(text)
    }
    this.setState({
      text: ''
    })
  }
})

module.exports = ChatDialog
