// Types for inventory

/**
 * Types for Assets on the grid.
 */
export enum AssetType {
  /**
   * Unknown asset type.
   */
  Unknown = -1,
  /**
   * Texture asset, stores in JPEG2000 J2C stream format.
   */
  Texture = 0,
  /**
   * Sound asset.
   */
  Sound = 1,
  /**
   * Calling card for another avatar.
   */
  CallingCard = 2,
  /**
   * Link to a location in world.
   */
  Landmark = 3,
  /**
   * Legacy script asset.
   * @deprecated
   */
  ObsoleteScript = 4,
  /**
   * Collection of textures and parameters that can be worn by an avatar.
   */
  Clothing = 5,
  /**
   * Primitive that can contain textures, sounds, scripts and more.
   */
  Object = 6,
  /**
   * Notecard asset.
   */
  Notecard = 7,
  /**
   * Holds a collection of inventory items. __Category__ in the Linden Viewer.
   */
  Folder = 8,
  /**
   * Linden scripting language script.
   */
  LSLText = 10,
  /**
   * LSO bytecode for a script.
   */
  LSLByteCode = 11,
  /**
   * Uncompressed TGA texture.
   */
  TextureTGA = 12,
  /**
   * Collection of textures and shape parameters that can be worn as a avatar part.
   */
  Bodypart = 13,
  /**
   * Uncompressed sound.
   */
  SoundWAV = 17,
  /**
   * Uncompressed TGA non-square image, not to be used as a texture!
   */
  ImageTGA = 18,
  /**
   * Compressed JPEG non-square image, not to be used as a texture!
   */
  ImageJPEG = 19,
  /**
   * Animation asset.
   */
  Animation = 20,
  /**
   * Sequence of animations, sounds, chat, and pauses.
   */
  Gesture = 21,
  /**
   * Simstate file
   */
  Simstate = 22,
  /**
   * Link to another inventory item.
   */
  Link = 24,
  /**
   * Link to another inventory folder.
   */
  LinkFolder = 25,
  /**
   * Marketplace folder. Same as a Category/Folder, but with different display methods.
   */
  MarketplaceFolder = 26,
  /**
   * Linden mesh format for 3D mesh objects.
   */
  Mesh = 49
}

export enum FolderType {
  /**
   * None folder.
   * 
   * No asset type defaults to this folder.
   */
  None = -1,
  /**
   * Texture folder.
   */
  Texture = 0,
  /**
   * Sound folder.
   */
  Sound = 1,
  /**
   * Calling card folder.
   */
  CallingCard = 2,
  /**
   * Landmark folder.
   */
  Landmark = 3,
  /**
   * Clothing folder.
   */
  Clothing = 5,
  /**
   * Object folder.
   */
  Object = 6,
  /**
   * Notecord folder.
   */
  Notecard = 7,
  /**
   * Root folder.
   * 
   This contains all other folders.
   */
  Root = 8,
  /**
   * Non-conformant OpenSim root folder.
   * 
   * @deprecated No longer used, please use {@link FolderType.Root}.
   */
  OldOpenSimRoot = 9,
  /**
   * LSLText folder.
   */
  LSLText = 10,
  /**
   * Bodyparts folder.
   */
  BodyPart = 13,
  /**
   * Trash folder.
   */
  Trash = 14,
  /**
   * Snapshot folder.
   */
  Snapshot = 15,
  /**
   * Lost and found folder.
   */
  LostAndFound = 16,
  /**
   * Animation folder.
   */
  Animation = 20,
  /**
   * Gesture folder.
   */
  Gesture = 21,
  /**
   * Favorite locations folder.
   */
  Favorites = 23,
  /**
   * Ensemble beginning range.
   */
  EnsembleStart = 26,
  /**
   * Ensemble ending range.
   */
  EnsembleEnd = 45,
  /**
   * Current outfit folder.
   */
  CurrentOutfit = 46,
  /**
   * Outfit folder.
   */
  Outfit = 47,
  /**
   * My outfits folder.
   */
  MyOutfits = 48,
  /**
   * Mesh folder.
   */
  Mesh = 49,
  /**
   * Marketplace direct delivery inbox (Received items).
   */
  Inbox = 50,
  /**
   * Marketplace direct delivery outbox.
   */
  Outbox = 51,
  /**
   * Basic root folder.
   */
  BasicRoot = 52,
  /**
   * Marketplace listings folder.
   */
  MarketplaceListings = 53,
  /**
   * Marketplace stock folder.
   */
  MarketplaceStock = 54,
  /**
   * Hypergrid Suitcase folder.
   */
  Suitcase = 100,
}

export interface Folder {
  name: string
  version: number
  folderId: string
  parentId: string
  typeDefault: FolderType
  children: string[]
}
