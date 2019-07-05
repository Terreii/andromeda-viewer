// For the inventory

export default function inventory (state = { root: null, folders: new Map() }, action) {
  switch (action.type) {
    case 'didLogin':
      const loginFolders = action.sessionInfo['inventory-skeleton'].reduce((all, folder) => {
        all.set(folder.folder_id, {
          name: folder.name,
          folderId: folder.folder_id,
          version: folder.version,
          typeDefault: folder.type_default,
          parentId: folder.parent_id,
          children: []
        })
        return all
      }, new Map())

      action.sessionInfo['inventory-skeleton'].forEach(folder => {
        const parentId = folder.parent_id

        if (parentId !== '00000000-0000-0000-0000-000000000000' && loginFolders.has(parentId)) {
          loginFolders.get(parentId).children.push(folder.folder_id)
        }
      })

      return {
        root: action.sessionInfo['inventory-root'][0].folder_id,
        folders: loginFolders
      }

    case 'DidLogout':
    case 'UserWasKicked':
      return {
        root: null,
        folders: new Map()
      }

    default:
      return state
  }
}
