# Client

This is the source of the client.

It is a [React](https://reactjs.org/) and [Hoodie](http://hood.ie/) based client. State gets handled by [redux-toolkit](https://redux-toolkit.js.org/). [Create React App](https://create-react-app.dev/ "create-react-app documentation page.") gets used for building and testing.

In this directory are the general and setup modules located. Most of the App is in the directories.

## Directories

- [`__tests__`](./__tests__) contains all dependencies and integration tests.
- [`actions`](./actions) contains all redux-actions.
- [`bundles`]('./bundles) hold and handle state changes. They also export selectors to access state.
- [`components`](./components) contains all react-components.
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
- [`setupTests.js`](./setupTests.js) global functions and settings for the tests ([documentation](https://create-react-app.dev/docs/running-tests/#srcsetuptestsjs)).
- [`viewerInfo.js`](./viewerInfo.js) functions for accessing viewer infos.

## Tests

*Unit tests* are to locate right next to the module they test. Their name should reflect their testing target. `names.js` gets tested by `names.test.js`.

*Integration tests* are in `__test__` located.

*Dependency tests* are in `__test__` located.
