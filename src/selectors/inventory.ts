// Selectors for the inventory

import { Folder, AssetType, FolderType } from '../types/inventory'

export const getFolders = (state: any): { [key: string]: Folder } => state.inventory.folders

export const getFolderById = (state: any, id: string) => getFolders(state)[id]

export const getInventoryRootId = (state: any): string => state.inventory.root

export const getInventoryRoot = (state: any) => getFolderById(state, getInventoryRootId(state))

export const getFolderForAssetType = (state: any, type: AssetType) => {
  const rootFolder = getInventoryRoot(state)

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

  const folders = getFolders(state)

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
