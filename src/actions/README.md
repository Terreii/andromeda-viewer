# Actions

In this directory are the [__redux actions__](https://redux.js.org/basics/actions) located.

If an action have to have a side effect: then it must return a function. [Redux-thunk](https://github.com/reduxjs/redux-thunk) will pick it up. It will pass to the function 3 arguments:

- [`dispatch`](https://redux.js.org/api/store#dispatch) from the store
- [`getState`](https://redux.js.org/api/store#getState) from the store
- An object containing
  - The [`hoodie`](http://hood.ie/) instance
  - The active `circuit` to the sim (more in `src/network`)

```javascript
function save (doc) {
  return (dispatch, getState, { hoodie, circuit }) => {
    return hoodie.cryptoStore.add(doc)
  }
}
```
