# Selectors

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
- Selectors from [reselect](https://www.npmjs.com/package/reselect) and similar.

## Pure function selectors

They take the current state as first argument (but more are possible) and return a value from it.

They are the base of all selectors. And should be fast, because they will get called every time this selector gets called.

```javascript
function isLoggedIn (state) {
  return state.session.get('loggedIn')
}
```

## Reselectors

Selectors that got created with reselect and similar. They get used for state that can get calculated, or combined from other state. That input state doesn't have to be from the same reducer.

The calculated value will get cached, until one input value changes.
The input is always the result of other selectors.

```javascript
const getShouldSaveChat = createSelector(
  [
    state => state.account // input selectors
  ],
  account => account.get('sync') && account.getIn(['viewerAccount', 'loggedIn'])
)
```

A selector should calculate/select one small aspect. But they can get combined into new ones.

For example could the map work with following selectors:
- Get the zoom level.
- Get the position on the map.
- Get the img-src array of the displayed area in that zoom level.
