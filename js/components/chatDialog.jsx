'use strict';

/*
 * Displays a single conversation/dialog
 */

var React = require('react');
var Immutable = require('immutable');

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
    data: React.PropTypes.instanceOf(Immutable.List)
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
      <div className='ChatDialog'>{messages}</div>
    );
  }
});

module.exports = ChatDialog;
