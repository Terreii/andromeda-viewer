// For the inventory

import { createReducer, PayloadAction } from '@reduxjs/toolkit'

import { login, logout, userWasKicked, LoginAction } from './session'

import { Folder, AssetType, FolderType } from '../types/inventory'

export default createReducer({
  root: null as string | null,
  folders: {} as { [key: string]: Folder }
}, {
  [login.type] (state, action: PayloadAction<LoginAction>) {
    // save guard if the login result has no inventory-skeleton
    if (!Array.isArray(action.payload.sessionInfo['inventory-skeleton'])) {
      console.warn("No inventory-skeleton was returned! Inventory won't work!")
      return
    }

    for (const folder of action.payload.sessionInfo['inventory-skeleton']) {
      state.folders[folder.folder_id] = {
        name: folder.name,
        folderId: folder.folder_id,
        version: folder.version,
        typeDefault: folder.type_default,
        parentId: folder.parent_id,
        children: []
      }
    }

    for (const folder of action.payload.sessionInfo['inventory-skeleton']) {
      const parentId = folder.parent_id

      if (parentId !== '00000000-0000-0000-0000-000000000000' && parentId in state.folders) {
        state.folders[parentId].children.push(folder.folder_id)
      }
    }

    if ((action.payload.sessionInfo['inventory-root']?.length ?? 0) > 0) {
      state.root = action.payload.sessionInfo['inventory-root'][0].folder_id
    }
  },

  [logout.type] () {
    return {
      root: null,
      folders: {}
    }
  },

  [userWasKicked.type] () {
    return {
      root: null,
      folders: {}
    }
  }
})

export const selectFolders = (state: any): { [key: string]: Folder } => state.inventory.folders

export const selectFolderById = (state: any, id: string) => selectFolders(state)[id]

export const selectInventoryRootId = (state: any): string => state.inventory.root

export const selectInventoryRoot = (state: any) => selectFolderById(
  state,
  selectInventoryRootId(state)
)

export const selectFolderForAssetType = (state: any, type: AssetType) => {
  const rootFolder = selectInventoryRoot(state)

  // Folders are loaded on login and removed on logout.
  if (rootFolder == null) {
    throw new Error('No avatar is signed in!')
  }

  // For folders the root folder is the default.
  if (type === AssetType.Folder) return rootFolder

  // Typecast the AssetType to FolderType (they mostly match up)
  if (FolderType[type as number] == null) {
    throw new TypeError(`There is no FolderType for AssetType ${AssetType[type]}!`)
  }
  const folderType = (type as number) as FolderType

  const folders = selectFolders(state)

  for (const folderId of rootFolder.children) {
    const folder = folders[folderId]

    if (folder == null) {
      console.error(new Error('Missing child folder. ID: ' + folderId))
      continue
    }

    if (folder.typeDefault === folderType) {
      return folder
    }
  }

  // If no match is found, then the root folder should be returned
  // The root folder is the fallback default.
  return rootFolder
}
