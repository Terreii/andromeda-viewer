'use strict';

var React = require('react');
var session = require('../session.js');
var ChatBox = require('./chatBox.jsx');

module.exports = function () {
  var name = session.getAvatarName();
  var render = function () {
    var messageOfTheDay = session.getMessageOfTheDay();
    var messageOfTheDayIndex = messageOfTheDay.search('http');
    var messageOfTheDayLink = messageOfTheDay.substr(messageOfTheDayIndex);
    var messageOfTheDayText = messageOfTheDay.substr(0, messageOfTheDayIndex);
    React.render(
      <div className='main'>
        <div id='menuBar'>
          <span>Hello {name.getName()}</span>
          <span>Message of the day: {messageOfTheDayText}
            <a
              href={messageOfTheDayLink}
              target='blank'
              className='menuBarLink'>{messageOfTheDayLink}</a>
          </span>
          <a href='#' className='menuBarLink' onclick={session.logout}>logout</a>
        </div>
        <ChatBox />
      </div>,
      document.body
    );
  };
  render();
};
