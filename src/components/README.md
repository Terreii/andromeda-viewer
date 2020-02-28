# Components

Components are __React-components__. They are responsible for creating the displayed HTML.

Components should be pure whenever it is possible. And they should be function components, with the state handled by [hooks](https://reactjs.org/docs/hooks-intro.html). But don't hesitate to add hooks/state.

## Connecting

Components get connected to the state with the [`useSelector` from `react-redux`](https://react-redux.js.org/api/hooks#useselector). While actions getting dispatched with [`useDispatch` from `react-redux`](https://react-redux.js.org/api/hooks#usedispatch).

### Get state

The state should get accessed with *selectors* using `useSelector`.

```javascript
import { useSelector, useDispatch } from 'react-redux'
import { selectLocalChat } from '../bundles/localChat'
import { selectNames } from '../bundles/names'

function ChatsBox (props) {
  const dispatch = useDispatch()
  const localChat = useSelector(selectLocalChat)
  const names = useSelector(selectNames)

  // do stuff
}
```

## Testing

Tests should have the same name as their components. But ending with `.test.js`.

For rendering and asserting components use [`React Testing Library`](https://testing-library.com/docs/react-testing-library/intro).

The minimal tests are:
- That they render without crashing
- That they pass [`aXe`](https://www.deque.com/axe/) tests. Use [`jest-axe`](https://www.npmjs.com/package/jest-axe) for this.

```javascript
it('should pass aXe', async () => {
  const { container } = render(<Provider store={configureStore()}>
    <MemoryRouter>
      <SomeComponent />
    </MemoryRouter>
  </Provider>)

  expect(await axe(container)).toHaveNoViolations()
})
```
