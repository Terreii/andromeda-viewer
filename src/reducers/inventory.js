// For the inventory

import { createReducer } from '@reduxjs/toolkit'

export default createReducer({ root: null, folders: {} }, {
  didLogin (state, action) {
    // save guard if the login result has no inventory-skeleton
    if (!Array.isArray(action.sessionInfo['inventory-skeleton'])) {
      console.warn("No inventory-skeleton was returned! Inventory won't work!")
      return
    }

    for (const folder of action.sessionInfo['inventory-skeleton']) {
      state.folders[folder.folder_id] = {
        name: folder.name,
        folderId: folder.folder_id,
        version: folder.version,
        typeDefault: folder.type_default,
        parentId: folder.parent_id,
        children: []
      }
    }

    for (const folder of action.sessionInfo['inventory-skeleton']) {
      const parentId = folder.parent_id

      if (parentId !== '00000000-0000-0000-0000-000000000000' && parentId in state.folders) {
        state.folders[parentId].children.push(folder.folder_id)
      }
    }

    state.root = action.sessionInfo['inventory-root'][0].folder_id
  },

  DidLogout () {
    return {
      root: null,
      folders: {}
    }
  },

  UserWasKicked () {
    return {
      root: null,
      folders: {}
    }
  }
})
