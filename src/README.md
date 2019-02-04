# Client

This is the source of the client.

It is a [React](https://reactjs.org/) and [Hoodie](http://hood.ie/) based client. State gets handled by [redux](https://redux.js.org/), [redux-thunk](https://github.com/reduxjs/redux-thunk) and [reselect](https://www.npmjs.com/package/reselect).

In this directory are the general and setup modules located. Most of the App is in the directories.

## Directories

- [`__tests__`](./__tests__) contains all dependencies and integration tests.
- [`actions`](./actions) contains all redux-actions.
- [`components`](./components) contains all react-components.
- [`containers`](./containers) contains the glue-code between state and components.
- [`icons`](./icons) all icons and images.
- [`network`](./network) contains the UDP-network lair.
- [`reactors`](./reactors) contains functions that react to state changes and dispatch actions.
- [`selectors`](./selectors) contains functions to access and derive state.
- [`store`](./store) sets up the store.

## Tests

*Unit tests* are to locate right next to the module they test. Their name should reflect their testing target. `names.js` gets tested by `names.test.js`.

*Integration tests* are in `__test__` located.

*Dependency tests* are in `__test__` located.
