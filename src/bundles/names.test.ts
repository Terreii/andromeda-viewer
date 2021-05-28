import { NIL } from 'uuid'

import { createTestStore } from '../testUtils'

import {
  addMissing,
  displayNamesStartLoading,
  displayNamesLoaded,
  selectAvatarDisplayName,
  selectIdOfNamesToLoad,
  parseNameString,
  getNameString,
  getFullNameString,
  getDisplayName
} from './names'

describe('actions', () => {
  describe('addMissing', () => {
    it('should add a missing name', async () => {
      const { store, getDiff } = await createTestStore()

      store.dispatch(addMissing({
        id: 'e856f8e7-f774-4040-8392-df4185fa37e4'
      }))

      expect(getDiff()).toEqual({
        names: {
          names: {
            entities: {
              'e856f8e7-f774-4040-8392-df4185fa37e4': {
                id: 'e856f8e7-f774-4040-8392-df4185fa37e4',
                firstName: '',
                lastName: '',
                displayName: '',
                didLoadDisplayName: false,
                isLoadingDisplayName: false,
                isDisplayNameDefault: false
              }
            },
            ids: { 0: 'e856f8e7-f774-4040-8392-df4185fa37e4' }
          }
        }
      })
    })

    it('should parse the fallback name', async () => {
      const { store, getDiff } = await createTestStore()

      store.dispatch(addMissing({
        id: 'e856f8e7-f774-4040-8392-df4185fa37e4',
        fallback: 'tEsTeR ANdRoMEDA'
      }))

      expect(getDiff()).toEqual({
        names: {
          names: {
            entities: {
              'e856f8e7-f774-4040-8392-df4185fa37e4': {
                id: 'e856f8e7-f774-4040-8392-df4185fa37e4',
                firstName: 'Tester',
                lastName: 'Andromeda',
                displayName: '',
                didLoadDisplayName: false,
                isLoadingDisplayName: false,
                isDisplayNameDefault: false
              }
            },
            ids: { 0: 'e856f8e7-f774-4040-8392-df4185fa37e4' }
          }
        }
      })
    })

    it('should not change an existing name', async () => {
      const { store, setMark, getDiff } = await createTestStore()

      store.dispatch(addMissing({
        id: 'e856f8e7-f774-4040-8392-df4185fa37e4',
        fallback: 'tEsTeR ANdRoMEDA'
      }))

      setMark('A')

      store.dispatch(addMissing({
        id: 'e856f8e7-f774-4040-8392-df4185fa37e4',
        fallback: 'Other ANdRoMEDA'
      }))

      expect(getDiff('A')).toEqual({})
    })

    it('should not add a NIL UUID', async () => {
      const { store, getDiff } = await createTestStore()

      store.dispatch(addMissing({
        id: NIL
      }))

      expect(getDiff()).toEqual({})
    })
  })

  describe('displayNamesStartLoading', () => {
    it('should set isLoadingDisplayName of the names', async () => {
      const { store, setMark, getDiff } = await createTestStore()

      store.dispatch(addMissing({
        id: 'e856f8e7-f774-4040-8392-df4185fa37e4',
        fallback: 'Andromeda'
      }))

      setMark('A')

      const ids = selectIdOfNamesToLoad(store.getState())
      expect(ids).toEqual(['e856f8e7-f774-4040-8392-df4185fa37e4'])

      store.dispatch(displayNamesStartLoading(ids))

      expect(getDiff('A')).toEqual({
        names: {
          names: {
            entities: {
              'e856f8e7-f774-4040-8392-df4185fa37e4': {
                isLoadingDisplayName: true
              }
            }
          }
        }
      })

      const idsAfterStart = selectIdOfNamesToLoad(store.getState())
      expect(idsAfterStart).toHaveLength(0)
    })
  })

  describe('displayNamesLoaded', () => {
    it('should add the display names', async () => {
      const { store, setMark, getDiff } = await createTestStore()

      store.dispatch(addMissing({
        id: 'e856f8e7-f774-4040-8392-df4185fa37e4',
        fallback: 'Andromeda'
      }))
      store.dispatch(displayNamesStartLoading([
        'e856f8e7-f774-4040-8392-df4185fa37e4'
      ]))

      setMark('A')

      expect(selectAvatarDisplayName(store.getState(), 'e856f8e7-f774-4040-8392-df4185fa37e4'))
        .toBe('Andromeda')

      store.dispatch(displayNamesLoaded(
        [
          {
            id: 'e856f8e7-f774-4040-8392-df4185fa37e4',
            username: 'andromeda.resident',
            display_name: 'AndromedaViewer',
            display_name_next_update: 0,
            legacy_first_name: 'andromeda',
            legacy_last_name: 'resident',
            is_display_name_default: false
          }
        ],
        [],
        []
      ))

      expect(getDiff('A')).toEqual({
        names: {
          names: {
            entities: {
              'e856f8e7-f774-4040-8392-df4185fa37e4': {
                displayName: 'AndromedaViewer',
                didLoadDisplayName: true,
                isLoadingDisplayName: false
              }
            }
          }
        }
      })

      expect(selectAvatarDisplayName(store.getState(), 'e856f8e7-f774-4040-8392-df4185fa37e4'))
        .toBe('AndromedaViewer (Andromeda)')
    })

    it('should update first name and last name', async () => {
      const { store, setMark, getDiff } = await createTestStore()

      store.dispatch(addMissing({
        id: 'e856f8e7-f774-4040-8392-df4185fa37e4',
        fallback: 'Andromeda'
      }))
      store.dispatch(displayNamesStartLoading([
        'e856f8e7-f774-4040-8392-df4185fa37e4'
      ]))

      setMark('A')

      store.dispatch(displayNamesLoaded(
        [
          {
            id: 'e856f8e7-f774-4040-8392-df4185fa37e4',
            username: 'viewer.littlepaws',
            display_name: 'AndromedaViewer',
            display_name_next_update: 0,
            legacy_first_name: 'viewer',
            legacy_last_name: 'littlepaws',
            is_display_name_default: false
          }
        ],
        [],
        []
      ))

      expect(getDiff('A')).toEqual({
        names: {
          names: {
            entities: {
              'e856f8e7-f774-4040-8392-df4185fa37e4': {
                firstName: 'Viewer',
                lastName: 'Littlepaws',
                displayName: 'AndromedaViewer',
                didLoadDisplayName: true,
                isLoadingDisplayName: false
              }
            }
          }
        }
      })

      expect(selectAvatarDisplayName(store.getState(), 'e856f8e7-f774-4040-8392-df4185fa37e4'))
        .toBe('AndromedaViewer (Viewer Littlepaws)')
    })

    it('should set bad ids as loaded', async () => {
      const { store, setMark, getDiff } = await createTestStore()

      store.dispatch(addMissing({
        id: 'e856f8e7-f774-4040-8392-df4185fa37e4',
        fallback: 'Andromeda'
      }))
      store.dispatch(displayNamesStartLoading([
        'e856f8e7-f774-4040-8392-df4185fa37e4'
      ]))

      setMark('A')

      store.dispatch(displayNamesLoaded([], ['e856f8e7-f774-4040-8392-df4185fa37e4'], []))

      expect(getDiff('A')).toEqual({
        names: {
          names: {
            entities: {
              'e856f8e7-f774-4040-8392-df4185fa37e4': {
                didLoadDisplayName: true,
                isLoadingDisplayName: false
              }
            }
          }
        }
      })
    })

    it('should handle displayNames that are the default name', async () => {
      const { store, setMark, getDiff } = await createTestStore()

      store.dispatch(addMissing({
        id: 'e856f8e7-f774-4040-8392-df4185fa37e4',
        fallback: 'Andromeda'
      }))
      store.dispatch(displayNamesStartLoading([
        'e856f8e7-f774-4040-8392-df4185fa37e4'
      ]))

      setMark('A')

      store.dispatch(displayNamesLoaded(
        [
          {
            id: 'e856f8e7-f774-4040-8392-df4185fa37e4',
            username: 'andromeda.resident',
            display_name: 'Andromeda Resident',
            display_name_next_update: 0,
            legacy_first_name: 'andromeda',
            legacy_last_name: 'resident',
            is_display_name_default: true
          }
        ],
        [],
        []
      ))

      expect(getDiff('A')).toEqual({
        names: {
          names: {
            entities: {
              'e856f8e7-f774-4040-8392-df4185fa37e4': {
                displayName: 'Andromeda Resident',
                isDisplayNameDefault: true,
                didLoadDisplayName: true,
                isLoadingDisplayName: false
              }
            }
          }
        }
      })

      expect(selectAvatarDisplayName(store.getState(), 'e856f8e7-f774-4040-8392-df4185fa37e4'))
        .toBe('Andromeda')
    })
  })
})

describe('utils', () => {
  describe('parseNameString', () => {
    it('should parse a name with a dot', () => {
      expect(parseNameString('First.Last')).toEqual({
        firstName: 'First',
        lastName: 'Last'
      })
    })

    it('should parse a name with a space', () => {
      expect(parseNameString('Tester Linden')).toEqual({
        firstName: 'Tester',
        lastName: 'Linden'
      })
    })

    it('should parse a name with only the first name', () => {
      expect(parseNameString('Andromeda')).toEqual({
        firstName: 'Andromeda',
        lastName: 'Resident'
      })
    })

    it('should parse a name with only the first name, with space', () => {
      expect(parseNameString('Andromeda ')).toEqual({
        firstName: 'Andromeda',
        lastName: 'Resident'
      })
    })

    it('should parse a name with only the first name, with dot', () => {
      expect(parseNameString('Tester.')).toEqual({
        firstName: 'Tester',
        lastName: 'Resident'
      })
    })

    it('should format names', () => {
      expect(parseNameString('tEsTeR ANdRoMEDA')).toEqual({
        firstName: 'Tester',
        lastName: 'Andromeda'
      })
    })
  })

  describe('getNameString', () => {
    it('should return the first name and last name', () => {
      expect(
        getNameString({
          id: 'e856f8e7-f774-4040-8392-df4185fa37e4',
          firstName: 'Tester',
          lastName: 'Linden'
        })
      ).toBe('Tester Linden')
    })

    it('should not return the last name if it is "Resident"', () => {
      expect(
        getNameString({
          id: 'e856f8e7-f774-4040-8392-df4185fa37e4',
          firstName: 'Andromeda',
          lastName: 'Resident'
        })
      ).toBe('Andromeda')
    })

    it('should return the id, if the firstName and lastName are empty', () => {
      expect(
        getNameString({
          id: 'e856f8e7-f774-4040-8392-df4185fa37e4',
          firstName: '',
          lastName: ''
        })
      ).toBe('e856f8e7-f774-4040-8392-df4185fa37e4')
    })

    it('should return the id, if the firstName is empty and lastName "Resident"', () => {
      expect(
        getNameString({
          id: 'e856f8e7-f774-4040-8392-df4185fa37e4',
          firstName: '',
          lastName: 'Resident'
        })
      ).toBe('e856f8e7-f774-4040-8392-df4185fa37e4')
    })
  })

  describe('getFullNameString', () => {
    it('should return the first name and last name', () => {
      expect(
        getFullNameString({
          firstName: 'Tester',
          lastName: 'Linden'
        })
      ).toBe('Tester Linden')
    })

    it('should return the last name if it is "Resident"', () => {
      expect(
        getFullNameString({
          firstName: 'Andromeda',
          lastName: 'Resident'
        })
      ).toBe('Andromeda Resident')
    })

    it('should return "Resident" if the last name is empty', () => {
      expect(
        getFullNameString({
          firstName: 'Andromeda',
          lastName: ''
        })
      ).toBe('Andromeda Resident')
    })
  })

  describe('getDisplayName', () => {
    it('should return firstName and lastName if display name is empty', () => {
      expect(
        getDisplayName({
          id: 'e856f8e7-f774-4040-8392-df4185fa37e4',
          firstName: 'Andromeda',
          lastName: 'Tester',
          displayName: '',
          isLoadingDisplayName: false,
          didLoadDisplayName: false,
          isDisplayNameDefault: false
        })
      ).toBe('Andromeda Tester')
    })

    it('should only return the firstName if lastName and displayName are empty', () => {
      expect(
        getDisplayName({
          id: 'e856f8e7-f774-4040-8392-df4185fa37e4',
          firstName: 'Andromeda',
          lastName: '',
          displayName: '',
          isLoadingDisplayName: false,
          didLoadDisplayName: false,
          isDisplayNameDefault: false
        })
      ).toBe('Andromeda')
    })

    it(
      'should only return the firstName if lastName is "Resident" and displayName are empty',
      () => {
        expect(
          getDisplayName({
            id: 'e856f8e7-f774-4040-8392-df4185fa37e4',
            firstName: 'Andromeda',
            lastName: 'Resident',
            displayName: '',
            isLoadingDisplayName: false,
            didLoadDisplayName: false,
            isDisplayNameDefault: false
          })
        ).toBe('Andromeda')
      }
    )

    it('should return the id, if everything else is empty', () => {
      expect(
        getDisplayName({
          id: 'e856f8e7-f774-4040-8392-df4185fa37e4',
          firstName: '',
          lastName: '',
          displayName: '',
          isLoadingDisplayName: false,
          didLoadDisplayName: false,
          isDisplayNameDefault: false
        })
      ).toBe('e856f8e7-f774-4040-8392-df4185fa37e4')
    })

    it('should format a full name', () => {
      expect(
        getDisplayName({
          id: 'e856f8e7-f774-4040-8392-df4185fa37e4',
          firstName: 'Andromeda',
          lastName: 'Tester',
          displayName: 'AndromedaViewer',
          isLoadingDisplayName: false,
          didLoadDisplayName: true,
          isDisplayNameDefault: false
        })
      ).toBe('AndromedaViewer (Andromeda Tester)')
    })

    it('should format a full name with "Resident" as lastName', () => {
      expect(
        getDisplayName({
          id: 'e856f8e7-f774-4040-8392-df4185fa37e4',
          firstName: 'Andromeda',
          lastName: 'Resident',
          displayName: 'AndromedaViewer',
          isLoadingDisplayName: false,
          didLoadDisplayName: true,
          isDisplayNameDefault: false
        })
      ).toBe('AndromedaViewer (Andromeda)')
    })

    it('should return the first and last name if isDisplayNameDefault is true', () => {
      expect(
        getDisplayName({
          id: 'e856f8e7-f774-4040-8392-df4185fa37e4',
          firstName: 'Andromeda',
          lastName: 'Tester',
          displayName: 'Andromeda Tester',
          isLoadingDisplayName: false,
          didLoadDisplayName: true,
          isDisplayNameDefault: true
        })
      ).toBe('Andromeda Tester')
    })

    it('should return the first if isDisplayNameDefault is true and lastName "Resident"', () => {
      expect(
        getDisplayName({
          id: 'e856f8e7-f774-4040-8392-df4185fa37e4',
          firstName: 'Andromeda',
          lastName: 'Resident',
          displayName: 'Andromeda Resident',
          isLoadingDisplayName: false,
          didLoadDisplayName: true,
          isDisplayNameDefault: true
        })
      ).toBe('Andromeda')
    })
  })
})
