# Server tests

This directory contains the tests, that check the server/backend.

It uses [Mocha.js](https://mochajs.org/) as a test-runner and [Sinon.js](https://sinonjs.org) for mocking.

All tests will be run with `npm test`. But if you only want to run the server tests run:

```sh
npm run test:server
```

To run only one file you can pass additional arguments:

```sh
npm run test:server -- --exclude "test/*" --file test/account.test.js
```
