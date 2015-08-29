'use strict';

var React = require('react');
var session = require('../session.js');
var Chat = require('./chat.jsx');

module.exports = function () {
  var name = session.getAvatarName();
  var render = function () {
    React.render(
      <div>
        <h1>
          Hello {name.first} {name.last}
        </h1>
        <a href='#' onclick={session.logout}>logout</a>
        <Chat />
      </div>,
      document.body
    );
  };
  render();
};
