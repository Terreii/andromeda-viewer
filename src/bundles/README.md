# Bundles

Bundles are the core state management. Export:
- A [redux reducer](#reducers) ([redux.js.org](https://redux.js.org/)) build by [redux-toolkit](https://redux-toolkit.js.org/)'s [`createSlic`e](https://redux-toolkit.js.org/api/createslice/)
- [Actions](#actions) to change the state (build by createSlice)
- [Selectors](#selectors) to access and derive state

## Reducers

Reducers are at the core of state updates and define how the state changes.

Every reducer is a *pure function*, that takes 2 arguments: the *old state* and an *action* and returns the update state. The updated state __must__ be the same object as the old state, if nothing changed, and a new object, if something did change.

They get created using redux-toolkit's [`createReducer()`](https://redux-toolkit.js.org/api/createReducer) or with [`createSlice()`](https://redux-toolkit.js.org/api/createslice/). 

Creating a new object/array allows later code to check for changes with a `old === new`.

__For a tutorial of reducers (and redux) visit [redux.js.org](https://redux.js.org/) and [redux-toolkit's quick start](https://redux-toolkit.js.org/introduction/quick-start).__ Here is a quick overview.

Reducers created with `createReducer()` and `createSlice()` (which uses `createReducer()`) are lookup tables. They receive the old state and the action. They can also ["mutate"](https://redux-toolkit.js.org/api/createReducer#direct-state-mutation "documentation about the direct-state mutation") the state, because `createReducer` uses [immer.js](https://immerjs.github.io/immer/docs/introduction "Introduction to Immer").

## Actions

The actions exported by the bundles are [action creators](https://redux.js.org/basics/actions#action-creators "Redux tutorial on actions and action creators"). [Thunk actions](https://github.com/reduxjs/redux-thunk "redux-thunk repository") are for now located in [actions](../actions).

## Selectors

Selectors are the preferred way of accessing data in the apps redux-state.

They are functions that take the current state as first argument, and return their selected value.
They have the advantages of:
- Users don't have to know the full state tree.
- It is straightforward to change the state tree/structure.
- State can get calculated, when it gets requested, and is never out of sync.

```javascript
// isLoggedIn selects the loggedIn value from the state.
const loggedIn = isLoggedIn(store.getState())
```

There are 2 types of selectors:
- Normal pure functions. They return a value in the state, without changing it much.
- Selectors from [reselect](https://www.npmjs.com/package/reselect) and similar. Redux-toolkit exports [createSelector](https://redux-toolkit.js.org/api/createSelector). It should get used.

### Pure function selectors

They take the current state as first argument (but more are possible) and return a value from it.

They are the base of all selectors. And should be fast, because they will get called every time this selector gets called.

```javascript
function isLoggedIn (state) {
  return state.session.get('loggedIn')
}
```

### Reselectors

Selectors that got created with reselect and similar. They get used for state that can get calculated, or combined from other state. That input state doesn't have to be from the same reducer.

The calculated value will get cached, until one input value changes.
The input is always the result of other selectors.

```javascript
const getShouldSaveChat = createSelector(
  [
    state => state.account // input selectors
  ],
  // This should also be a pure function!
  account => account.get('sync') && account.getIn(['viewerAccount', 'loggedIn'])
)
```

A selector should calculate/select one small aspect. But they can get combined into new ones.

For example could the map work with following selectors:
- Get the zoom level.
- Get the position on the map.
- Get the img-src array of the displayed area in that zoom level.

## Types

Types defined in bundles are just for actions and internal usage. Selectors should return a type defined in the `types` directory.
