// Selectors for the inventory

export const getFolders = state => state.inventory.folders

export const getFolderById = (state, id) => getFolders(state).get(id)

export const getInventoryRootId = state => state.inventory.root

export const getInventoryRoot = state => getFolderById(state, getInventoryRootId(state))

export const getFolderForType = (state, type) => {
  const rootFolder = getInventoryRoot(state)
  if (type === 8) return rootFolder

  const folders = getFolders(state)

  for (const folderId of rootFolder.children) {
    const folder = folders.get(folderId)

    if (folder.typeDefault === type) {
      return folder
    }
  }
}
