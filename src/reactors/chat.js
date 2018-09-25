import { createSelector } from 'reselect'

import { saveLocalChatMessages } from '../actions/chatMessageActions'

import { getLocalChat, getShouldSaveChat } from '../selectors/chat'

export const saveLocalChat = createSelector(
  [
    getLocalChat,
    getShouldSaveChat
  ],
  (localChat, shouldSaveChat) => {
    if (!shouldSaveChat) return null

    const messagesToSave = []

    for (let i = localChat.size - 1; i >= 0; i -= 1) {
      const msg = localChat.get(i)

      if (msg.get('didSave')) {
        break
      } else {
        messagesToSave.push(msg)
      }
    }

    if (messagesToSave.length === 0) return null

    return saveLocalChatMessages(messagesToSave)
  }
)
