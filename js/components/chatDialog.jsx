'use strict';

/*
 * Displays a single conversation/dialog. Also the input
 */

var React = require('react');
var Immutable = require('immutable');

// Adds to all Numbers a leading zero if it has only one digit
function leadingZero (num) {
  var numStr = String(num);
  if (numStr.length === 1) {
    numStr = '0' + numStr;
  }
  return numStr;
}

var ChatDialog = React.createClass({
  displayName: 'ChatDialog',

  // https://facebook.github.io/react/docs/reusable-components.html
  propTypes: {
    data: React.PropTypes.instanceOf(Immutable.List).isRequired,
    sendTo: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {
      text: ''
    };
  },

  render: function () {
    var messages = this.props.data.map(function (msg) {
      var time = msg.get('time');
      return (
        <div className='message'>
          <span className='time'>
            {leadingZero(time.getHours())}:
            {leadingZero(time.getMinutes())}:
            {leadingZero(time.getSeconds())}
          </span>
          <span className='avatar'>{msg.get('fromName')}</span>
          <span className='messageText'>{msg.get('message')}</span>
        </div>
      );
    });

    return (
      <div className='ChatDialog'>
        <div>{messages}</div>
        <div className='ChatTextSend'>
          <input
            type='text'
            className=''
            name='chatInput'
            value={this.state.text}
            onChange={this._onChange}
            onKeyDown={this._onKeyDown}
          />
          <input type='button' onClick={this._onClick} value='Send'/>
        </div>
      </div>
    );
  },

  _onChange: function (event, value) {
    this.setState({
      text: event.target.value
    });
  },

  _onKeyDown: function (event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      var text = this.state.text.trim();
      if (text) {
        this.props.sendTo(text);
      }
      this.setState({
        text: ''
      });
    }
  },

  _onClick: function (event) {
    event.preventDefault();
    var text = this.state.text.trim();
    if (text) {
      this.props.sendTo(text);
    }
    this.setState({
      text: ''
    });
  }
});

module.exports = ChatDialog;
