'use strict';

var React = require('react');
var ReactDom = require('react-dom');

var session = require('../session.js');
var ChatBox = require('./chatBox.jsx');
var style = require('../../style/menuBar.css');

module.exports = function () {
  var name = session.getAvatarName();
  var render = function () {
    var messageOfTheDay = session.getMessageOfTheDay();
    var messageOfTheDayIndex = messageOfTheDay.search('http');
    var messageOfTheDayLink = messageOfTheDay.substr(messageOfTheDayIndex);
    var messageOfTheDayText = messageOfTheDay.substr(0, messageOfTheDayIndex);
    ReactDom.render(
      <div className={style.main}>
        <div id='menuBar' className={style.menuBar}>
          <span>Hello {name.getName()}</span>
          <span>Message of the day: {messageOfTheDayText}
            <a
              href={messageOfTheDayLink}
              target='blank'
              className={style.daylyMessageLink}>{messageOfTheDayLink}</a>
          </span>
          <a href='#' className={style.logout} onClick={session.logout}>logout</a>
        </div>
        <ChatBox />
      </div>,
      document.body
    );
  };
  render();
};
