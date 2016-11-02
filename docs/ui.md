# Data and View

## FLUX
[Flux](https://facebook.github.io/flux/) uses a one direction data flow.

actions ⇒ uiDispatcher.js ⇒ stores ⇒ [React](https://facebook.github.io/react/)-components

### Actions
Every new data and UI interaction trigger an action. They are located in _js/actions_.

All actions must have an _actionType_.

### uiDispatcher.js
The uiDispatcher.js redirects all actions to all stores. It also makes sure that only one action is processed at once.

It is a instance of the [flux dispatcher](https://www.npmjs.com/package/flux).

### Stores
Stores processes and stores all data for its domain. They all are using [Immutable Data Collections](https://www.npmjs.com/package/immutable).

If its data did change, the store must call the `this.__emitChange()` method!

* `IMStore` saves all instant message (IM)
* `localChatStore` saves the loval chat
* `nameStore` saves the names of avatars. It uses the avatarName-class.

### Components
They take the data from the stores and display them using **React**.

To change data they must call an **action**.
