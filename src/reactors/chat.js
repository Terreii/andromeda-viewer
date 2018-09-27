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

export const saveIMChat = createSelector(
  [
    state => state.IMs,
    getShouldSaveChat
  ],
  (IMs, shouldSaveChat) => {
    if (!shouldSaveChat || !IMs.some(chat => chat.get('hasUnsavedMSG'))) return null

    return async (dispatch, getState, { hoodie }) => {
      const unsavedChats = IMs.filter(chat => chat.get('hasUnsavedMSG'))

      const chatsToSave = []

      unsavedChats.forEach((chat, key) => {
        const messages = chat.get('messages')

        const toSaveMsg = messages.filter(msg => !msg.get('didSave')).toJSON().map(msg => {
          const toSave = Object.assign({}, msg)
          delete toSave.didSave
          return toSave
        })

        chatsToSave.push(...toSaveMsg)
      })

      dispatch({
        type: 'StartSavingIMMessages',
        chats: chatsToSave.reduce((all, msg) => {
          let messages = all[msg.chatUUID]

          if (messages == null) {
            messages = []
            all[msg.chatUUID] = messages
          }

          messages.push(msg._id)
          return all
        }, {})
      })

      const saved = await hoodie.cryptoStore.updateOrAdd(chatsToSave)

      const results = saved.reduce((all, msg, index) => {
        const chatUUID = chatsToSave[index].chatUUID
        let chat = all[chatUUID]

        if (chat == null) {
          chat = {
            saved: [],
            didError: []
          }
          all[chatUUID] = chat
        }

        if (msg instanceof Error) {
          chat.didError.push(chatsToSave[index]._id)
        } else {
          chat.saved.push(msg)
        }

        return all
      }, {})

      dispatch({
        type: 'didSaveIMMessages',
        chats: results
      })
    }
  }
)
