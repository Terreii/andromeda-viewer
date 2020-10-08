# Server tests

This directory contains the tests, that check the server/backend.

It uses [Mocha.js](https://mochajs.org/) as a test-runner and [Sinon.js](https://sinonjs.org) for mocking.

With `npm test` you'll run all tests enter. This includes the server tests.

But if to run the server tests:

```sh
npm run test:server
```

To run one test-file you can pass add extra arguments:

```sh
npm run test:server -- --exclude "test/*" --file test/account.test.js
```
