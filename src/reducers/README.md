# Reducers

Reducers are at the core of state updates and define how the state changes.

Every reducer is a *pure function*, that takes 2 arguments: the *old state* and an *action* and returns the update state. The updated state __must__ be the same object as the old state, if nothing changed, and a new object, if something did change.

Creating a new object/array allows later code to check for changes with a `old === new`.

__For a tutorial of reducers (and redux) visit [redux.js.org](https://redux.js.org/).__ Here is a quick overview.

## General structure

A reducer is a big switch statement. Where it checks the action type (`switch (action.type) {`). And every branch handles one or more actions. They all must return the old state or an update version.

There must also be a default-branch. It must return the old state.

### Actions that are not relevant

If an action is not relevant for that reducer, then the reducer __must__ return the old state.

### Actions that are relevant

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
