# Client

This is the source of the client.

It is a [React](https://reactjs.org/) and [Hoodie](http://hood.ie/) based client. State gets handled by [redux-toolkit](https://redux-toolkit.js.org/). [Create React App](https://create-react-app.dev/ "create-react-app documentation page.") gets used for building and testing.

In this directory are the general and setup modules located. Most of the App is in the directories.

## Directories

- [`__tests__`](./__tests__) contains all dependencies and integration tests.
- [`actions`](./actions) contains all redux-actions.
- [`bundles`]('./bundles) hold and handle state changes. They also export selectors to access state.
- [`components`](./components) contains all react-components.
- [`hooks`](./hooks) contains common [react-hooks](https://reactjs.org/docs/hooks-intro.html).
- [`icons`](./icons) all icons and images.
- [`network`](./network) contains the UDP-network lair.
- [`reactors`](./reactors) contains functions that react to state changes and dispatch actions.
- [`store`](./store) sets up the store.
- [`types`](./types) TypeScript type declarations that get used in more than one place.

## Files

- [`index.js`](./index.js) is the entry point into the app. It sets up:
  - Hot module reloading
  - The store/state
  - Service-Worker
- [`app.js`](./app.js) is the root component. Routing and different Providers get handled here.
- [`avatarName.ts`](./avatarName.ts) handles parsing and displaying avatar names.
- [`llsd.js`](./llsd.js) A copy of LindenLabs [LLSD](http://wiki.secondlife.com/wiki/LLSD "LLSD documentation") [Javascript library](https://bitbucket.org/lindenlab/llsd/src/default/js/ "Repository of different LLSD libraries").
- [`react-app-env.d.ts`](./react-app-env.d.ts) importing of react-app types.
- [`registerServiceWorker.js`](./registerServiceWorker.js).
- [`setupProxy.js`](./setupProxy.js) sets up the [create-react-app dev proxy](https://create-react-app.dev/docs/proxying-api-requests-in-development/#configuring-the-proxy-manually "Documentation for the development proxy").
- [`setupTests.ts`](./setupTests.ts) global functions and settings for the tests ([documentation](https://create-react-app.dev/docs/running-tests/#srcsetuptestsjs)).
- [`testUtils.ts`](./testUtils.ts) has test helper functions. __Please use the `createTestStore` function to test Redux code__. This file exports `createTestStore`.
- [`viewerInfo.js`](./viewerInfo.js) functions for accessing viewer infos.

## Tests

*Unit tests* are to locate right next to the module they test. Their name should reflect their testing target. `names.js` gets tested by `names.test.js`.

*Integration tests* are in `__test__` located.

*Dependency tests* are in `__test__` located.

### Testing Redux code (action, reducers)

[`testUtils.ts`](./testUtils.ts) implements the `createTestStore` function. It creates test-utils and store for testing all redux code!

#### API createTestStore

```javascript
const result = await createTestStore({ localDB, remoteDB, state })
```

Argument | Type | Description | Required
---------|------|-------------|---------
`options` | Object | Object containing all option. | Yes
`options.localDB` | PouchDB.Database | If you want to use a database created by your tests. Only required if the database should have data before store-init. | No
`options.remoteDB` | PouchDB.Database | If you want to use a database created by your tests. Only required if the database should have data before store-init. Almost never required. | No
`options.state` | AppState | Set the state of the redux store. The AppState-enum is defined in [`testUtils.ts`](./testUtils.ts). | No

`createTestStore` Returns an Object with those fields:

Result | Type | Description
-------|------|------------
`store` | Redux-Store | The created test redux store. It is set to the provided state.
`cryptoStore` | [CryptoStore](github.com/Terreii/hoodie-plugin-store-crypto) | Instance to the cryptoStore for the localDB. Setup and/or unlocked if the state is >= LoggedIn.
`circuit` | Circuit | Mock for the UDP Circuit. `send` method is a `jest.fn` mock.
`fetchLLSD` | `jest.fn` | Mock for fetching LLSD data. Use JSON data for its result.
`proxyFetch` | `jest.fn` | Mock for the proxy fetch. Use `Response` for the result.
`setMark` | Function | Function to store the current redux-state with a key (string). Use that key with `getDiff`.
`getDiff` | Function | Calculates the diff between to states (using [deep-object-diff](https://www.npmjs.com/package/deep-object-diff)). Default is the initial (the state after the state option) and the current. But up to two keys can be passed.
`getCurrentDbs` | Function | Returns the current databases. `local` and `remote`.

#### Setting a initial state

The `state`-option sets the initial state.

```javascript
const { store, getDiff } = await createTestStore({ state: AppState.Connected })
```

The store is now set in a state representing a logged in user with an to a grid connected avatar.

The user data are:

Prop | Value
-----|------
Username | `tester.mactestface@example.com`
User-id | `6197db66-7452-47d6-bf47-85cfd71a2c71`
Avatar-name | `AndromedaViewerTester Resident`

For more values, please go to `setStateToConnectedToGrid` in [`testUtils.ts`](./testUtils.ts).

If `getDiff` is now called it will return `{}`, because the connected state is the initial test-state.

Any changes to the state will be in the diff.
