import { axe } from 'jest-axe'
import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'

import Name from './name'
import configureStore from '../store/configureStore'
import { displayNamesLoaded } from '../bundles/names'
import AvatarName from '../avatarName'

jest.mock('../reactors/index.js', () => [])

function createStoreWithNames (names) {
  return configureStore({
    names: { names }
  })
}

it('renders without crashing', () => {
  const { container } = render(
    <Provider
      store={createStoreWithNames({
        a: new AvatarName('Tester MacTestface')
      })}
    >
      <Name id='a' />
    </Provider>
  )

  expect(container).toBeTruthy()
})

it('renders the display name', () => {
  const name = new AvatarName('Tester MacTestface')
    .withDisplayNameSetTo('Andromeda')

  const { queryByText } = render(
    <Provider store={createStoreWithNames({ a: name })}>
      <Name id='a' />
    </Provider>
  )

  const element = queryByText(name.getDisplayName())
  expect(element).toBeTruthy()
  expect(element.nodeName).toBe('SPAN')
})

it('renders not existing names as IDs', async () => {
  const id = 'e856f8e7-f774-4040-8392-df4185fa37e4'
  const store = createStoreWithNames({
    a: new AvatarName('Tester MacTestface')
  })

  const { queryByText } = render(
    <Provider store={store}>
      <Name id={id} />
    </Provider>
  )

  expect(queryByText(id, { selector: '[aria-hidden="true"]' })).toBeTruthy()
  expect(queryByText(id, { selector: '.sr-only' })).toBeTruthy()

  // Dispatch an action to load the name
  expect(store.getState().names.names[id]).toBeInstanceOf(AvatarName)
})

it('renders the fallback if name does not exist', async () => {
  const id = 'e856f8e7-f774-4040-8392-df4185fa37e4'
  const fallback = 'Fallback Macfallface'
  const store = createStoreWithNames({
    a: new AvatarName('Tester MacTestface')
  })

  const { queryByText } = render(
    <Provider store={store}>
      <Name id={id} fallback={fallback} />
    </Provider>
  )

  expect(queryByText(fallback, { selector: '[aria-hidden="true"]' })).toBeTruthy()
  expect(queryByText(fallback, { selector: '.sr-only' })).toBeTruthy()
  expect(queryByText(id)).toBeFalsy()

  // Dispatch an action to load the name
  expect(store.getState().names.names[id]).toBeInstanceOf(AvatarName)
  expect(store.getState().names.names[id].getName()).toBe(fallback)
})

it('should not add a missing name to names if loadMissing is set to false', () => {
  const id = 'e856f8e7-f774-4040-8392-df4185fa37e4'
  const fallback = 'Fallback Macfallface'
  const store = createStoreWithNames({
    a: new AvatarName('Tester MacTestface')
  })

  const { queryByText } = render(
    <Provider store={store}>
      <Name id={id} fallback={fallback} loadMissing={false} />
    </Provider>
  )

  expect(queryByText(fallback, { selector: '[aria-hidden="true"]' })).toBeTruthy()
  expect(queryByText(fallback, { selector: '.sr-only' })).toBeTruthy()
  expect(queryByText(id)).toBeFalsy()

  expect(store.getState().names.names[id]).toBeUndefined()
})

it('should update if the missing name gets loaded', () => {
  const store = createStoreWithNames({
    a: new AvatarName('Tester MacTestface')
  })

  const { queryByText } = render(
    <Provider store={store}>
      <Name id='e856f8e7-f774-4040-8392-df4185fa37e4' />
    </Provider>
  )

  expect(queryByText('e856f8e7-f774-4040-8392-df4185fa37e4', { selector: '[aria-hidden="true"]' }))
    .toBeTruthy()
  expect(queryByText('e856f8e7-f774-4040-8392-df4185fa37e4', { selector: '.sr-only' }))
    .toBeTruthy()

  store.dispatch(displayNamesLoaded([
    {
      id: 'e856f8e7-f774-4040-8392-df4185fa37e4',
      username: 'Tester MacTestface',
      display_name: 'Andromeda',
      display_name_next_update: 0,
      legacy_first_name: 'tester',
      legacy_last_name: 'mactestface',
      is_display_name_default: true
    }
  ]))

  expect(queryByText('e856f8e7-f774-4040-8392-df4185fa37e4')).toBeFalsy()
  const name = store.getState().names.names['e856f8e7-f774-4040-8392-df4185fa37e4']
  expect(queryByText(name.getDisplayName())).toBeTruthy()
  expect(queryByText(name.getName())).toBeTruthy()
})

it('should update if the name updates', () => {
  const name = new AvatarName('Tester MacTestface')
  const store = createStoreWithNames({
    a: name
  })

  const { queryByText } = render(
    <Provider store={store}>
      <Name id='a' />
    </Provider>
  )

  expect(queryByText(name.getName(), { selector: '[aria-hidden="true"]' })).toBeTruthy()
  expect(queryByText(name.getName(), { selector: '.sr-only' })).toBeTruthy()

  store.dispatch(displayNamesLoaded([
    {
      id: 'a',
      username: 'Tester MacTestface',
      display_name: 'Andromeda',
      display_name_next_update: 0,
      legacy_first_name: 'tester',
      legacy_last_name: 'mactestface',
      is_display_name_default: true
    }
  ]))

  expect(queryByText(name.getName())).toBeFalsy()
  const nextName = name.withDisplayNameSetTo('Andromeda', 'tester', 'mactestface')
  expect(queryByText(nextName.getDisplayName())).toBeTruthy()
  expect(queryByText(nextName.getName())).toBeTruthy()
})

it('should pass its arguments down', () => {
  const name = new AvatarName('Tester MacTestface')
    .withDisplayNameSetTo('Andromeda', 'tester', 'mactestface')

  const { queryByText } = render(
    <Provider store={createStoreWithNames({ a: name })}>
      <Name
        id='a'
        className='text-xl'
        aria-label='test'
      />
    </Provider>
  )

  const component = queryByText(name.getDisplayName()).parentElement
  expect(component.classList.contains('text-xl')).toBeTruthy()
  expect(component.getAttribute('aria-label')).toBe('test')
})

it('should pass aXe', async () => {
  const { container } = render(
    <Provider
      store={createStoreWithNames({
        a: new AvatarName('Tester MacTestface'),
        b: new AvatarName('Tester MacTestface')
          .withDisplayNameSetTo('Andromeda', 'tester', 'mactestface')
      })}
    >
      <p>
        <Name id='a' />
        <br />
        <Name id='b' />
        <br />
        <Name id='c' />
      </p>
    </Provider>
  )

  expect(await axe(container)).toHaveNoViolations()
})
