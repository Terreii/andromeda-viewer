import { createSelector } from 'reselect'

import {
  saveLocalChatMessages,
  saveIMChatInfos,
  saveIMChatMessages
} from '../actions/chatMessageActions'

import { selectLocalChat } from '../reducers/localChat'

import { getShouldSaveChat } from '../selectors/chat'
import { selectIMChats } from '../reducers/imChat'

export const saveLocalChat = createSelector(
  [
    selectLocalChat,
    getShouldSaveChat
  ],
  (localChat, shouldSaveChat) => {
    if (!shouldSaveChat) return null

    const messagesToSave = []

    for (let i = localChat.length - 1; i >= 0; i -= 1) {
      const msg = localChat[i]

      if (msg.didSave) {
        break
      } else {
        messagesToSave.push(msg)
      }
    }

    if (messagesToSave.length === 0) return null

    return saveLocalChatMessages()
  }
)

export const saveIMChatInfo = createSelector(
  [
    selectIMChats,
    getShouldSaveChat
  ],
  (ims, shouldSaveChat) => {
    if (!shouldSaveChat || Object.values(ims).every(chat => chat.didSaveChatInfo)) return null

    return saveIMChatInfos()
  }
)

export const saveIMChat = createSelector(
  [
    selectIMChats,
    getShouldSaveChat
  ],
  (ims, shouldSaveChat) => {
    if (!shouldSaveChat || !Object.values(ims).some(chat => chat.hasUnsavedMSG)) return null

    return saveIMChatMessages()
  }
)
