import { axe } from 'jest-axe'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { NIL } from 'uuid'

import Name from './name'
import configureStore from '../store/configureStore'
import {
  displayNamesLoaded,
  getNameString,
  getDisplayName,
  selectAvatarNameById,
  selectAvatarDisplayName
} from '../bundles/names'

jest.mock('../reactors/index.ts', () => [])

/**
 * Create a Store with names.
 * @param {AvatarName|AvatarName[]} names
 * @returns
 */
function createStoreWithNames (names) {
  const ids = Array.isArray(names) ? names.map(n => n.id) : [names.id]
  const entities = Array.isArray(names)
    ? Object.fromEntries(names.map(n => [n.id, n]))
    : { [names.id]: names }

  return configureStore({
    names: {
      names: { ids, entities }
    }
  })
}

/**
 * Return an AvatarName object.
 * @param {string} id    An id
 * @param {string} first First name part
 * @param {string} last  Last name part
 * @param {string} [display] Display name
 * @returns {AvatarName}
 */
function getName (id, first, last, display) {
  const hasDisplayName = (display?.length ?? 0) > 0
  return {
    id,
    firstName: first,
    lastName: last,
    displayName: display || '',
    isDisplayNameDefault: hasDisplayName,
    didLoadDisplayName: hasDisplayName,
    isLoadingDisplayName: false
  }
}

it('renders without crashing', () => {
  const { container } = render(
    <Provider
      store={createStoreWithNames(getName('a', 'Tester', 'MacTestface'))}
    >
      <Name id='a' />
    </Provider>
  )

  expect(container).toBeTruthy()
})

it('renders the display name', () => {
  const name = getName('a', 'Tester', 'MacTestface', 'Andromeda')

  const { queryByText } = render(
    <Provider store={createStoreWithNames(name)}>
      <Name id='a' />
    </Provider>
  )

  const element = queryByText(getDisplayName(name))
  expect(element).toBeTruthy()
  expect(element.nodeName).toBe('SPAN')
})

it('renders not existing names as IDs', async () => {
  const id = 'e856f8e7-f774-4040-8392-df4185fa37e4'
  const store = createStoreWithNames(
    getName('a', 'Tester', 'MacTestface', 'Andromeda')
  )

  const { queryByText } = render(
    <Provider store={store}>
      <Name id={id} />
    </Provider>
  )

  expect(queryByText(id, { selector: '[aria-hidden="true"]' })).toBeTruthy()
  expect(queryByText(id, { selector: '.sr-only' })).toBeTruthy()

  // Dispatch an action to load the name
  expect(selectAvatarNameById(store.getState(), id)).toEqual({
    id,
    firstName: '',
    lastName: '',
    displayName: '',
    isDisplayNameDefault: false,
    didLoadDisplayName: false,
    isLoadingDisplayName: false
  })
})

it('renders the fallback if name does not exist', async () => {
  const id = 'e856f8e7-f774-4040-8392-df4185fa37e4'
  const fallback = 'Fallback Macfallface'
  const store = createStoreWithNames(
    getName('a', 'Tester', 'MacTestface')
  )

  const { queryByText } = render(
    <Provider store={store}>
      <Name id={id} fallback={fallback} />
    </Provider>
  )

  expect(queryByText(fallback, { selector: '[aria-hidden="true"]' })).toBeTruthy()
  expect(queryByText(fallback, { selector: '.sr-only' })).toBeTruthy()
  expect(queryByText(id)).toBeFalsy()

  // Dispatch an action to load the name
  expect(selectAvatarNameById(store.getState(), id)).toEqual({
    id,
    firstName: 'Fallback',
    lastName: 'Macfallface',
    displayName: '',
    isDisplayNameDefault: false,
    didLoadDisplayName: false,
    isLoadingDisplayName: false
  })
  expect(selectAvatarDisplayName(store.getState(), id)).toBe('Fallback Macfallface')
})

it('should not add a missing name to names if loadMissing is set to false', () => {
  const id = 'e856f8e7-f774-4040-8392-df4185fa37e4'
  const fallback = 'Fallback Macfallface'
  const store = createStoreWithNames(
    getName('a', 'Tester', 'MacTestface')
  )

  const { queryByText } = render(
    <Provider store={store}>
      <Name id={id} fallback={fallback} loadMissing={false} />
    </Provider>
  )

  expect(queryByText(fallback, { selector: '[aria-hidden="true"]' })).toBeTruthy()
  expect(queryByText(fallback, { selector: '.sr-only' })).toBeTruthy()
  expect(queryByText(id)).toBeFalsy()

  expect(selectAvatarNameById(store.getState(), id)).toBeUndefined()
})

it('should not add a missing name to names if the id is a NIL UUID', () => {
  const fallback = 'Fallback Macfallface'
  const store = createStoreWithNames(
    getName('a', 'Tester', 'MacTestface')
  )

  const { queryByText } = render(
    <Provider store={store}>
      <Name id={NIL} fallback={fallback} />
    </Provider>
  )

  expect(queryByText(fallback, { selector: '[aria-hidden="true"]' })).toBeTruthy()
  expect(queryByText(fallback, { selector: '.sr-only' })).toBeTruthy()
  expect(queryByText(NIL)).toBeFalsy()

  expect(selectAvatarNameById(store.getState(), NIL)).toBeUndefined()
})

it('should update if the missing name gets loaded', () => {
  const store = createStoreWithNames(
    getName('a', 'Tester', 'MacTestface')
  )

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
  const name = selectAvatarNameById(store.getState(), 'e856f8e7-f774-4040-8392-df4185fa37e4')
  expect(queryByText(getDisplayName(name))).toBeTruthy()
  expect(queryByText(getNameString(name))).toBeTruthy()
})

it('should update if the name updates', () => {
  const name = getName('a', 'Tester', 'MacTestface')
  const store = createStoreWithNames(name)

  const { queryByText } = render(
    <Provider store={store}>
      <Name id='a' />
    </Provider>
  )

  expect(queryByText(getNameString(name), { selector: '[aria-hidden="true"]' })).toBeTruthy()
  expect(queryByText(getNameString(name), { selector: '.sr-only' })).toBeTruthy()

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

  expect(queryByText(getNameString(name))).toBeFalsy()
  const nextName = {
    ...name,
    displayName: 'Andromeda',
    lastName: 'Mactestface'
  }
  expect(queryByText(getDisplayName(nextName))).toBeTruthy()
  expect(queryByText(getNameString(nextName))).toBeTruthy()
})

it('should pass its arguments down', () => {
  const name = getName('a', 'Tester', 'MacTestface', 'Andromeda')

  const { queryByText } = render(
    <Provider store={createStoreWithNames(name)}>
      <Name
        id='a'
        className='text-xl'
        aria-label='test'
      />
    </Provider>
  )

  const component = queryByText(getDisplayName(name)).parentElement
  expect(component.classList.contains('text-xl')).toBeTruthy()
  expect(component.getAttribute('aria-label')).toBe('test')
})

it('should pass aXe', async () => {
  const { container } = render(
    <Provider
      store={createStoreWithNames([
        getName('a', 'Tester', 'MacTestface'),
        getName('b', 'Tester', 'MacTestface', 'Andromeda')
      ])}
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
