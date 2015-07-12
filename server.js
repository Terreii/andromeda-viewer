'use strict';

var read = require('read');

var parseFullName = require('./js/avatarName');
var session = require('./js/session');

// SL uses its own tls-certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

console.log('Andromeda is running!\nNot ready for production!\n');

console.log('Please enter your sl-login.');

// asking for the avatar-name
read({prompt: 'Avatar name (first.last): '}, function (er, name) {
  if (er) {
    console.error('Invalid login!');
    return;
  }
  // asking for the password
  read({prompt: 'Password: ', silent: true}, function (er, password) {
    if (er) {
      console.error('Something went wrong!');
      return;
    }
    if (password.length === 0) {
      console.error('Password is to short!');
      return;
    }

    var parsedName = parseFullName(name);
    console.log('Your login is: first: %s, last: %s',
      parsedName.first, parsedName.last);

    session.login(parsedName.first, parsedName.last, password,
        function (error, value) {
      console.log(error, typeof value, value);
    });
  });
});
