# Containers

Containers are the view-components that access the current *state* with *selectors*. Connect actions. And passes the state and actions to components.
They are the glue between the store, actions, and the components.

## Connecting

Containers get connected to the state with the [`connect` from `react-redux`](https://react-redux.js.org/api/connect).

## Get state

The state, in the `mapStateToProps` fn of `connect`, should get accessed with *selectors*.

```javascript
import { getLocalChat, getActiveIMChats } from '../selectors/chat'
import { getNames } from '../selectors/names'

const mapStateToProps = state => {
  return {
    localChat: getLocalChat(state),
    IMs: getActiveIMChats(state),
    names: getNames(state)
  }
}
```
