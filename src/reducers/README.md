## Reducers

Reducers are at the core of state updates and define how the state changes.

Every reducer is a *pure function*, that takes 2 arguments: the *old state* and an *action* and returns the update state. The updated state __must__ be the same object as the old state, if nothing changed, and a new object, if something did change.

Creating a new object/array allows later code to check for changes with a `old === new`.

__For a tutorial of reducers (and redux) visit [redux.js.org](https://redux.js.org/).__ Here is a quick overview.

### General structure

A reducer is a big switch statement. Where it checks the action type (`switch (action.type) {`). And every branch handles one or more actions. They all must return the old state or an updated version.

There must also be a default-branch. It must return the old state.

#### Actions that are not relevant

If an action is not relevant for that reducer, then the reducer __must__ return the old state.

#### Actions that are relevant

If the action is relevant, for this reducer, the actions data should get used to construct an updated state from the old state. This updated state *must* be a new object/copy.

Arrays should get updated with methods that create a new Array. They are: `concat` (for adding), `map` (for updating), `filter` (for removing) and if needed `reduce`.

```javascript
function todo (state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      return state.concat([ // A new copy of an array must be created
        action.todo
      ])

    case 'REMOVE_TODO':
      return state.filter(todo => todo.id !== action.id)

    default:
      return state
  }
}
```

Object get also updated with functions that create new Objects. This can be `Object.assign({}, oldState, changes)` or using the spread operator `{ ...oldState, changes }`.

```javascript
function names (state = {}, action) {
  switch (action.type) {
    case 'NEW_NAME':
      return {
        ...state,
        [action.id]: action.name
      }
      /*
       * this can also be:
       * return Object.assign({}, state, {
       *   [action.id]: action.name
       * })
       */

    case 'REMOVE_NAME':
      const updated = { ...state }
      delete updated[action.id]
      return updated

    default:
      return state
  }
}
```

If nothing changes (this includes state from sub-reducers), than the old state should get returned.

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
- Selectors from [reselect](https://www.npmjs.com/package/reselect) and similar.

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

