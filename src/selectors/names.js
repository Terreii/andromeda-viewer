// Selectors for names

export const getNames = state => state.names.get('names')

export const getAvatarNameById = (state, id) => state.names.getIn(['names', id])

export const getDisplayNamesURL = state => state.names.get('getDisplayNamesURL')
