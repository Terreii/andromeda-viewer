// combines all reactors into an array

import { saveLocalChat, saveIMChatInfo, saveIMChat } from './chat'
import { groupsDidLoad } from './group'
import { loadNames } from './names'

const reactors = [
  saveLocalChat,
  saveIMChatInfo,
  saveIMChat,
  groupsDidLoad,
  loadNames
]

export default reactors
