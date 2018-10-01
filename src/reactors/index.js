// combines all reactors into an array

import { saveLocalChat, saveIMChatInfo, saveIMChat } from './chat'
import { groupsDidLoad } from './group'

export default [
  saveLocalChat,
  saveIMChatInfo,
  saveIMChat,
  groupsDidLoad
]
