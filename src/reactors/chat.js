import { createSelector } from 'reselect'

export const saveLocalChat = createSelector(
  [
    state => state.localChat,
    state => state.account.get('sync') &&
      state.account.getIn(['viewerAccount', 'loggedIn'])
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

    return async (dispatch, getState, { hoodie }) => {
      const messages = messagesToSave.map(msg => msg.toJSON())

      dispatch({
        type: 'StartSavingLocalChatMessages',
        saving: messages.map(msg => msg._id)
      })

      const saved = await hoodie.cryptoStore.updateOrAdd(messages)

      const didError = []

      for (let i = 0; i < saved.length; i += 1) {
        const msg = saved[i]
        if (msg instanceof Error) {
          didError.push(messages[i]._id)
        }
      }

      dispatch({
        type: 'didSaveLocalChatMessage',
        saved: saved.filter(msg => !didError.includes(msg._id)),
        didError
      })
    }
  }
)
