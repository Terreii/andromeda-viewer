// Types for viewer types

/**
 * Object from hoodie that stores dates for created, last updated and deleted.
 * 
 * All dates are ISO-Date strings from:
 * ```javascript
 * new Date().toJSON()
 * ```
 */
export interface HoodieTimeObject {
  /**
   * When the object was created/first saved.
   */
  createdAt: string
  /**
   * When the object was last updated.
   * 
   * It only exists if the object as updated.
   */
  updatedAt?: string
  /**
   * When the object was deleted.
   * 
   * It only exists when the object was deleted.
   */
  deletedAt?: string
}

/**
 * This interface is for every object that can/will be saved using Hoodie.
 * 
 * It gives access to the hoodie/PouchDB/CouchDB properties. 
 */
export interface HoodieObject {
  /**
   * Unique ID for this object.
   * 
   * This is how it can be found.
   */
  _id: string
  /**
   * Revision and hash string.
   * 
   * It is used for conflict detection.
   * And it is optional, because it is generated by Hoodie/PouchDB and only exists once it is saved.
   */
  _rev?: string
  /**
   * Is this document deleted?
   * 
   * True if deleted. Undefined or false if not.
   * It is optional, because it is generated by Hoodie/PouchDB and only exists once it is saved.
   */
  _deleted?: boolean
  /**
   * Time object.
   * 
   * It is optional, because it is generated by Hoodie/PouchDB and only exists once it is saved.
   */
  hoodie?: HoodieTimeObject
}

export interface AvatarData {
  name: string
  grid: string
  avatarIdentifier: string
  dataSaveId: string
}

export interface SavedAvatarData extends AvatarData, HoodieObject {}

export interface Grid extends HoodieObject {
  name: string
  loginURL: string
}

export enum Maturity {
  General,
  Moderate,
  Adult,
}
