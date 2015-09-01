'use strict';

var React = require('react');
var session = require('../session.js');
var ChatBox = require('./chatBox.jsx');

module.exports = function () {
  var name = session.getAvatarName();
  var render = function () {
    React.render(
      <div>
        <div id='menuBar'>
          <span>Hello {name.getName()}</span>
          <a href='#' onclick={session.logout}>logout</a>
        </div>
        <ChatBox />
      </div>,
      document.body
    );
  };
  render();
};
