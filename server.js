var read = require('read');

console.log('Andromeda is running!\nNot ready for production!\n');

console.log('Please enter your sl-login.');

read({ prompt: 'Avatar name (first.last): ' }, function (er, name) {
  if (er) {
    console.error('Invalid login!');
    return;
  }
  read({ prompt: 'Password: ', silent: true }, function (er, password) {
    if (er) {
      console.error('Something went wrong!');
      return;
    }
    if (password.length === 0) {
      console.error('Password is to short!');
      return;
    }
    console.log('Your login is: %s', name);
  });
});
