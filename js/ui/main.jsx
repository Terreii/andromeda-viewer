var React = require('react');
var session = require('../session.js');

module.exports = function () {
  React.render(
    <div>
      <h1>Hello World</h1>
      <a href="#" onclick={session.logout}>logout</a>
    </div>,
    document.body
  );
};
