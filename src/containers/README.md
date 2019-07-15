# Containers

Containers are the view-components that access the current *state* with *selectors*. Connect actions. And passes the state and actions to components.
They are the glue between the store, actions, and the components.

## Connecting

Containers get connected to the state with the [`useSelector` from `react-redux`](https://react-redux.js.org/api/hooks#useselector). While actions are dispatch with [`useDispatch` from `react-redux`](https://react-redux.js.org/api/hooks#usedispatch).

## Get state

The state should get accessed with *selectors* using `useSelector`.

```javascript
import { useSelector } from 'react-redux'
import { getLocalChat, getActiveIMChats } from '../selectors/chat'
import { getNames } from '../selectors/names'

function ChatsContainer (props) {
  const localChat = useSelector(getLocalChat)
  const IMs = useSelector(getActiveIMChats)
  const names = useSelector(getNames)

  // do stuff
}
```

## Get state the old way

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
